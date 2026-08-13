const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const { pool } = require('./lib/db');
const auth = require('./lib/auth');
const content = require('./lib/content');
const catalog = require('./lib/catalog');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// --- estáticos ---
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), { maxAge: '7d' }));
app.get('/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'public/styles.css')));
app.get('/app.js', (req, res) => res.sendFile(path.join(__dirname, 'public/app.js')));
app.get('/healthz', (req, res) => res.json({ ok: true }));

const TEMPLATE = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const roleClient = (rol) => (rol === 'admin_sitio' ? 'admin' : 'cliente');

// ============ AUTH ============
app.post('/api/auth/register', async (req, res) => {
  try {
    let { nombre, email, whatsapp, password } = req.body || {};
    email = (email || '').trim().toLowerCase();
    nombre = (nombre || '').trim();
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Completa nombre, correo y contraseña.' });
    if (String(password).length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Correo inválido.' });
    const ex = await pool.query('SELECT 1 FROM web_usuarios WHERE lower(email)=$1', [email]);
    if (ex.rowCount) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    const ph = await auth.hash(password);
    const { rows } = await pool.query(
      'INSERT INTO web_usuarios (nombre,email,password_hash,whatsapp,rol) VALUES ($1,$2,$3,$4,$5) RETURNING id,rol,nombre',
      [nombre, email, ph, whatsapp || null, 'cliente']
    );
    auth.setCookie(res, auth.sign(rows[0]));
    res.json({ ok: true, role: roleClient(rows[0].rol) });
  } catch (e) { console.error('register', e.message); res.status(500).json({ error: 'No se pudo crear la cuenta.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    let { email, password } = req.body || {};
    email = (email || '').trim().toLowerCase();
    const { rows } = await pool.query(
      'SELECT id,rol,nombre,password_hash,activo FROM web_usuarios WHERE lower(email)=$1', [email]
    );
    if (!rows.length || rows[0].activo === false) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    const ok = await auth.compare(password || '', rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    auth.setCookie(res, auth.sign(rows[0]));
    pool.query('UPDATE web_usuarios SET last_login=NOW() WHERE id=$1', [rows[0].id]).catch(() => {});
    res.json({ ok: true, role: roleClient(rows[0].rol) });
  } catch (e) { console.error('login', e.message); res.status(500).json({ error: 'Error al iniciar sesión.' }); }
});

app.post('/api/auth/logout', (req, res) => { auth.clearCookie(res); res.json({ ok: true }); });

function requireAuth(req, res, next) {
  const s = auth.getSession(req);
  if (!s) return res.status(401).json({ error: 'Debes iniciar sesión.' });
  req.user = s; next();
}
function requireAdmin(req, res, next) {
  const s = auth.getSession(req);
  if (!s || s.rol !== 'admin_sitio') return res.status(403).json({ error: 'Acceso restringido.' });
  req.user = s; next();
}

// ============ CLIENTE ============
app.post('/api/favoritos', requireAuth, async (req, res) => {
  try {
    const { cod } = req.body || {};
    if (!cod) return res.status(400).json({ error: 'cod requerido' });
    await pool.query('INSERT INTO web_favoritos (usuario_id,propiedad_codigo) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.user.id, cod]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});
app.delete('/api/favoritos', requireAuth, async (req, res) => {
  try {
    const { cod } = req.body || {};
    await pool.query('DELETE FROM web_favoritos WHERE usuario_id=$1 AND propiedad_codigo=$2', [req.user.id, cod]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});
app.post('/api/visitas', requireAuth, async (req, res) => {
  try {
    const { cod } = req.body || {};
    if (!cod) return res.status(400).json({ error: 'cod requerido' });
    await pool.query('INSERT INTO web_visitas (usuario_id,propiedad_codigo) VALUES ($1,$2)', [req.user.id, cod]);
    await pool.query(
      "INSERT INTO web_leads (nombre,email,whatsapp,mensaje,origen,propiedad_codigo) SELECT nombre,email,whatsapp,'Solicitud de visita desde la web','visita',$2 FROM web_usuarios WHERE id=$1",
      [req.user.id, cod]
    ).catch(() => {});
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// ============ FORMULARIOS PÚBLICOS ============
app.post('/api/leads', async (req, res) => {
  try {
    let { nombre, apellido, email, whatsapp, mensaje, origen, cod } = req.body || {};
    origen = ['contacto', 'vende', 'busqueda', 'favorito', 'visita'].includes(origen) ? origen : 'contacto';
    if (!email && !whatsapp) return res.status(400).json({ error: 'Deja un correo o WhatsApp.' });
    await pool.query(
      'INSERT INTO web_leads (nombre,apellido,email,whatsapp,mensaje,origen,propiedad_codigo) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [nombre || null, apellido || null, email || null, whatsapp || null, mensaje || null, origen, cod || null]
    );
    res.json({ ok: true });
  } catch (e) { console.error('lead', e.message); res.status(500).json({ error: 'No se pudo enviar.' }); }
});
app.post('/api/feedback', async (req, res) => {
  try {
    const { estrellas, le_gusto, mejoraria, nombre } = req.body || {};
    await pool.query('INSERT INTO web_feedback (estrellas,le_gusto,mejoraria,nombre) VALUES ($1,$2,$3,$4)',
      [estrellas || null, le_gusto || null, mejoraria || null, nombre || null]);
    res.json({ ok: true });
  } catch (e) { res.json({ ok: true }); }
});

// ============ ADMIN ============
app.post('/api/admin/content', requireAdmin, async (req, res) => {
  try {
    const { clave, valor } = req.body || {};
    const allow = ['hero', 'founder', 'sell', 'video', 'stats', 'social', 'contacto', 'destacados'];
    if (!allow.includes(clave)) return res.status(400).json({ error: 'clave inválida' });
    await pool.query(
      'INSERT INTO web_contenido (clave,valor,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (clave) DO UPDATE SET valor=EXCLUDED.valor, updated_at=NOW()',
      [clave, JSON.stringify(valor)]
    );
    res.json({ ok: true });
  } catch (e) { console.error('content', e.message); res.status(500).json({ error: 'No se pudo guardar.' }); }
});

app.post('/api/admin/propiedad', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { cod, dest, descripcion, fotos, video } = req.body || {};
    if (!cod) return res.status(400).json({ error: 'cod requerido' });
    await client.query('BEGIN');
    if (descripcion && descripcion.trim()) {
      await client.query(
        'INSERT INTO web_descripcion_override (propiedad_codigo,descripcion_web,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (propiedad_codigo) DO UPDATE SET descripcion_web=EXCLUDED.descripcion_web, updated_at=NOW()',
        [cod, descripcion.trim()]
      );
    } else {
      await client.query('DELETE FROM web_descripcion_override WHERE propiedad_codigo=$1', [cod]);
    }
    await client.query("DELETE FROM web_propiedad_media WHERE propiedad_codigo=$1 AND tipo='foto'", [cod]);
    if (Array.isArray(fotos)) {
      let o = 0;
      for (const u of fotos) {
        if (u && u.trim()) await client.query("INSERT INTO web_propiedad_media (propiedad_codigo,tipo,url,orden) VALUES ($1,'foto',$2,$3)", [cod, u.trim(), o++]);
      }
    }
    await client.query("DELETE FROM web_propiedad_media WHERE propiedad_codigo=$1 AND tipo='youtube'", [cod]);
    if (video && video.trim()) await client.query("INSERT INTO web_propiedad_media (propiedad_codigo,tipo,url,orden) VALUES ($1,'youtube',$2,0)", [cod, video.trim()]);

    const cur = await client.query("SELECT valor FROM web_contenido WHERE clave='destacados'");
    let arr = (cur.rowCount && Array.isArray(cur.rows[0].valor)) ? cur.rows[0].valor.slice() : [];
    arr = arr.filter((c) => c !== cod);
    if (dest) arr.push(cod);
    await client.query(
      "INSERT INTO web_contenido (clave,valor,updated_at) VALUES ('destacados',$1,NOW()) ON CONFLICT (clave) DO UPDATE SET valor=EXCLUDED.valor, updated_at=NOW()",
      [JSON.stringify(arr)]
    );
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('admprop', e.message);
    res.status(500).json({ error: 'No se pudo guardar.' });
  } finally { client.release(); }
});

// ============ PÁGINA (SPA + datos inyectados) ============
async function buildBoot(req) {
  const s = auth.getSession(req);
  const raw = await content.getRaw();
  const props = await catalog.getCatalog(raw);
  const site = content.buildSite(raw, props);
  const boot = { props, site, auth: { logged: false, role: null, name: '' }, favs: [] };
  if (s) {
    boot.auth = { logged: true, role: roleClient(s.rol), name: s.nombre || '' };
    try {
      const f = await pool.query('SELECT propiedad_codigo FROM web_favoritos WHERE usuario_id=$1', [s.id]);
      boot.favs = f.rows.map((r) => r.propiedad_codigo);
    } catch (e) {}
    if (s.rol === 'admin_sitio') {
      try {
        const [u, l] = await Promise.all([
          pool.query('SELECT nombre,apellido,email,rol,created_at FROM web_usuarios ORDER BY created_at DESC LIMIT 200'),
          pool.query('SELECT nombre,email,whatsapp,origen,mensaje,created_at FROM web_leads ORDER BY created_at DESC LIMIT 200'),
        ]);
        boot.adminData = { usuarios: u.rows, leads: l.rows };
      } catch (e) { boot.adminData = { usuarios: [], leads: [] }; }
    }
  }
  return { boot, props, site };
}

app.get('*', async (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not found' });
  try {
    const { boot, props, site } = await buildBoot(req);
    const title = 'KQ Real Estate — Propiedades premium en Lima & playa';
    const desc = (site.hero && site.hero.sub) || 'Inmobiliaria boutique en Lima y balnearios del sur.';
    const canon = 'https://www.kq-realestate.cloud' + (req.path === '/' ? '' : req.path);
    const jsonld = {
      '@context': 'https://schema.org', '@type': 'RealEstateAgent',
      name: 'KQ Real Estate — Lima & Beach Properties',
      url: 'https://www.kq-realestate.cloud', areaServed: 'Lima, Perú',
      founder: { '@type': 'Person', name: 'Karen Quezada' },
    };
    const noscript = `<h1>${esc(title)}</h1><p>${esc(desc)}</p><ul>`
      + props.map((p) => `<li>${esc(p.tit)} — ${esc(p.dist)}</li>`).join('') + '</ul>';
    const html = TEMPLATE
      .replace(/__TITLE__/g, esc(title))
      .replace(/__DESC__/g, esc(desc))
      .replace(/__CANON__/g, esc(canon))
      .replace('__JSONLD__', `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`)
      .replace('__NOSCRIPT__', noscript)
      .replace('__BOOT_JSON__', JSON.stringify(boot).replace(/</g, '\\u003c'));
    res.set('Content-Type', 'text/html; charset=utf-8').send(html);
  } catch (e) {
    console.error('page', e.message);
    res.status(500).send('Error del servidor');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('KQ Real Estate web escuchando en :' + PORT));
