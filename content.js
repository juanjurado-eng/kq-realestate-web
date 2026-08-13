const { pool } = require('./db');

// Valores por defecto de las secciones (se sobreescriben desde el admin → web_contenido).
const DEFAULTS = {
  hero: {
    eyebrow: 'Inmobiliaria boutique · Lima & playa',
    title: "Encuentra el lugar donde <span class='sig'>quieres vivir</span>.",
    sub: 'Propiedades residenciales de alto nivel en Lima y los mejores balnearios del sur. Recorre nuestras propiedades en video y encuentra tu próximo hogar.',
  },
  founder: {
    name: 'Karen Quezada',
    role: 'Fundadora & CEO — KQ Real Estate',
    quote: 'Fundé KQ Real Estate para cambiar la forma en que las personas viven la compra y la venta de un inmueble: con transparencia, criterio y un trato verdaderamente humano.',
    body: 'Karen Quezada es fundadora y CEO de KQ Real Estate — Lima & Beach Properties. Agente inmobiliaria certificada (REG. 28319-PN-MVCS), ha acompañado a familias e inversionistas a encontrar y comercializar propiedades de alto valor en Lima y los balnearios del sur. Su enfoque combina un conocimiento profundo del mercado con un servicio boutique, cercano y de absoluta confianza.',
  },
  sell: {
    title: '¿Quieres vender o alquilar tu propiedad?',
    body: 'La comercializamos con estrategia de precio, marketing y fotografía profesional, y una red de compradores calificados. Tú te ocupas de vivir; nosotros del resto.',
  },
  video: { url: '', title: 'Video destacado', sub: 'Recorridos y propiedades del canal de Karen Quezada' },
  social: {
    ig: 'https://instagram.com/karenquezada_real_state',
    fb: 'https://facebook.com/Karenquezadainmobiliaria',
    tiktok: 'https://tiktok.com/@karen.agenteinmobiliario',
    yt: '',
  },
  contacto: { whatsapp: '996 044 424', email: 'kqv1101@hotmail.com' },
};

async function getRaw() {
  try {
    const { rows } = await pool.query('SELECT clave, valor FROM web_contenido');
    const m = {};
    rows.forEach((r) => { m[r.clave] = r.valor; });
    return m;
  } catch (e) {
    console.error('content.getRaw', e.message);
    return {};
  }
}

function buildSite(raw, props) {
  raw = raw || {};
  const site = {};
  for (const k of ['hero', 'founder', 'sell', 'video', 'social', 'contacto']) {
    site[k] = Object.assign({}, DEFAULTS[k], raw[k] || {});
  }
  const dists = [...new Set((props || []).map((p) => p.dist).filter(Boolean))];
  site.stats = Array.isArray(raw.stats) && raw.stats.length
    ? raw.stats
    : [
        { n: String((props || []).length), l: 'Propiedades activas' },
        { n: String(dists.length || 6), l: 'Zonas premium' },
        { n: '100%', l: 'Acompañamiento' },
        { n: 'Boutique', l: 'Servicio personalizado' },
      ];
  return site;
}

module.exports = { getRaw, buildSite, DEFAULTS };
