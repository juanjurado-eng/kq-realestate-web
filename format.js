// Utilidades de normalización compartidas por el servidor.
function num(v) {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  if (!isFinite(n)) return null;
  return n;
}

// Limpiador automático: quita emojis/viñetas y normaliza espacios.
// Mismo criterio que el limpiador del catálogo, aplicado también al vuelo.
function cleanText(s) {
  if (!s) return '';
  s = String(s);
  s = s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}\u{2728}\u{2B50}\u{2705}\u{274C}\u{2022}\u{2023}]/gu, '');
  return s.replace(/[ \t]+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').replace(/\n{3,}/g, '\n\n').trim();
}

// Deriva el tipo de "escena" (placeholder SVG) a partir de tipo/zona.
function deriveScene(tipo, dist) {
  tipo = (tipo || '').toLowerCase();
  const d = (dist || '').toLowerCase();
  const beachZone = /(playa|coral|asia|san bartolo|punta|balneario|sur chico|cerro azul|paracas)/.test(d);
  const isLot = /(terreno|lote)/.test(tipo);
  if (beachZone) return isLot ? 'lot' : 'beach';
  if (isLot) return 'lot';
  if (/penthouse/.test(tipo)) return 'penthouse';
  if (/casa/.test(tipo)) return 'house';
  if (/(oficina|local|comercial)/.test(tipo)) return 'office';
  return 'tower';
}

module.exports = { num, cleanText, deriveScene };
