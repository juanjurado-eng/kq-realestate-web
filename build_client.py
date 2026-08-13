# -*- coding: utf-8 -*-
"""Genera public/app.js, public/styles.css y los assets (logo, fuentes)
a partir del prototipo aprobado (generate_web.py), reemplazando la data
embebida por window.__BOOT__ (datos en vivo desde el servidor)."""
import base64, pathlib, sys, re

SRC = pathlib.Path('/home/claude/web/generate_web.py').read_text(encoding='utf-8')
OUT = pathlib.Path('/home/claude/web/kqv-web-app/public')
(OUT / 'assets' / 'fonts').mkdir(parents=True, exist_ok=True)

def must(cond, msg):
    if not cond:
        print('ERROR:', msg); sys.exit(1)

# ---------- CSS ----------
css = SRC.split('<style>', 1)[1].split('</style>', 1)[0]
css = css.replace("url(data:font/ttf;base64,__CORM__) format('truetype')", "url('/assets/fonts/corm.ttf') format('truetype')")
css = css.replace("url(data:font/ttf;base64,__CORMIT__) format('truetype')", "url('/assets/fonts/cormit.ttf') format('truetype')")
css = css.replace("url(data:font/ttf;base64,__JOST__) format('truetype')", "url('/assets/fonts/jost.ttf') format('truetype')")
must('__CORM__' not in css and '__JOST__' not in css, 'quedaron placeholders de fuente en el CSS')
(OUT / 'styles.css').write_text(css.strip() + '\n', encoding='utf-8')

# ---------- JS ----------
js = SRC.split('<script>', 1)[1].split('</script>', 1)[0]

# 1) Fuente de datos -> BOOT
before = js
js = js.replace('const PROPS = __DATA__;',
  'const BOOT = (window.__BOOT__) || {};\nconst PROPS = BOOT.props || [];')
must(js != before, 'no se encontró la línea de PROPS')

before = js
js = js.replace('const LOGO = "data:image/png;base64,__LOGO__";',
  'const LOGO = "/assets/logo.png";')
must(js != before, 'no se encontró la línea de LOGO')

# 2) Estado inicial desde BOOT (auth + favoritos)
before = js
js = js.replace('auth:{logged:false, role:null, name:""}', 'auth: (BOOT.auth || {logged:false, role:null, name:""})')
js = js.replace('favs:new Set(),', 'favs:new Set(BOOT.favs || []),')
must(js != before, 'no se pudo inyectar el estado inicial')

# 3) SITE: usar defaults del prototipo mezclados con BOOT.site
before = js
js = js.replace('const SITE = {', 'const SITE_SRC = {', 1)
must(js != before, 'no se encontró la definición de SITE')
anchor = '\n};\n\n/* ---------- SVG placeholders (elegantes, marca KQ) ---------- */'
must(anchor in js, 'no se encontró el cierre de SITE')
merge = ("\n};\n"
  "function deepMerge(a,b){ const o=Object.assign({},a||{}); for(const k in (b||{})){ const bv=b[k];"
  " if(bv && typeof bv==='object' && !Array.isArray(bv) && a && typeof a[k]==='object' && !Array.isArray(a[k])) o[k]=deepMerge(a[k],bv);"
  " else o[k]=bv; } return o; }\n"
  "const SITE = deepMerge(SITE_SRC, (BOOT.site)||{});\n\n"
  "/* ---------- SVG placeholders (elegantes, marca KQ) ---------- */")
js = js.replace(anchor, merge, 1)

# 4) Overrides reales (login/registro/favoritos/leads/admin) antes del router
overrides = pathlib.Path('/home/claude/web/kqv-web-app/_overrides.js').read_text(encoding='utf-8')
router_anchor = '/* ---------- router ---------- */'
must(router_anchor in js, 'no se encontró el bloque router')
js = js.replace(router_anchor, '\n' + overrides + '\n' + router_anchor, 1)

(OUT / 'app.js').write_text(js.strip() + '\n', encoding='utf-8')

# ---------- Assets ----------
def decode(txt_path, out_path):
    b64 = pathlib.Path(txt_path).read_text().strip()
    (out_path).write_bytes(base64.b64decode(b64))

decode('/home/claude/web/logo_b64.txt', OUT / 'assets' / 'logo.png')
decode('/home/claude/web/font_corm.txt', OUT / 'assets' / 'fonts' / 'corm.ttf')
decode('/home/claude/web/font_cormit.txt', OUT / 'assets' / 'fonts' / 'cormit.ttf')
decode('/home/claude/web/font_jost.txt', OUT / 'assets' / 'fonts' / 'jost.ttf')

print('OK styles.css:', (OUT/'styles.css').stat().st_size, 'bytes')
print('OK app.js:', (OUT/'app.js').stat().st_size, 'bytes')
print('OK logo.png:', (OUT/'assets'/'logo.png').stat().st_size, 'bytes')
for f in ['corm.ttf','cormit.ttf','jost.ttf']:
    print('OK', f, (OUT/'assets'/'fonts'/f).stat().st_size, 'bytes')
