const { pool } = require('./db');
const { cleanText, deriveScene, num } = require('./format');

// Lee columnas reales de una tabla (para mapear de forma tolerante).
async function tableColumns(t) {
  const { rows } = await pool.query(
    'SELECT column_name FROM information_schema.columns WHERE table_name=$1', [t]
  );
  return rows.map((r) => r.column_name);
}

function pick(row, cols, names) {
  for (const n of names) {
    if (cols.includes(n) && row[n] != null && row[n] !== '') return row[n];
  }
  return null;
}

// Devuelve el catálogo normalizado desde kqv_propiedades + media/overrides web.
async function getCatalog(raw) {
  raw = raw || {};
  let cols, rows;
  try {
    cols = await tableColumns('kqv_propiedades');
    const r = await pool.query('SELECT * FROM kqv_propiedades');
    rows = r.rows;
  } catch (e) {
    console.error('catalog: no se pudo leer kqv_propiedades:', e.message);
    return [];
  }

  // Filtra a "disponibles" si existe una columna de estado.
  const estadoCol = ['estado', 'disponibilidad', 'situacion', 'status'].find((c) => cols.includes(c));
  let list = rows;
  if (estadoCol) {
    const f = rows.filter((r) => {
      const v = String(r[estadoCol] || '').toLowerCase();
      return v === '' || /(dispon|activ|public|venta|alquil)/.test(v);
    });
    if (f.length) list = f;
  }

  // Media (fotos / youtube) y descripción curada por propiedad.
  const media = {};
  const ovr = {};
  try {
    const m = await pool.query("SELECT propiedad_codigo, tipo, url FROM web_propiedad_media WHERE activo=TRUE ORDER BY orden");
    m.rows.forEach((x) => {
      const b = (media[x.propiedad_codigo] = media[x.propiedad_codigo] || { foto: [], youtube: [] });
      (x.tipo === 'youtube' ? b.youtube : b.foto).push(x.url);
    });
  } catch (e) { /* tabla puede no existir aún */ }
  try {
    const o = await pool.query('SELECT propiedad_codigo, descripcion_web FROM web_descripcion_override');
    o.rows.forEach((x) => { ovr[x.propiedad_codigo] = x.descripcion_web; });
  } catch (e) { /* opcional */ }

  const destSet = Array.isArray(raw.destacados) ? new Set(raw.destacados) : null;

  const out = list.map((r, idx) => {
    const cod = String(pick(r, cols, ['codigo', 'cod', 'id_propiedad', 'sku']) || ('P' + (idx + 1)));
    const tipo = String(pick(r, cols, ['tipo', 'tipo_propiedad', 'categoria']) || 'departamento').toLowerCase();
    const dist = pick(r, cols, ['distrito', 'dist', 'zona', 'ubicacion_distrito']) || '';
    const venta = num(pick(r, cols, ['precio_venta', 'precio', 'venta', 'valor_venta', 'precio_usd']));
    const alq = num(pick(r, cols, ['precio_alquiler', 'alquiler', 'alq', 'renta', 'precio_alquiler_usd']));
    const operRaw = String(pick(r, cols, ['operacion', 'oper', 'tipo_operacion']) || '').toLowerCase();
    let oper = (operRaw.includes('alq') && operRaw.includes('vent')) ? 'venta_y_alquiler'
      : operRaw.includes('alq') ? 'alquiler'
      : operRaw.includes('vent') ? 'venta'
      : (venta && alq) ? 'venta_y_alquiler' : (alq && !venta) ? 'alquiler' : 'venta';

    const descSrc = ovr[cod] != null ? ovr[cod] : (pick(r, cols, ['descripcion', 'desc', 'detalle', 'descripcion_web']) || '');
    const featsRaw = pick(r, cols, ['caracteristicas', 'features', 'feats', 'amenities']);
    let feats = [];
    if (Array.isArray(featsRaw)) feats = featsRaw;
    else if (typeof featsRaw === 'string') feats = featsRaw.split(/[,;|\n]/).map((s) => cleanText(s)).filter(Boolean);

    const m = media[cod] || { foto: [], youtube: [] };
    const video = (m.youtube && m.youtube[0]) || pick(r, cols, ['video', 'youtube', 'video_url']) || '';

    return {
      cod,
      tit: cleanText(pick(r, cols, ['titulo', 'tit', 'nombre', 'title']) || (tipo + ' en ' + dist)),
      dist,
      dir: pick(r, cols, ['direccion', 'dir', 'ubicacion']) || dist,
      tipo,
      oper,
      dorm: num(pick(r, cols, ['dormitorios', 'dorm', 'habitaciones', 'cuartos'])),
      ban: num(pick(r, cols, ['banos', 'ban', 'baños', 'servicios_higienicos'])),
      est: num(pick(r, cols, ['estacionamientos', 'cocheras', 'est', 'garajes'])),
      area: num(pick(r, cols, ['area', 'area_m2', 'metraje', 'area_total', 'm2', 'superficie'])),
      piso: pick(r, cols, ['piso', 'nivel']),
      ant: num(pick(r, cols, ['antiguedad', 'ant', 'anos', 'años'])),
      vista: pick(r, cols, ['vista']) || '',
      venta, alq,
      consultar: !venta && !alq,
      desc: cleanText(descSrc),
      descOverride: ovr[cod] || '',
      feats,
      fotos: (m.foto || []),
      video,
      scene: deriveScene(tipo, dist),
      dest: destSet ? destSet.has(cod) : idx < 6,
    };
  });

  return out;
}

module.exports = { getCatalog };
