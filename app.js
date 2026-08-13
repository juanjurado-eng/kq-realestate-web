const BOOT = (window.__BOOT__) || {};
const PROPS = BOOT.props || [];
const LOGO = "/assets/logo.png";
const WA = "https://wa.me/51996044424";
const FMT = n => n==null? "" : "$"+Number(n).toLocaleString("en-US");
const state = { auth: (BOOT.auth || {logged:false, role:null, name:""}), favs:new Set(BOOT.favs || []), filters:{oper:"",dist:"",tipo:"",dorm:"",precio:""}, sort:"recent", view:"grid" };
const DISTRICTS = [...new Set(PROPS.map(p=>p.dist))];
const TIPO_LBL = {departamento:"Departamento",flat:"Flat",duplex:"Dúplex",penthouse:"Penthouse",casa:"Casa",terreno:"Terreno",oficina:"Oficina",local:"Local"};
const OPER_LBL = {venta:"Venta",alquiler:"Alquiler",venta_y_alquiler:"Venta y alquiler"};
function priceMain(p){
 if(p.consultar) return "Precio a consultar";
 if(p.oper==='alquiler') return FMT(p.alq)+' <small>/ mes</small>';
 if(p.venta) return FMT(p.venta)+(p.oper==='venta_y_alquiler'&&p.alq?` <small>· alq. ${FMT(p.alq)}</small>`:'');
 if(p.alq) return FMT(p.alq)+' <small>/ mes</small>';
 return "Precio a consultar";
}
function ytId(url){ if(!url) return null; const m=String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; }
/* Limpiador automático: cualquier texto que llegue del catálogo se sanea antes de mostrarse en la web */
function cleanText(s){ if(!s) return '';
 s=s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}\u{2728}\u{2B50}\u{2705}\u{274C}\u{2022}\u{2023}]/gu,'');
 return s.replace(/[ \t]+/g,' ').replace(/\s+([,.;:!?])/g,'$1').replace(/\n{3,}/g,'\n\n').trim(); }
function renderDesc(text){ const t=cleanText(text); if(!t) return '';
 const lines=t.split('\n').map(x=>x.trim()).filter(Boolean); let html='',bul=[];
 const flush=()=>{ if(bul.length){ html+='<ul class="desc-list">'+bul.map(b=>`<li>${b}</li>`).join('')+'</ul>'; bul=[]; } };
 lines.forEach(ln=>{ const sentence=/[.!?]$/.test(ln)||ln.split(' ').length>13; if(sentence){flush();html+=`<p>${ln}</p>`;} else bul.push(ln); });
 flush(); return html; }

/* Contenido editable del sitio (en producción vive en la BD y se edita desde el admin) */
const SITE_SRC = {
 hero:{ eyebrow:"Inmobiliaria boutique · Lima & playa",
        title:"Encuentra el lugar donde <span class='sig'>quieres vivir</span>.",
        sub:"Propiedades residenciales de alto nivel en Lima y los mejores balnearios del sur. Asesoría real para decisiones importantes." },
 founder:{ name:"Karen Quezada", role:"Fundadora & CEO — KQ Real Estate",
   quote:"Fundé KQ Real Estate para cambiar la forma en que las personas viven la compra y la venta de un inmueble: con transparencia, criterio y un trato verdaderamente humano.",
   body:"Karen Quezada es fundadora y CEO de KQ Real Estate — Lima & Beach Properties. Agente inmobiliaria certificada (REG. 28319-PN-MVCS), ha acompañado a familias e inversionistas a encontrar y comercializar propiedades de alto valor en Lima y los balnearios del sur. Su enfoque combina un conocimiento profundo del mercado con un servicio boutique, cercano y de absoluta confianza. Construyó KQ Real Estate sobre una convicción simple: cada propiedad es una decisión de vida y merece asesorarse con honestidad y excelencia.",
   ytChannel:"", // canal de YouTube de Karen (pendiente)
 },
 sell:{ title:"¿Quieres vender o alquilar tu propiedad?",
        body:"La comercializamos con estrategia de precio, marketing y fotografía profesional, y una red de compradores calificados. Tú te ocupas de vivir; nosotros del resto." },
 video:{ url:"", title:"Video destacado", sub:"Recorridos y propiedades del canal de Karen Quezada" },
 stats:[ {n:PROPS.length+"", l:"Propiedades activas"}, {n:DISTRICTS.length+"", l:"Zonas premium"}, {n:"100%", l:"Acompañamiento"}, {n:"Boutique", l:"Servicio personalizado"} ],
 social:{ ig:"https://instagram.com/karenquezada_real_state", fb:"https://facebook.com/Karenquezadainmobiliaria", tiktok:"https://tiktok.com/@karen.agenteinmobiliario", yt:"" },
 contacto:{ whatsapp:"996 044 424", email:"kqv1101@hotmail.com" }
};
function deepMerge(a,b){ const o=Object.assign({},a||{}); for(const k in (b||{})){ const bv=b[k]; if(bv && typeof bv==='object' && !Array.isArray(bv) && a && typeof a[k]==='object' && !Array.isArray(a[k])) o[k]=deepMerge(a[k],bv); else o[k]=bv; } return o; }
const SITE = deepMerge(SITE_SRC, (BOOT.site)||{});

/* ---------- SVG placeholders (elegantes, marca KQ) ---------- */
function scene(type, i){
 const grads=[["#20343a","#0f1a1e"],["#33291a","#171009"],["#1c2b33","#0e171c"],["#2a2620","#14110c"],["#233a33","#0f1c18"],["#2b2118","#150f09"]];
 const g=grads[i%grads.length];
 const gold="#D9B45B", goldd="#b98f2e", teal="#3f8e8e", cream="#efe6d2";
 let art="";
 if(type==="tower"||type==="office"){
   art=`<g stroke="${gold}" stroke-width="1.4" fill="none" opacity=".9">
     <rect x="120" y="70" width="70" height="150"/><rect x="200" y="40" width="80" height="180"/><rect x="290" y="95" width="60" height="125"/>
     <g stroke="${gold}" stroke-width="1" opacity=".55">
     <line x1="132" y1="90" x2="178" y2="90"/><line x1="132" y1="115" x2="178" y2="115"/><line x1="132" y1="140" x2="178" y2="140"/><line x1="132" y1="165" x2="178" y2="165"/><line x1="132" y1="190" x2="178" y2="190"/>
     <line x1="214" y1="70" x2="266" y2="70"/><line x1="214" y1="98" x2="266" y2="98"/><line x1="214" y1="126" x2="266" y2="126"/><line x1="214" y1="154" x2="266" y2="154"/><line x1="214" y1="182" x2="266" y2="182"/>
     <line x1="300" y1="120" x2="340" y2="120"/><line x1="300" y1="150" x2="340" y2="150"/><line x1="300" y1="180" x2="340" y2="180"/></g></g>`;
 } else if(type==="penthouse"){
   art=`<g fill="none" stroke="${gold}" stroke-width="1.4"><circle cx="330" cy="70" r="20" opacity=".8"/>
     <rect x="150" y="90" width="150" height="130"/><line x1="150" y1="130" x2="300" y2="130"/>
     <rect x="165" y="150" width="50" height="70" stroke-width="1" opacity=".6"/><rect x="235" y="150" width="50" height="70" stroke-width="1" opacity=".6"/>
     <path d="M150 90 L225 55 L300 90" /></g>`;
 } else if(type==="house"){
   art=`<g fill="none" stroke="${gold}" stroke-width="1.5"><path d="M120 210 V120 L235 60 L350 120 V210"/><path d="M120 120 L235 60 L350 120"/>
     <rect x="205" y="150" width="60" height="60"/><rect x="150" y="140" width="34" height="34" stroke-width="1" opacity=".6"/><rect x="286" y="140" width="34" height="34" stroke-width="1" opacity=".6"/></g>
     <path d="M60 214 H420" stroke="${teal}" stroke-width="2" opacity=".5"/>`;
 } else if(type==="beach"){
   art=`<g fill="none" stroke="${gold}" stroke-width="1.5"><circle cx="330" cy="70" r="18" opacity=".85"/><path d="M150 200 V130 L235 90 L320 130 V200"/><path d="M150 130 L235 90 L320 130"/><rect x="215" y="150" width="42" height="50"/></g>
     <g stroke="${teal}" stroke-width="2" fill="none" opacity=".7"><path d="M60 210 q40 -14 80 0 t80 0 t80 0 t80 0"/><path d="M60 228 q40 -14 80 0 t80 0 t80 0 t80 0" opacity=".5"/></g>`;
 } else { /* lot */
   art=`<g fill="none" stroke="${gold}" stroke-width="1.6" stroke-dasharray="7 7"><rect x="120" y="80" width="230" height="130"/></g>
     <g stroke="${teal}" stroke-width="2" fill="none" opacity=".7"><path d="M60 214 q40 -12 80 0 t80 0 t80 0 t80 0"/></g>
     <g fill="${gold}" opacity=".85"><circle cx="235" cy="145" r="3"/></g>`;
 }
 const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='470' height='300' viewBox='0 0 470 300'>
   <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${g[0]}'/><stop offset='1' stop-color='${g[1]}'/></linearGradient></defs>
   <rect width='470' height='300' fill='url(#g)'/>
   <text x='420' y='268' font-family='Corm,serif' font-size='120' fill='#ffffff' opacity='0.05' text-anchor='end'>KQ</text>
   ${art}</svg>`;
 return "data:image/svg+xml;utf8,"+encodeURIComponent(svg);
}

/* ---------- icons ---------- */
const I = {
 bed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M3 18v2M21 18v2M6 10V8a2 2 0 0 1 2-2h3v4"/></svg>',
 bath:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z M6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2M7 19l-1 2M18 19l1 2"/></svg>',
 car:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13M5 13h14v4H5zM7 17v2M17 17v2M7 15h.01M17 15h.01"/></svg>',
 area:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4zM4 9h4M4 15h4M16 4v4M9 20v-4"/></svg>',
 pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.9-9.7-9.3C.6 8.2 2.3 5 5.5 5c2 0 3.3 1.2 4.5 2.6C11.2 6.2 12.5 5 14.5 5c3.2 0 4.9 3.2 3.2 6.7C19.5 16.1 12 21 12 21z"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
 shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
 key:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="4"/><path d="M11 11l8 8M17 17l2-2M14 14l2-2"/></svg>',
 chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2h8l4 4v16H6zM14 2v4h4M9 13h6M9 17h6"/></svg>',
 tour:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 3a14 14 0 0 0 0 18M12 3a14 14 0 0 1 0 18M3 12h18"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.8 5.9 20.4 7.2 13.7l-5-4.6 6.8-.8z"/></svg>',
 ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
 fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 8.5V7c0-.7.2-1.1 1.2-1.1H17V3.2C16.6 3.1 15.8 3 14.9 3c-2 0-3.4 1.2-3.4 3.5v2H9v3.3h2.5V22h3.5v-8.2h2.3l.4-3.3z"/></svg>',
 tiktok:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8a4.8 4.8 0 0 1-3-4.3h-3v13.2a2.3 2.3 0 1 1-2.3-2.3c.24 0 .47.03.7.1V6.6a5.6 5.6 0 0 0-.7-.05A5.55 5.55 0 1 0 12.4 12V8.1a7.9 7.9 0 0 0 4.2 1.2V5.8z"/></svg>',
 wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.8 2 .9 2.1.1.1.1.3 0 .5-.3.6-.6.8-.8 1.1-.2.2-.3.4-.1.7.2.4.9 1.5 2 2.4 1.3 1.2 2.4 1.5 2.7 1.7.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.7-.1.3.1 1.8.9 2.1 1 .3.2.5.2.6.4.1.1.1.7-.1 1.3z"/></svg>',
 menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
 settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5L3 11a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h5l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z"/></svg>',
 users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 20a5.5 5.5 0 0 0-3-5"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 11l8-7 8 7M6 10v9h12v-9"/></svg>',
 layout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
 leads:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3h18v14H7l-4 4z"/><path d="M8 9h8M8 12h5"/></svg>',
 logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9M10 12h11M18 9l3 3-3 3"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>',
 mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 6.5 12 13l9-6.5"/></svg>',
};
function ic(name,cls){return `<span class="ic ${cls||''}" style="display:inline-flex">${I[name]}</span>`}

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>t.classList.remove('show'),2600);}
function go(h){location.hash=h;window.scrollTo(0,0);}

/* ---------- SHARED ---------- */
function nav(top){
 const links=[["#/","Inicio"],["#/propiedades","Propiedades"],["#/mapa","Mapa"],["#/servicios","Servicios"],["#/nosotros","Nosotros"],["#/contacto","Contacto"]];
 const cur=location.hash||"#/";
 const cta = state.auth.logged
   ? `<a class="navlink" onclick="go('#/cuenta')">Mi cuenta</a>${state.auth.role==='admin'?`<button class="btn btn-gold" onclick="go('#/admin')">Administración</button>`:`<button class="btn btn-outline-l" onclick="logout()">Salir</button>`}`
   : `<a class="navlink" onclick="go('#/login')">Ingresar</a><button class="btn btn-gold" onclick="go('#/registro')">Registrarse</button>`;
 return `<header class="nav ${top?'top':'solid'}" id="nav"><div class="wrap bar">
   <div class="brand" onclick="go('#/')" style="cursor:pointer"><img src="${LOGO}"><div><div style="font-family:'Corm';font-size:19px;color:#efe9dd;font-weight:600;line-height:1">KQ Real Estate</div><div class="brand-sub">LIMA &amp; BEACH PROPERTIES</div></div></div>
   <nav class="navlinks">${links.map(l=>`<a class="navlink ${cur===l[0]?'active':''}" onclick="go('${l[0]}')">${l[1]}</a>`).join("")}</nav>
   <div class="navcta">${cta}</div>
   <div class="hamb" onclick="go('#/propiedades')">${I.menu}</div>
 </div></header>`;
}
function footer(){
 return `<footer><div class="wrap"><div class="foot-grid">
  <div><div class="brand" style="margin-bottom:14px"><img src="${LOGO}" style="height:44px"><div><div style="font-family:'Corm';font-size:20px;color:#efe9dd;font-weight:600">KQ Real Estate</div><div class="brand-sub">LIMA &amp; BEACH PROPERTIES</div></div></div>
   <p style="font-size:14px;max-width:32ch">Asesoría inmobiliaria premium en Lima y balnearios del sur. Venta, compra e inversión con acompañamiento profesional de principio a fin.</p>
   <div class="socials" style="margin-top:18px"><a href="${SITE.social.ig}" target="_blank" rel="noopener">${I.ig}</a><a href="${SITE.social.fb}" target="_blank" rel="noopener">${I.fb}</a><a href="${SITE.social.tiktok}" target="_blank" rel="noopener">${I.tiktok}</a><a href="${WA}" target="_blank" rel="noopener">${I.wa}</a></div></div>
  <div><h4>Explorar</h4><a onclick="go('#/propiedades')">Catálogo de propiedades</a><a onclick="go('#/servicios')">Servicios</a><a onclick="go('#/nosotros')">Nosotros</a><a onclick="go('#/registro')">Crear cuenta</a></div>
  <div><h4>Zonas</h4>${DISTRICTS.slice(0,6).map(d=>`<a onclick="filterDist('${d}')">${d}</a>`).join("")}</div>
  <div><h4>Contacto</h4><a href="${WA}">WhatsApp 996 044 424</a><a href="mailto:kqv1101@hotmail.com">kqv1101@hotmail.com</a><a>Karen Quezada · Agente Inmobiliario</a><a style="color:#8f8a7e">REG. 28319-PN-MVCS</a></div>
 </div><div class="foot-bottom"><span>© 2026 KQ Real Estate — Lima &amp; Beach Properties. Todos los derechos reservados.</span><span>Diseño de prototipo · datos de demostración</span></div></div></footer>`;
}
function propCard(p, listMode){
 const price = priceMain(p);
 const areaTxt = p.area? p.area+' m²' : '—';
 const specs = p.tipo==="terreno"
   ? `<span>${ic('area')} ${areaTxt}</span><span>${ic('pin')} ${p.dist}</span>`
   : `<span>${ic('bed')} ${p.dorm||'—'}</span><span>${ic('bath')} ${p.ban||'—'}</span><span>${ic('car')} ${p.est||0}</span><span>${ic('area')} ${areaTxt}</span>`;
 return `<article class="pcard${listMode?' list':''}" onclick="go('#/propiedad/${p.cod}')">
   <div class="ph"><img src="${scene(p.scene, p.cod.charCodeAt(6))}" alt="${p.tit}">
     <div class="badges"><span class="tag t-${p.oper}">${OPER_LBL[p.oper]}</span><span class="tag t-dist">${p.dist}</span></div>
     <button class="fav ${state.favs.has(p.cod)?'on':''}" onclick="event.stopPropagation();toggleFav('${p.cod}')">${I.heart}</button>
     <span class="prev-tag">Foto próximamente</span>
   </div>
   <div class="body"><div class="price">${price}</div>
     <div class="ptit">${p.tit}</div>
     <div class="loc">${ic('pin')} ${p.dir}</div>
     <div class="specs">${specs}</div></div></article>`;
}

/* ---------- VIEWS ---------- */
function statsBand(){ return `<section style="background:var(--dark);color:#fff;padding:52px 0"><div class="wrap"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center">
   ${SITE.stats.map(s=>`<div><div class="serif" style="font-size:44px;color:var(--goldL);font-weight:600;line-height:1">${s.n}</div><div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c7c1b4;margin-top:6px">${s.l}</div></div>`).join("")}
 </div></div></section>`; }
function sellBand(){ const s=SITE.sell; return `<section style="background:linear-gradient(120deg,#1b1b1b 0%,#242424 60%,#1b1b1b 100%);color:#fff"><div class="wrap" style="display:grid;grid-template-columns:1.3fr 1fr;gap:48px;align-items:center">
   <div><div class="eyebrow" style="color:var(--goldL)">Vende con nosotros</div><h2 class="serif" style="font-size:38px;margin-top:10px">${s.title}</h2>
     <p style="color:#cfc9bd;margin-top:14px;font-size:16px;max-width:52ch">${s.body}</p></div>
   <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:26px">
     <div style="font-family:'Corm';font-size:22px;margin-bottom:14px">Cuéntanos de tu propiedad</div>
     <input placeholder="Nombre" style="width:100%;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 13px;border-radius:4px;margin-bottom:10px;font-family:'Jost'">
     <input placeholder="WhatsApp" style="width:100%;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 13px;border-radius:4px;margin-bottom:10px;font-family:'Jost'">
     <input placeholder="Distrito de la propiedad" style="width:100%;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 13px;border-radius:4px;margin-bottom:14px;font-family:'Jost'">
     <button class="btn btn-gold" style="width:100%;justify-content:center" onclick="leadSent('Gracias, te contactaremos para tasar tu propiedad.')">Quiero vender / alquilar</button></div>
 </div></section>`; }
function videoDestacado(){ const v=SITE.video, id=ytId(v.url);
 const media = id ? `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}" title="Video" frameborder="0" allowfullscreen style="position:absolute;inset:0"></iframe>`
  : `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#cfc9bd"><div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;color:#fff;margin-bottom:12px"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div><div style="font-size:13.5px">Video destacado — próximamente</div><div style="font-size:11.5px;color:#8f8a7e;margin-top:2px">Se cargará desde el canal de YouTube de Karen Quezada</div></div>`;
 return `<section style="background:var(--cream)"><div class="wrap"><div class="sec-head"><div class="eyebrow">${v.sub}</div><h2 class="serif">${v.title}</h2><div class="divider"></div></div>
   <div style="position:relative;aspect-ratio:16/9;max-width:900px;margin:0 auto;border-radius:12px;overflow:hidden;background:radial-gradient(120% 120% at 50% 40%,#232323,#141414);box-shadow:var(--shadow)">${media}</div></div></section>`; }
function socialStrip(){ const s=SITE.social; return `<section style="padding:56px 0;background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px">
   <div><div class="eyebrow">Síguenos</div><h2 class="serif" style="font-size:30px;margin-top:6px">Nuevas propiedades cada semana</h2><p style="color:var(--muted);font-size:14px;margin-top:4px">Recorridos, tips e inmuebles antes que nadie en nuestras redes.</p></div>
   <div style="display:flex;gap:12px">
     <a href="${s.ig}" class="soc-pill" target="_blank" rel="noopener">${I.ig}<span>Instagram</span></a>
     <a href="${s.fb}" class="soc-pill" target="_blank" rel="noopener">${I.fb}<span>Facebook</span></a>
     <a href="${s.tiktok}" class="soc-pill" target="_blank" rel="noopener">${I.tiktok}<span>TikTok</span></a>
     <a href="${WA}" class="soc-pill" target="_blank" rel="noopener" style="border-color:#25D366;color:#128C4B">${I.wa}<span>WhatsApp</span></a>
   </div></div></section>`; }
function contactForm(dark){
 const c=dark?'#fff':'var(--ink)', muted=dark?'#cfc9bd':'var(--muted)', bg=dark?'rgba(255,255,255,.06)':'#fff', bd=dark?'rgba(255,255,255,.14)':'var(--line)', inbg=dark?'rgba(0,0,0,.25)':'var(--cream)', inbd=dark?'rgba(255,255,255,.15)':'var(--line)';
 return `<div style="background:${bg};border:1px solid ${bd};border-radius:14px;padding:30px">
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
     <input id="ct-n" placeholder="Nombre" style="background:${inbg};border:1px solid ${inbd};color:${c};padding:12px 14px;border-radius:5px;font-family:'Jost'">
     <input id="ct-a" placeholder="Apellido" style="background:${inbg};border:1px solid ${inbd};color:${c};padding:12px 14px;border-radius:5px;font-family:'Jost'">
     <input id="ct-e" placeholder="Correo electrónico" style="background:${inbg};border:1px solid ${inbd};color:${c};padding:12px 14px;border-radius:5px;font-family:'Jost'">
     <input id="ct-p" placeholder="WhatsApp / teléfono" style="background:${inbg};border:1px solid ${inbd};color:${c};padding:12px 14px;border-radius:5px;font-family:'Jost'">
   </div>
   <textarea id="ct-m" rows="3" placeholder="¿En qué podemos ayudarte? (opcional)" style="width:100%;margin-top:12px;background:${inbg};border:1px solid ${inbd};color:${c};padding:12px 14px;border-radius:5px;font-family:'Jost';resize:vertical"></textarea>
   <button class="btn btn-gold" style="width:100%;justify-content:center;margin-top:14px" onclick="leadSent('¡Gracias! Karen te contactará muy pronto.')">Enviar mensaje</button>
   <p style="font-size:11.5px;color:${muted};margin-top:12px;text-align:center">🔒 Tus datos están seguros con nosotros. Solo los usamos para atender tu consulta.</p>
 </div>`; }
function notFoundCTA(){ return `<section style="background:radial-gradient(120% 130% at 50% 10%,#242424,#141414);color:#fff;text-align:center"><div class="wrap">
   <h2 class="serif" style="font-size:34px">¿No encontraste lo que buscas?</h2>
   <p style="color:#cfc9bd;margin:12px auto 0;max-width:52ch">Cuéntanos qué necesitas y hacemos una búsqueda personalizada entre propiedades que aún no publicamos.</p>
   <div style="display:flex;gap:14px;justify-content:center;margin-top:24px"><a class="btn btn-gold" href="${WA}">${I.wa} Búsqueda personalizada</a><button class="btn btn-outline-l" onclick="go('#/contacto')">Escríbenos</button></div></div></section>`; }
function founderBlock(ctx){
 const f=SITE.founder;
 return `<section style="background:radial-gradient(120% 130% at 30% 20%,#242424,#111);color:#fff"><div class="wrap" style="display:grid;grid-template-columns:1fr 1.15fr;gap:56px;align-items:center">
   <div><div class="agent-av" style="width:130px;height:130px;font-size:50px;margin-bottom:22px">KQ</div>
     <div class="eyebrow" style="color:var(--goldL)">Fundadora &amp; CEO</div>
     <h2 class="serif" style="font-size:40px;margin-top:8px">${f.name}</h2>
     <p style="color:#d4cec2;margin-top:6px;font-size:12.5px;letter-spacing:1.5px;text-transform:uppercase">${f.role} · REG. 28319-PN-MVCS</p>
     <div class="socials" style="margin-top:18px"><a href="${SITE.social.ig}" target="_blank" rel="noopener">${I.ig}</a><a href="${SITE.social.fb}" target="_blank" rel="noopener">${I.fb}</a><a href="${SITE.social.tiktok}" target="_blank" rel="noopener">${I.tiktok}</a><a href="${WA}" target="_blank" rel="noopener">${I.wa}</a></div></div>
   <div><span style="font-family:'Corm';font-size:60px;color:var(--goldL);line-height:.4;opacity:.5">“</span>
     <p style="font-size:21px;line-height:1.6;color:#efe9dd;margin-top:-6px" class="serif">${f.quote}</p>
     <p style="color:#c0bab0;margin-top:18px;font-size:15px">${f.body}</p>
     <div style="display:flex;gap:14px;margin-top:26px">${ctx==='home'?`<button class="btn btn-gold" onclick="go('#/nosotros')">Conoce su historia</button>`:`<a class="btn btn-gold" href="${WA}">${I.wa} Conversar con Karen</a>`}<a class="btn btn-outline-l" href="${WA}">${I.wa} WhatsApp</a></div>
   </div></div></section>`;
}
function vHome(){
 const dest=PROPS.filter(p=>p.dest).slice(0,6);
 const svcs=[["key","Venta","Comercializamos tu propiedad con estrategia de precio, marketing profesional y una red de compradores calificados."],
   ["home","Compra","Te acompañamos a encontrar el inmueble ideal, con visitas guiadas y negociación a tu favor."],
   ["chart","Inversión","Identificamos oportunidades de renta y plusvalía en Lima y balnearios, con análisis de rentabilidad."],
   ["doc","Asesoría legal","Revisión de títulos, minuta, saneamiento y todo el proceso notarial con respaldo profesional."],
   ["tour","Visitas guiadas","Coordinamos visitas presenciales y tours virtuales para que decidas con total confianza."],
   ["shield","Acompañamiento total","Un solo punto de contacto desde la primera consulta hasta la entrega de llaves."]];
 return nav(true)+`
 <section class="hero">
   <div class="hero-collage">
     ${[["beach",0],["house",3],["tower",2],["penthouse",1],["house",4],["beach",5]].map(t=>`<div class="tile"><img src="${scene(t[0],t[1])}" alt=""></div>`).join("")}
   </div>
   <div class="hero-overlay"></div>
   <div class="wrap hero-inner">
   <div class="eyebrow" style="color:var(--goldL)">Inmobiliaria boutique · Lima &amp; playa</div>
   <h1 class="serif">Encuentra el lugar donde <span class="sig">quieres vivir</span>.</h1>
   <p class="lead">Propiedades residenciales de alto nivel en Lima y los mejores balnearios del sur. Recorre nuestras propiedades en video y encuentra tu próximo hogar.</p>
   <div class="searchbar">
     <div class="fld"><label>Operación</label><select id="h-oper"><option value="">Todas</option><option value="venta">Venta</option><option value="alquiler">Alquiler</option></select></div>
     <div class="fld"><label>Distrito / zona</label><select id="h-dist"><option value="">Todas</option>${DISTRICTS.map(d=>`<option>${d}</option>`).join("")}</select></div>
     <div class="fld"><label>Tipo</label><select id="h-tipo"><option value="">Todos</option>${Object.entries(TIPO_LBL).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></div>
     <button class="btn btn-gold" style="align-self:stretch;padding-left:28px;padding-right:28px" onclick="heroSearch()">Buscar propiedades</button>
   </div>
   <div class="hero-play"><span class="dot"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span> Recorridos reales de nuestras propiedades en video</div>
 </div></section>

 ${statsBand()}
 <section style="background:var(--cream)"><div class="wrap">
   <div class="sec-head"><div class="eyebrow">Lo que hacemos por ti</div><h2 class="serif">Servicios profesionales</h2><div class="divider"></div>
     <p>Más que mostrarte propiedades: te acompañamos en una de las decisiones más importantes de tu vida.</p></div>
   <div class="svc-grid">${svcs.map(s=>`<div class="svc"><div class="ic">${I[s[0]]}</div><h3 class="serif">${s[1]}</h3><p>${s[2]}</p></div>`).join("")}</div>
 </div></section>

 ${sellBand()}
 <section style="background:#fff;border-top:1px solid var(--line)"><div class="wrap">
   <div class="result-bar"><div><div class="eyebrow">Selección KQ</div><h2 class="serif" style="font-size:36px;margin-top:6px">Propiedades destacadas</h2></div><button class="btn btn-outline" onclick="go('#/propiedades')">Ver todo el catálogo →</button></div>
   <div class="pgrid">${dest.map(p=>propCard(p)).join("")}</div>
 </div></section>
 ${videoDestacado()}
 ${founderBlock('home')}
 ${socialStrip()}
 <section style="background:var(--cream)"><div class="wrap" style="display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:center">
   <div><div class="eyebrow">¿Listo para empezar?</div><h2 class="serif" style="font-size:38px;margin-top:10px">Conversemos sobre tu próxima propiedad</h2>
     <p style="color:var(--muted);margin-top:14px;font-size:16px">Déjanos tus datos y Karen te contactará para asesorarte sin compromiso. También puedes crear una cuenta gratis para guardar favoritos y agendar visitas.</p>
     <div style="display:flex;gap:12px;margin-top:20px"><button class="btn btn-outline" onclick="go('#/registro')">Crear cuenta gratis</button><a class="btn btn-ghost" href="${WA}">${I.wa} WhatsApp directo</a></div></div>
   ${contactForm(false)}
 </div></section>
 `+footer();
}

function vCatalogo(){
 const f=state.filters;
 let list=PROPS.filter(p=>(!f.oper||p.oper===f.oper||(f.oper==='venta'&&p.oper==='venta_y_alquiler')||(f.oper==='alquiler'&&p.oper==='venta_y_alquiler'))
   &&(!f.dist||p.dist===f.dist)&&(!f.tipo||p.tipo===f.tipo)&&(!f.dorm||(p.dorm||0)>=+f.dorm));
 if(f.precio==='lo') list=list.filter(p=>(p.venta||p.alq*100||0)<250000);
 if(f.precio==='mid') list=list.filter(p=>{const v=p.venta||0;return v>=250000&&v<500000});
 if(f.precio==='hi') list=list.filter(p=>(p.venta||0)>=500000);
 const S=state.sort;
 list=list.slice().sort((a,b)=>{ if(S==='price_asc')return (a.venta||a.alq||0)-(b.venta||b.alq||0); if(S==='price_desc')return (b.venta||b.alq||0)-(a.venta||a.alq||0); if(S==='area')return (b.area||0)-(a.area||0); return 0; });
 const grid = state.view==='list';
 return nav(false)+`
 <section class="cat-top"><div class="wrap"><div class="eyebrow" style="color:var(--goldL)">Catálogo</div><h1 class="serif">Explora nuestras propiedades</h1>
   <p style="color:#cfc9bd;margin-top:8px">${PROPS.length} inmuebles en Lima y balnearios del sur.</p></div></section>
 <div class="wrap"><div class="filters">
   <div class="fld"><label>Operación</label><select onchange="setF('oper',this.value)">${opt(["","venta","alquiler"],["Todas","Venta","Alquiler"],f.oper)}</select></div>
   <div class="fld"><label>Distrito</label><select onchange="setF('dist',this.value)"><option value="">Todas</option>${DISTRICTS.map(d=>`<option ${f.dist===d?'selected':''}>${d}</option>`).join("")}</select></div>
   <div class="fld"><label>Tipo</label><select onchange="setF('tipo',this.value)"><option value="">Todos</option>${Object.entries(TIPO_LBL).map(([k,v])=>`<option value="${k}" ${f.tipo===k?'selected':''}>${v}</option>`).join("")}</select></div>
   <div class="fld"><label>Dormitorios (mín.)</label><select onchange="setF('dorm',this.value)">${opt(["","1","2","3","4"],["Todos","1+","2+","3+","4+"],f.dorm)}</select></div>
   <div class="fld"><label>Precio (venta)</label><select onchange="setF('precio',this.value)">${opt(["","lo","mid","hi"],["Todos","Hasta $250k","$250k–$500k","$500k+"],f.precio)}</select></div>
   <button class="btn btn-ghost" onclick="clearF()">Limpiar</button>
 </div>
 <section style="padding-top:0"><div class="result-bar">
     <div class="cnt"><b>${list.length}</b> propiedades encontradas</div>
     <div style="display:flex;gap:12px;align-items:center">
       <select onchange="setSort(this.value)" style="border:1px solid var(--line);padding:8px 11px;border-radius:6px;background:#fff;font-family:'Jost';font-size:13.5px">${opt(["recent","price_asc","price_desc","area"],["Más recientes","Precio: menor a mayor","Precio: mayor a menor","Mayor área"],state.sort)}</select>
       <div class="view-toggle"><button class="${!grid?'on':''}" onclick="setView('grid')" title="Cuadrícula">${I.layout}</button><button class="${grid?'on':''}" onclick="setView('list')" title="Lista">${I.leads}</button></div>
     </div></div>
   <div class="${grid?'':'pgrid'}" style="${grid?'display:flex;flex-direction:column;gap:16px':''}">${list.map(p=>propCard(p,grid)).join("")||`<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:60px 0">No hay propiedades con esos filtros. <a class="mini" onclick="clearF()">Limpiar filtros</a></p>`}</div>
 </section></div>
 ${notFoundCTA()}`+footer();
}
function opt(vals,lbls,cur){return vals.map((v,i)=>`<option value="${v}" ${cur===v?'selected':''}>${lbls[i]}</option>`).join("")}

function vProp(cod){
 const p=PROPS.find(x=>x.cod===cod); if(!p) return vCatalogo();
 const price = priceMain(p);
 const areaTxt = p.area? p.area+" m²" : "—";
 const specs = p.tipo==="terreno"
   ? [["area",areaTxt,"Área"],["pin",p.dist,"Zona"]]
   : [["bed",p.dorm||"—","Dorm."],["bath",p.ban||"—","Baños"],["car",p.est||0,"Cocheras"],["area",areaTxt,"Área"]];
 const yt = ytId(p.video);
 const videoBlock = yt
   ? `<div style="position:relative;border-radius:8px;overflow:hidden;aspect-ratio:16/9;margin-top:14px"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${yt}" title="Video" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="position:absolute;inset:0"></iframe></div>`
   : `<div style="border-radius:8px;aspect-ratio:16/9;margin-top:14px;background:radial-gradient(120% 120% at 50% 40%,#232323,#141414);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#cfc9bd;border:1px solid var(--line)"><div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:#fff;margin-bottom:10px"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div><div style="font-size:13.5px">Video de recorrido — próximamente</div><div style="font-size:11.5px;color:#8f8a7e;margin-top:2px">Se cargará desde el canal de YouTube de Karen Quezada</div></div>`;
 return nav(false)+`
 <section class="pd-hero"><div class="wrap">
   <a class="mini" style="color:var(--goldL)" onclick="go('#/propiedades')">← Volver al catálogo</a>
   <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;margin:10px 0 20px">
     <div><span class="tag t-${p.oper}">${OPER_LBL[p.oper]}</span> <span class="tag t-dist" style="background:#2a2a2a">${p.cod}</span>
       <h1 class="serif" style="margin-top:12px">${p.tit}</h1>
       <p style="color:#cfc9bd;margin-top:6px">${ic('pin')} ${p.dir}, ${p.dist}</p></div>
   </div>
   <div class="pd-gallery">
     <div class="g"><img src="${scene(p.scene,p.cod.charCodeAt(6))}"></div>
     <div class="g"><img src="${scene(p.scene,p.cod.charCodeAt(6)+2)}"></div>
     <div class="g"><img src="${scene(p.scene,p.cod.charCodeAt(6)+4)}"></div>
     <div class="g"><img src="${scene(p.scene,p.cod.charCodeAt(6)+1)}"></div>
     <div class="g" style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1e1e1e;color:#9a9488;font-size:12.5px;text-align:center;gap:4px">${ic('tour')} <span>${yt?'Video disponible':'Fotos y video'}</span><span style="font-size:10.5px;color:#7a756b">próximamente</span></div>
   </div></div></section>
 <div class="wrap"><div class="pd-cols">
   <div class="pd-main">
     <div class="specbar">${specs.map(s=>`<div class="s"><b>${s[1]}</b><span>${s[2]}</span></div>`).join("")}${p.piso?`<div class="s"><b>${p.piso}</b><span>Piso</span></div>`:""}${p.ant!=null?`<div class="s"><b>${p.ant}</b><span>Años</span></div>`:""}</div>
     <h3 class="serif" style="font-size:24px;margin-top:6px">Descripción</h3>
     <div class="desc-body" style="color:var(--ink2);margin-top:10px;font-size:15.5px">${renderDesc(p.desc) || ('<p>'+TIPO_LBL[p.tipo]+' en '+p.dist+'. Escríbenos para recibir la ficha completa, fotos y coordinar una visita.</p>')}</div>
     ${p.feats&&p.feats.length?`<h3 class="serif" style="font-size:24px;margin-top:28px">Características</h3><div class="chip-row" style="margin-top:14px">${p.feats.map(f=>`<span class="chip">${ic('check')} ${f}</span>`).join("")}</div>`:""}
     <h3 class="serif" style="font-size:24px;margin-top:28px">Video de recorrido</h3>
     ${videoBlock}
     <h3 class="serif" style="font-size:24px;margin-top:28px">Ubicación</h3>
     <div class="mapph">${ic('pin')} &nbsp;${p.dist} — mapa interactivo (demo)</div>
   </div>
   <aside><div class="agent-card">
     <div style="font-size:12px;letter-spacing:1.5px;color:#cfc9bd;text-transform:uppercase">${p.oper==='alquiler'?'Alquiler mensual':'Precio de venta'}</div>
     <div class="price">${price}</div>
     ${p.oper==='venta_y_alquiler'?`<div style="color:#cfc9bd;font-size:14px;margin-top:2px">o alquiler ${FMT(p.alq)}/mes</div>`:""}
     <div style="display:flex;gap:12px;align-items:center;margin:22px 0;padding-top:20px;border-top:1px solid #333">
       <div class="agent-av">KQ</div><div><div style="font-weight:600">Karen Quezada</div><div style="font-size:12px;color:#cfc9bd">Agente Inmobiliario</div></div></div>
     <a class="btn btn-gold" style="width:100%;justify-content:center;margin-bottom:10px" href="${WA}?text=Hola,%20me%20interesa%20${p.cod}">${I.wa} Consultar por WhatsApp</a>
     <button class="btn btn-teal" style="width:100%;justify-content:center;margin-bottom:10px" onclick="agendar('${p.cod}')">Agendar una visita</button>
     <button class="btn btn-outline-l" style="width:100%;justify-content:center" onclick="toggleFav('${p.cod}')">${state.favs.has(p.cod)?'♥ Guardada en favoritos':'♡ Guardar en favoritos'}</button>
     <p style="font-size:11.5px;color:#9a9488;margin-top:14px;text-align:center">Agendar y guardar requieren una cuenta gratuita.</p>
   </div></aside>
 </div></div>`+footer();
}

function vServicios(){
 const svcs=[["key","Venta de propiedades","Diseñamos una estrategia de comercialización a la medida de tu inmueble: análisis de precio de mercado, sesión de fotos y video profesional, publicación en portales y nuestra red, filtrado de compradores calificados y negociación experta hasta el cierre.",["Valorización de mercado","Marketing y fotografía profesional","Filtro de compradores","Negociación y cierre"]],
   ["home","Compra y búsqueda","Entendemos qué buscas y por qué. Preseleccionamos solo lo que calza con tu presupuesto y estilo de vida, coordinamos visitas y te representamos en la negociación para que compres con seguridad y al mejor precio.",["Levantamiento de requerimientos","Selección curada de opciones","Visitas guiadas","Representación en la negociación"]],
   ["chart","Inversión inmobiliaria","Convertimos tu capital en renta y plusvalía. Analizamos rentabilidad, zonas en crecimiento y oportunidades en pre-venta y balnearios, con proyecciones claras para que inviertas con criterio.",["Análisis de rentabilidad","Oportunidades en pre-venta","Renta residencial y de playa","Proyección de plusvalía"]],
   ["doc","Asesoría legal y notarial","Te acompañamos en toda la parte legal: revisión de títulos y partidas, saneamiento, elaboración de minuta, firma de escritura y proceso notarial, con respaldo profesional en cada paso.",["Revisión de títulos y partidas","Saneamiento","Minuta y escritura pública","Acompañamiento notarial"]]];
 return nav(false)+`
 <section class="cat-top" style="padding-bottom:60px"><div class="wrap"><div class="eyebrow" style="color:var(--goldL)">Servicios</div><h1 class="serif" style="font-size:46px">Asesoría inmobiliaria integral</h1>
   <p style="color:#cfc9bd;margin-top:12px;max-width:60ch">De principio a fin, con un solo punto de contacto profesional. Estos son los servicios con los que te acompañamos.</p></div></section>
 <section style="background:var(--cream)"><div class="wrap" style="display:flex;flex-direction:column;gap:26px">
   ${svcs.map((s,i)=>`<div style="background:#fff;border:1px solid var(--line);border-radius:8px;padding:40px;display:grid;grid-template-columns:70px 1fr 1fr;gap:30px;align-items:start">
     <div style="width:64px;height:64px;border-radius:50%;background:#f6f0e2;color:var(--teal);display:flex;align-items:center;justify-content:center">${I[s[0]]}</div>
     <div><h2 class="serif" style="font-size:30px">${s[1]}</h2><p style="color:var(--muted);margin-top:12px;font-size:15.5px">${s[2]}</p></div>
     <div>${s[3].map(x=>`<div style="display:flex;gap:10px;align-items:center;padding:8px 0;font-size:14.5px;color:var(--ink2)"><span style="color:var(--teal);width:18px;flex:0 0 auto">${I.check}</span>${x}</div>`).join("")}</div>
   </div>`).join("")}
 </div></section>
 <section style="background:var(--dark);color:#fff;text-align:center"><div class="wrap"><h2 class="serif" style="font-size:36px">¿Listo para dar el siguiente paso?</h2>
   <p style="color:#cfc9bd;margin:12px auto 0;max-width:50ch">Cuéntanos qué necesitas y te asesoramos sin compromiso.</p>
   <div style="display:flex;gap:14px;justify-content:center;margin-top:24px"><a class="btn btn-gold" href="${WA}">${I.wa} Escríbenos por WhatsApp</a><button class="btn btn-outline-l" onclick="go('#/propiedades')">Ver propiedades</button></div></div></section>
 `+footer();
}

function vNosotros(){
 return nav(false)+`
 <section class="cat-top" style="padding-bottom:56px"><div class="wrap"><div class="eyebrow" style="color:var(--goldL)">Nosotros</div><h1 class="serif" style="font-size:46px">Asesoría real para decisiones importantes</h1></div></section>
 <section style="background:var(--cream)"><div class="wrap" style="display:grid;grid-template-columns:1fr 1.2fr;gap:52px;align-items:center">
   <div style="background:radial-gradient(120% 120% at 50% 30%,#2a2a2a,#111);border-radius:10px;aspect-ratio:4/5;display:flex;align-items:center;justify-content:center;color:var(--goldL)"><div style="text-align:center"><div class="agent-av" style="width:120px;height:120px;font-size:46px;margin:0 auto 16px">KQ</div><div class="serif" style="font-size:26px;color:#efe9dd">Karen Quezada</div><div class="brand-sub" style="color:#cfc9bd">AGENTE INMOBILIARIO</div></div></div>
   <div><div class="eyebrow">La marca</div><h2 class="serif" style="font-size:38px;margin-top:8px">KQ Real Estate — Lima &amp; Beach Properties</h2>
     <p style="color:var(--ink2);margin-top:16px;font-size:16px">Somos una inmobiliaria boutique enfocada en propiedades residenciales de buen nivel y alto valor en Lima y los balnearios del sur. Trabajamos con pocos clientes a la vez para poder ofrecer un servicio cercano, transparente y verdaderamente personalizado.</p>
     <p style="color:var(--ink2);margin-top:14px;font-size:16px">Nuestra promesa es simple: acompañarte con criterio profesional en una de las decisiones más importantes de tu vida, cuidando tu tiempo, tu inversión y tu tranquilidad.</p>
     <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px">
       ${[["Transparencia","Información clara y honesta en cada paso."],["Criterio de inversión","Miramos rentabilidad y plusvalía, no solo metros."],["Cercanía","Un solo punto de contacto, siempre disponible."]].map(v=>`<div><div style="color:var(--teal);width:26px">${I.shield}</div><h3 class="serif" style="font-size:20px;margin-top:8px">${v[0]}</h3><p style="font-size:13.5px;color:var(--muted);margin-top:4px">${v[1]}</p></div>`).join("")}</div>
     <div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)">Registro profesional <b style="color:var(--ink)">28319-PN-MVCS</b> · Miembro activo del sector inmobiliario formal.</div>
   </div>
 </div></section>
 <section style="padding:0"><div class="wrap" style="text-align:center;padding:0 0 20px"><div class="eyebrow">La historia</div><h2 class="serif" style="font-size:38px;margin-top:8px">Reseña de la fundadora</h2><div class="divider"></div></div></section>
 ${founderBlock('nosotros')}`+footer();
}

function vMapa(){
 return nav(false)+`
 <section class="cat-top" style="padding-bottom:34px"><div class="wrap"><div class="eyebrow" style="color:var(--goldL)">Mapa</div><h1 class="serif">Explora por ubicación</h1><p style="color:#cfc9bd;margin-top:8px">Encuentra propiedades por zona en Lima y los balnearios del sur.</p></div></section>
 <div class="wrap" style="padding:34px 24px"><div style="display:grid;grid-template-columns:1.6fr 1fr;gap:22px">
   <div class="mapph" style="height:520px;position:relative">${ic('pin')} &nbsp;Mapa interactivo con las ${PROPS.length} propiedades (demo)
     ${PROPS.slice(0,6).map((p,i)=>`<div style="position:absolute;left:${15+i*13}%;top:${25+(i%3)*22}%;width:30px;height:30px;background:var(--gold);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(0,0,0,.3)"></div>`).join("")}
   </div>
   <div style="display:flex;flex-direction:column;gap:12px;max-height:520px;overflow:auto">
     ${PROPS.map(p=>`<div onclick="go('#/propiedad/${p.cod}')" style="display:flex;gap:12px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:10px;cursor:pointer">
       <img src="${scene(p.scene,p.cod.charCodeAt(6))}" style="width:80px;height:64px;object-fit:cover;border-radius:5px">
       <div><div style="font-weight:500;font-size:13.5px">${p.tit.slice(0,40)}</div><div style="font-size:12px;color:var(--muted)">${ic('pin')} ${p.dist}</div><div style="font-family:'Corm';font-weight:600;color:var(--goldD);margin-top:2px">${priceMain(p)}</div></div></div>`).join("")}
   </div>
 </div></div>`+footer();
}
function vContacto(){
 const c=SITE.contacto,s=SITE.social;
 return nav(false)+`
 <section class="cat-top" style="padding-bottom:40px"><div class="wrap"><div class="eyebrow" style="color:var(--goldL)">Contacto</div><h1 class="serif" style="font-size:44px">Conversemos</h1><p style="color:#cfc9bd;margin-top:10px;max-width:56ch">Cuéntanos qué buscas o qué propiedad quieres vender. Karen te responderá personalmente.</p></div></section>
 <section style="background:var(--cream)"><div class="wrap" style="display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:start">
   <div>
     <h2 class="serif" style="font-size:30px">Datos de contacto</h2>
     <div style="display:flex;flex-direction:column;gap:16px;margin-top:20px">
       <a href="${WA}" style="display:flex;gap:14px;align-items:center"><span style="width:44px;height:44px;border-radius:50%;background:#eafaf0;color:#128C4B;display:flex;align-items:center;justify-content:center">${I.wa}</span><div><div style="font-weight:600">WhatsApp</div><div style="color:var(--muted);font-size:14px">${c.whatsapp}</div></div></a>
       <a href="mailto:${c.email}" style="display:flex;gap:14px;align-items:center"><span style="width:44px;height:44px;border-radius:50%;background:#f6f0e2;color:var(--teal);display:flex;align-items:center;justify-content:center">${I.mail}</span><div><div style="font-weight:600">Correo</div><div style="color:var(--muted);font-size:14px">${c.email}</div></div></a>
       <div style="display:flex;gap:14px;align-items:center"><span style="width:44px;height:44px;border-radius:50%;background:#f6f0e2;color:var(--teal);display:flex;align-items:center;justify-content:center">${I.shield}</span><div><div style="font-weight:600">Karen Quezada</div><div style="color:var(--muted);font-size:14px">Agente Inmobiliario · REG. 28319-PN-MVCS</div></div></div>
     </div>
     <div class="socials" style="margin-top:24px;--x:0">
       <a href="${s.ig}" class="soc-pill" target="_blank" rel="noopener">${I.ig}<span>Instagram</span></a>
       <a href="${s.fb}" class="soc-pill" target="_blank" rel="noopener">${I.fb}<span>Facebook</span></a>
       <a href="${s.tiktok}" class="soc-pill" target="_blank" rel="noopener">${I.tiktok}<span>TikTok</span></a>
     </div>
   </div>
   <div><h2 class="serif" style="font-size:30px;margin-bottom:16px">Escríbenos</h2>${contactForm(false)}</div>
 </div></section>`+footer();
}

/* ---- AUTH ---- */
function vLogin(){
 return `<div class="demo-banner">Prototipo · demo — puedes ingresar como <b>Cliente</b> o como <b>Administrador</b> para ver ambas experiencias.</div>
 <div class="auth-wrap"><div class="auth-side">
   <div class="brand" style="margin-bottom:26px"><img src="${LOGO}" style="height:48px"><div><div style="font-family:'Corm';font-size:22px;color:#efe9dd;font-weight:600">KQ Real Estate</div><div class="brand-sub">LIMA &amp; BEACH PROPERTIES</div></div></div>
   <h2 class="serif" style="font-size:40px;color:#fff">Bienvenido de vuelta</h2>
   <p style="color:#cfc9bd;margin-top:12px;max-width:40ch">Ingresa para acceder a tus favoritos, tus visitas agendadas y las novedades del catálogo.</p>
 </div>
 <div class="auth-form"><h2 class="serif">Iniciar sesión</h2><p style="color:var(--muted);margin-top:4px">¿No tienes cuenta? <a class="mini" onclick="go('#/registro')">Regístrate gratis</a></p>
   <div class="field"><label>Correo electrónico</label><input id="lg-mail" placeholder="tucorreo@ejemplo.com" value="cliente@demo.com"></div>
   <div class="field"><label>Contraseña</label><input id="lg-pass" type="password" value="demo1234"></div>
   <button class="btn btn-dark" style="justify-content:center;margin-top:20px" onclick="login('cliente')">Ingresar como cliente</button>
   <button class="btn btn-outline" style="justify-content:center;margin-top:10px" onclick="login('admin')">${I.settings} Ingresar como administrador</button>
   <p style="font-size:11.5px;color:var(--muted);margin-top:16px">El acceso de administración es exclusivo del equipo KQ. Los usuarios del público general nunca acceden a la administración.</p>
 </div></div>`;
}
function vRegistro(){
 const perks=[["heart","Guarda tus favoritos","Arma tu lista de propiedades preferidas y compáralas cuando quieras."],
   ["tour","Agenda visitas en un clic","Coordina visitas presenciales o tours virtuales al instante."],
   ["star","Alertas personalizadas","Recibe avisos cuando publiquemos algo que calce con lo que buscas."],
   ["wa","Contacto directo","Habla directamente con Karen y recibe atención prioritaria."]];
 return `<div class="demo-banner">Prototipo · demo — el registro es simulado para esta maqueta.</div>
 <div class="auth-wrap"><div class="auth-side">
   <div class="brand" style="margin-bottom:26px"><img src="${LOGO}" style="height:48px"><div><div style="font-family:'Corm';font-size:22px;color:#efe9dd;font-weight:600">KQ Real Estate</div><div class="brand-sub">LIMA &amp; BEACH PROPERTIES</div></div></div>
   <h2 class="serif" style="font-size:38px;color:#fff">Crea tu cuenta gratis</h2>
   <div style="margin-top:22px">${perks.map(p=>`<div class="perk"><span class="ic">${I[p[0]]}</span><div><b style="color:#efe9dd">${p[1]}</b><div style="font-size:13px">${p[2]}</div></div></div>`).join("")}</div>
 </div>
 <div class="auth-form"><h2 class="serif">Regístrate</h2><p style="color:var(--muted);margin-top:4px">¿Ya tienes cuenta? <a class="mini" onclick="go('#/login')">Inicia sesión</a></p>
   <div class="field"><label>Nombre completo</label><input id="rg-name" placeholder="Tu nombre"></div>
   <div class="field"><label>Correo electrónico</label><input placeholder="tucorreo@ejemplo.com"></div>
   <div class="field"><label>WhatsApp</label><input placeholder="9XX XXX XXX"></div>
   <div class="field"><label>Contraseña</label><input type="password" placeholder="Mínimo 8 caracteres"></div>
   <button class="btn btn-gold" style="justify-content:center;margin-top:20px" onclick="register()">Crear mi cuenta</button>
   <p style="font-size:11.5px;color:var(--muted);margin-top:14px">Al registrarte aceptas nuestros Términos y la Política de Privacidad. Tus datos se usan solo para brindarte el servicio.</p>
 </div></div>`;
}

function vCuenta(){
 if(!state.auth.logged) return vLogin();
 const favs=PROPS.filter(p=>state.favs.has(p.cod));
 return nav(false)+`
 <section class="cat-top" style="padding-bottom:40px"><div class="wrap"><div class="eyebrow" style="color:var(--goldL)">Mi cuenta</div><h1 class="serif">Hola, ${state.auth.name||'Cliente'} 👋</h1>
  <p style="color:#cfc9bd;margin-top:6px">Aquí guardas tus favoritos, gestionas tus visitas y tus alertas.</p></div></section>
 <div class="wrap acct" style="padding-top:36px">
   <div style="display:flex;gap:14px;margin-bottom:30px;flex-wrap:wrap">
     <div class="kpi" style="min-width:150px"><div class="n">${favs.length}</div><div class="l">Favoritos</div></div>
     <div class="kpi" style="min-width:150px"><div class="n">1</div><div class="l">Visitas agendadas</div></div>
     <div class="kpi" style="min-width:150px"><div class="n">3</div><div class="l">Alertas activas</div></div>
   </div>
   <h2 class="serif" style="font-size:30px;margin-bottom:18px">Tus favoritos</h2>
   ${favs.length?`<div class="pgrid">${favs.map(p=>propCard(p)).join("")}</div>`:`<div style="background:#fff;border:1px dashed var(--line);border-radius:8px;padding:50px;text-align:center;color:var(--muted)">Aún no has guardado propiedades. <a class="mini" onclick="go('#/propiedades')">Explora el catálogo</a> y toca el corazón ♡ para guardarlas aquí.</div>`}
 </div>`+footer();
}

/* ---- ADMIN ---- */
function vAdmin(sub){
 if(!state.auth.logged || state.auth.role!=='admin'){
   return `<div class="lockbox"><div style="color:var(--goldD);width:40px;margin:0 auto 14px">${I.shield}</div>
     <h2 class="serif" style="font-size:26px">Acceso restringido</h2>
     <p style="color:var(--muted);margin-top:10px">La administración es exclusiva del equipo KQ Real Estate. Los usuarios del público general no pueden ingresar aquí.</p>
     <button class="btn btn-dark" style="justify-content:center;margin-top:18px" onclick="go('#/login')">Ingresar como administrador</button>
     <button class="btn btn-ghost" style="justify-content:center;margin-top:6px" onclick="go('#/')">Volver al inicio</button></div>`;
 }
 sub=sub||'propiedades';
 const menu=[["propiedades","home","Propiedades"],["servicios","settings","Servicios"],["secciones","layout","Secciones del sitio"],["usuarios","users","Usuarios"]];
 let main="";
 if(sub==='propiedades'){
   main=`<div class="admin-top"><h1>Catálogo de propiedades</h1><button class="btn btn-gold" onclick="openAdmProp(null)">+ Nueva propiedad</button></div>
   <div class="kpis"><div class="kpi"><div class="n">${PROPS.length}</div><div class="l">Publicadas</div></div><div class="kpi"><div class="n">${PROPS.filter(p=>p.oper!=='alquiler').length}</div><div class="l">En venta</div></div><div class="kpi"><div class="n">6</div><div class="l">Zonas</div></div><div class="kpi"><div class="n">0</div><div class="l">Con fotos reales</div></div></div>
   <div class="panel"><div class="ph"><h3>Todas las propiedades</h3><span style="font-size:12px;color:#8b9099">Editar título, precio, fotos, estado…</span></div>
     <table><thead><tr><th>Código</th><th>Título</th><th>Zona</th><th>Tipo</th><th>Precio</th><th>Estado</th><th></th></tr></thead><tbody>
     ${PROPS.map(p=>`<tr><td style="font-weight:600">${p.cod}</td><td>${p.tit}</td><td>${p.dist}</td><td>${TIPO_LBL[p.tipo]}</td><td>${p.consultar?'A consultar':(p.oper==='alquiler'?FMT(p.alq)+'/mes':FMT(p.venta))}</td><td><span class="pill ok">Disponible</span></td><td><span class="mini" onclick="openAdmProp('${p.cod}')">Editar</span></td></tr>`).join("")}
     </tbody></table></div>`;
 } else if(sub==='servicios'){
   main=`<div class="admin-top"><h1>Servicios ofrecidos</h1><button class="btn btn-gold" onclick="openAdmSection('servicios')">+ Nuevo servicio</button></div>
   <div class="panel"><table><thead><tr><th>Servicio</th><th>Descripción</th><th>Visible</th><th></th></tr></thead><tbody>
   ${[["Venta","Estrategia de comercialización y cierre"],["Compra y búsqueda","Selección curada y representación"],["Inversión","Renta y plusvalía"],["Asesoría legal","Proceso notarial completo"]].map(s=>`<tr><td style="font-weight:600">${s[0]}</td><td>${s[1]}</td><td><span class="pill ok">Sí</span></td><td><span class="mini" onclick="openAdmSection('servicios')">Editar</span></td></tr>`).join("")}
   </tbody></table></div>`;
 } else if(sub==='secciones'){
   main=`<div class="admin-top"><h1>Secciones del sitio</h1></div>
   <div class="kpis"><div class="kpi"><div class="n">Hero</div><div class="l">Portada</div></div><div class="kpi"><div class="n">6</div><div class="l">Destacadas</div></div><div class="kpi"><div class="n">Bio</div><div class="l">Nosotros</div></div><div class="kpi"><div class="n">Footer</div><div class="l">Contacto</div></div></div>
   <div class="panel"><table><thead><tr><th>Sección</th><th>Qué controla</th><th></th></tr></thead><tbody>
   ${[["hero","Portada (Hero)","Título, subtítulo y buscador"],["destacadas","Propiedades destacadas","Cuáles aparecen en la home"],["sell","Vende con nosotros","Título y texto de captación"],["stats","Estadísticas","Contadores de confianza"],["video","Video destacado","Enlace de YouTube y textos"],["servicios","Servicios","Textos e íconos"],["founder","Reseña de la fundadora","Foto, frase y reseña de Karen"],["contacto","Contacto y redes","Teléfono, correo, redes sociales"]].map(s=>`<tr><td style="font-weight:600">${s[1]}</td><td>${s[2]}</td><td><span class="mini" onclick="openAdmSection('${s[0]}')">Editar</span></td></tr>`).join("")}
   </tbody></table></div>`;
 } else {
   main=`<div class="admin-top"><h1>Usuarios registrados</h1><span style="font-size:12px;color:#8b9099">Público general — no pueden acceder a esta administración</span></div>
   <div class="panel"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Registro</th><th>Favoritos</th></tr></thead><tbody>
   ${[["María Torres","maria@…","Cliente","10/08/2026","4"],["Jorge Ramos","jorge@…","Cliente","09/08/2026","2"],["Karen Quezada","kqv1101@…","Administrador","—","—"]].map(u=>`<tr><td style="font-weight:600">${u[0]}</td><td>${u[1]}</td><td><span class="pill ${u[2]==='Administrador'?'res':'ok'}">${u[2]}</span></td><td>${u[3]}</td><td>${u[4]}</td></tr>`).join("")}
   </tbody></table></div>`;
 }
 return `<div class="admin"><aside class="admin-side">
   <div class="lg"><img src="${LOGO}"><div style="font-family:'Corm';color:#efe9dd;font-weight:600">KQ Admin</div></div>
   <div class="grp">Sitio web</div>
   ${menu.map(m=>`<a class="${sub===m[0]?'on':''}" onclick="go('#/admin/${m[0]}')">${I[m[1]]}<span>${m[2]}</span></a>`).join("")}
   <div class="grp">Operación</div>
   <a onclick="window.open('https://kq-realestate.cloud/webhook/kqv-panel','_blank')">${I.leads}<span>Panel de leads</span></a>
   <a onclick="toast('Demo: se abriría n8n (solo admins de sistema)')">${I.settings}<span>Workflows n8n</span></a>
   <div class="grp">Sesión</div>
   <a onclick="go('#/')">${I.home}<span>Ver sitio público</span></a>
   <a onclick="logout()">${I.logout}<span>Cerrar sesión</span></a>
 </aside><main class="admin-main">
   <div style="background:#fdf6e3;border:1px solid #f0e2b8;color:#8a6d1b;font-size:12.5px;padding:9px 14px;border-radius:6px;margin-bottom:18px">🔒 Estás en la <b>administración del sitio web</b>. El panel de leads y los workflows n8n se gestionan por separado con usuarios administradores de sistema.</div>
   ${main}
 </main></div>`;
}

/* ---------- actions ---------- */
function toggleFav(cod){ if(!state.auth.logged){ toast("Crea una cuenta gratis para guardar favoritos"); go('#/registro'); return;} if(state.favs.has(cod))state.favs.delete(cod);else{state.favs.add(cod);toast("Guardado en favoritos ♥");} render(); }
function agendar(cod){ if(!state.auth.logged){ toast("Crea una cuenta para agendar tu visita"); go('#/registro'); return;} toast("¡Visita solicitada! Karen te contactará para confirmar."); }
function login(role){ state.auth={logged:true, role, name: role==='admin'?'Karen':'Cliente'}; toast(role==='admin'?"Bienvenida, Karen (Administrador)":"Sesión iniciada"); go(role==='admin'?'#/admin':'#/cuenta'); }
function register(){ const n=document.getElementById('rg-name'); state.auth={logged:true,role:'cliente',name:(n&&n.value)||'Cliente'}; toast("¡Cuenta creada! Bienvenido a KQ Real Estate."); go('#/cuenta'); }
function logout(){ state.auth={logged:false,role:null,name:""}; toast("Sesión cerrada"); go('#/'); }
function setF(k,v){ state.filters[k]=v; render(); }
function clearF(){ state.filters={oper:"",dist:"",tipo:"",dorm:"",precio:""}; render(); }
function leadSent(msg){ toast(msg||'¡Gracias! Te contactaremos pronto.'); }
function setSort(v){ state.sort=v; render(); }
function setView(v){ state.view=v; render(); }
function filterDist(d){ state.filters={oper:"",dist:d,tipo:"",dorm:"",precio:""}; go('#/propiedades'); }
function heroSearch(){ state.filters.oper=document.getElementById('h-oper').value; state.filters.dist=document.getElementById('h-dist').value; state.filters.tipo=document.getElementById('h-tipo').value; go('#/propiedades'); }

/* ---------- FEEDBACK ---------- */
let fbStars=0;
function buildFeedbackUI(){
 if(document.getElementById('fbRoot')) return;
 const d=document.createElement('div'); d.id='fbRoot';
 d.innerHTML=`
  <button class="fb-btn" onclick="openFeedback()">${I.chat}<span>Feedback</span></button>
  <div class="fb-invite" id="fbInvite">
    <button class="x" onclick="closeInvite()">✕</button>
    <div class="bdg">${I.chat}</div>
    <h4 class="serif">¿Qué te parece el diseño?</h4>
    <p>Cuéntanos tu primera impresión de este prototipo. Tu opinión nos ayuda a mejorarlo.</p>
    <button class="btn btn-gold" onclick="openFeedback();closeInvite()">Dar mi opinión</button>
  </div>
  <div class="modal-back" id="fbModal">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="mh"><button class="mx" onclick="closeFeedback()">✕</button>
        <h3>Tu opinión sobre el diseño</h3><p>KQ Real Estate — prototipo del sitio web</p></div>
      <div class="mb" id="fbBody">
        <div class="lbl">¿Cómo calificarías el diseño?</div>
        <div class="stars" id="fbStars">${[1,2,3,4,5].map(n=>`<span data-n="${n}" onclick="setStars(${n})">${I.star}</span>`).join("")}</div>
        <div class="lbl">¿Qué te gustó?</div><textarea id="fbLike" rows="2" placeholder="Lo que más te gustó…"></textarea>
        <div class="lbl">¿Qué mejorarías o agregarías?</div><textarea id="fbImprove" rows="3" placeholder="Colores, secciones, textos, funciones…"></textarea>
        <div class="lbl">Tu nombre (opcional)</div><input id="fbName" placeholder="Nombre">
        <button class="btn btn-gold" style="width:100%;justify-content:center;margin-top:20px" onclick="submitFeedback()">Enviar mi feedback</button>
      </div>
    </div>
  </div>`;
 document.body.appendChild(d);
 document.getElementById('fbModal').addEventListener('click', closeFeedback); // click en el fondo cierra el modal
}
function setStars(n){fbStars=n;document.querySelectorAll('#fbStars span').forEach(s=>s.classList.toggle('on',+s.dataset.n<=n));}
function openFeedback(){buildFeedbackUI();document.getElementById('fbModal').classList.add('show');}
function closeFeedback(){const m=document.getElementById('fbModal');if(m)m.classList.remove('show');}
function closeInvite(){const i=document.getElementById('fbInvite');if(i)i.classList.remove('show');}
function submitFeedback(){
 const g=id=>{const el=document.getElementById(id);return el?(el.value||'').trim():''};
 const like=g('fbLike'),imp=g('fbImprove'),name=g('fbName');
 const txt=`Feedback prototipo KQ Real Estate%0A%0ACalificacion: ${fbStars||'-'}/5%0ALe gusto: ${encodeURIComponent(like||'-')}%0AMejoraria: ${encodeURIComponent(imp||'-')}%0ANombre: ${encodeURIComponent(name||'-')}`;
 document.getElementById('fbBody').innerHTML=`<div class="fb-ok"><div class="big">${I.check}</div>
   <h3 class="serif" style="font-size:24px">¡Gracias por tu opinión!</h3>
   <p style="color:var(--muted);margin-top:8px">Registramos tu feedback. Si quieres, envíalo directo para que lo recibamos.</p>
   <a class="btn btn-gold" style="justify-content:center;margin-top:16px" href="${WA}?text=${txt}">${I.wa} Enviar por WhatsApp</a>
   <button class="btn btn-ghost" style="justify-content:center;margin-top:6px;width:100%" onclick="closeFeedback()">Cerrar</button></div>`;
}

/* ---------- ADMIN edición (demo) ---------- */
function buildAdminUI(){
 if(document.getElementById('admModalRoot'))return;
 const d=document.createElement('div');d.id='admModalRoot';
 d.innerHTML=`<div class="modal-back" id="admModal"><div class="modal" onclick="event.stopPropagation()" style="max-width:600px">
   <div class="mh"><button class="mx" onclick="closeAdm()">✕</button><h3 id="admTitle">Editar</h3><p id="admSub">Administración del sitio</p></div>
   <div class="mb" id="admBody"></div></div></div>`;
 document.body.appendChild(d);
 document.getElementById('admModal').addEventListener('click',closeAdm);
}
function closeAdm(){const m=document.getElementById('admModal');if(m)m.classList.remove('show');}
function admOpen(){buildAdminUI();document.getElementById('admModal').classList.add('show');}
function admSave(){closeAdm();toast('Cambios guardados (demo). En producción se guardan en la base de datos y actualizan la web al instante.');}
function fld(label,val,ph,type){const v=(val==null?'':String(val)).replace(/"/g,'&quot;');
 return `<div class="lbl">${label}</div>`+(type==='area'?`<textarea rows="3" placeholder="${ph||''}">${val==null?'':val}</textarea>`:`<input value="${v}" placeholder="${ph||''}">`);}
function openAdmProp(cod){
 buildAdminUI(); const p=cod?PROPS.find(x=>x.cod===cod):null;
 document.getElementById('admTitle').textContent=p?('Editar '+p.cod):'Nueva propiedad';
 document.getElementById('admSub').textContent='Catálogo · esta información alimenta la web pública';
 document.getElementById('admBody').innerHTML=`
   ${fld('Título',p?p.tit:'','Ej. Casa exclusiva en La Molina')}
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px">
     ${fld('Distrito / zona',p?p.dist:'')}${fld('Tipo',p?TIPO_LBL[p.tipo]:'')}
     ${fld('Precio venta (USD)',p&&p.venta?p.venta:'')}${fld('Precio alquiler (USD)',p&&p.alq?p.alq:'')}
     ${fld('Dormitorios',p&&p.dorm?p.dorm:'')}${fld('Baños',p&&p.ban?p.ban:'')}
     ${fld('Cocheras',p&&p.est?p.est:'')}${fld('Área (m²)',p&&p.area?p.area:'')}
   </div>
   ${fld('Descripción',p?p.desc:'','Describe la propiedad…','area')}
   <div class="lbl">Fotos de la propiedad</div>
   <div style="border:1.5px dashed var(--line);border-radius:8px;padding:16px;text-align:center;color:var(--muted);background:#fff">
     <div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px">${[0,1,2].map(()=>`<div style="width:64px;height:48px;border-radius:5px;background:radial-gradient(120% 120% at 50% 40%,#232323,#141414)"></div>`).join('')}</div>
     Arrastra imágenes aquí o <span class="mini">selecciona archivos</span> · JPG/PNG</div>
   <div class="lbl">Video de YouTube (canal de Karen Quezada)</div>
   <input placeholder="https://youtu.be/… o https://youtube.com/watch?v=…" value="${p&&p.video?p.video:''}">
   <div class="lbl">Estado</div>
   <select style="width:100%;border:1px solid var(--line);padding:11px 13px;border-radius:6px;background:#fff;font-family:'Jost'"><option>Disponible</option><option>Reservado</option><option>Vendido</option><option>Retirado</option></select>
   <div style="display:flex;gap:10px;margin-top:22px"><button class="btn btn-gold" style="flex:1;justify-content:center" onclick="admSave()">Guardar</button><button class="btn btn-ghost" onclick="closeAdm()">Cancelar</button></div>`;
 admOpen();
}
function openAdmSection(key){
 buildAdminUI(); const f=SITE.founder,h=SITE.hero,c=SITE.contacto; let body='',title='';
 if(key==='hero'){title='Portada (Hero)';body=fld('Título principal',h.title.replace(/<[^>]+>/g,''))+fld('Subtítulo',h.sub,'','area');}
 else if(key==='founder'){title='Reseña de la fundadora';body=fld('Nombre',f.name)+fld('Rol / cargo',f.role)+fld('Frase destacada',f.quote,'','area')+fld('Reseña completa',f.body,'','area')+fld('Canal de YouTube',f.ytChannel,'https://youtube.com/@…');}
 else if(key==='servicios'){title='Servicios';body='<div class="lbl">Servicios visibles en la web</div>'+['Venta','Compra','Inversión','Asesoría legal','Visitas guiadas','Acompañamiento total'].map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--line);font-size:14px"><span>${s}</span><span class="mini">Editar texto</span></div>`).join('');}
 else if(key==='sell'){title='Vende con nosotros';body=fld('Título',SITE.sell.title)+fld('Texto',SITE.sell.body,'','area');}
 else if(key==='video'){title='Video destacado';body=fld('Título',SITE.video.title)+fld('Subtítulo',SITE.video.sub)+fld('Enlace de YouTube',SITE.video.url,'https://youtu.be/…');}
 else if(key==='stats'){title='Estadísticas';body='<div class="lbl">Contadores (número y etiqueta)</div>'+SITE.stats.map((s,i)=>`<div style="display:grid;grid-template-columns:1fr 2fr;gap:10px;margin-bottom:8px"><input value="${s.n}"><input value="${s.l}"></div>`).join('');}
 else if(key==='contacto'){title='Contacto y redes';body=fld('WhatsApp',c.whatsapp)+fld('Correo',c.email)+fld('Instagram',SITE.social.ig)+fld('Facebook',SITE.social.fb)+fld('TikTok',SITE.social.tiktok)+fld('YouTube (canal)',SITE.social.yt,'https://youtube.com/@…');}
 else if(key==='destacadas'){title='Propiedades destacadas';body='<div class="lbl">Marca las propiedades que aparecen en la portada</div>'+PROPS.map(p=>`<label style="display:flex;gap:10px;align-items:center;padding:7px 0;font-size:13.5px;border-bottom:1px solid var(--line)"><input type="checkbox" ${p.dest?'checked':''}> <b>${p.cod}</b> — ${p.tit.slice(0,46)}</label>`).join('');}
 document.getElementById('admTitle').textContent=title;
 document.getElementById('admSub').textContent='Sección editable del sitio web';
 document.getElementById('admBody').innerHTML=body+`<div style="display:flex;gap:10px;margin-top:22px"><button class="btn btn-gold" style="flex:1;justify-content:center" onclick="admSave()">Guardar cambios</button><button class="btn btn-ghost" onclick="closeAdm()">Cancelar</button></div>`;
 admOpen();
}


/* ===================================================================
   KQ Real Estate — conexión real al backend (reemplaza la demo).
   Estas definiciones aparecen DESPUÉS de las del prototipo, por lo que
   (por hoisting de function declarations) sobrescriben a las demo.
   =================================================================== */
async function api(path, opts){
  const o = Object.assign({ headers:{'Content-Type':'application/json'}, credentials:'same-origin' }, opts||{});
  const r = await fetch(path, o);
  let d = null; try { d = await r.json(); } catch(e){}
  if(!r.ok) throw new Error((d && d.error) || ('Error '+r.status));
  return d;
}

/* ---------- LOGIN ---------- */
function vLogin(){
 return `<div class="auth-wrap"><div class="auth-side">
   <div class="brand" style="margin-bottom:26px"><img src="${LOGO}" style="height:48px"><div><div style="font-family:'Corm';font-size:22px;color:#efe9dd;font-weight:600">KQ Real Estate</div><div class="brand-sub">LIMA &amp; BEACH PROPERTIES</div></div></div>
   <h2 class="serif" style="font-size:40px;color:#fff">Bienvenido de vuelta</h2>
   <p style="color:#cfc9bd;margin-top:12px;max-width:40ch">Ingresa para acceder a tus favoritos, tus visitas agendadas y las novedades del catálogo.</p>
 </div>
 <div class="auth-form"><h2 class="serif">Iniciar sesión</h2><p style="color:var(--muted);margin-top:4px">¿No tienes cuenta? <a class="mini" onclick="go('#/registro')">Regístrate gratis</a></p>
   <div class="field"><label>Correo electrónico</label><input id="lg-mail" type="email" placeholder="tucorreo@ejemplo.com" onkeydown="if(event.key==='Enter')doLogin()"></div>
   <div class="field"><label>Contraseña</label><input id="lg-pass" type="password" placeholder="Tu contraseña" onkeydown="if(event.key==='Enter')doLogin()"></div>
   <button class="btn btn-dark" style="justify-content:center;margin-top:20px" onclick="doLogin()">Ingresar</button>
   <p id="lg-err" style="font-size:12.5px;color:#c0392b;margin-top:12px;display:none"></p>
   <p style="font-size:11.5px;color:var(--muted);margin-top:16px">El acceso de administración usa este mismo formulario; el rol se valida en el servidor. El público general nunca accede a la administración.</p>
 </div></div>`;
}
async function doLogin(){
 const email=((document.getElementById('lg-mail')||{}).value||'').trim();
 const pass=(document.getElementById('lg-pass')||{}).value||'';
 const err=document.getElementById('lg-err');
 if(err){err.style.display='none';}
 try{
   const d=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email,password:pass})});
   location.hash = d.role==='admin' ? '#/admin' : '#/cuenta';
   location.reload();
 }catch(e){ if(err){err.textContent=e.message||'Credenciales inválidas';err.style.display='block';} }
}

/* ---------- REGISTRO ---------- */
function vRegistro(){
 const perks=[["heart","Guarda tus favoritos","Arma tu lista de propiedades preferidas y compáralas cuando quieras."],
   ["tour","Agenda visitas en un clic","Coordina visitas presenciales o tours virtuales al instante."],
   ["star","Alertas personalizadas","Recibe avisos cuando publiquemos algo que calce con lo que buscas."],
   ["wa","Contacto directo","Habla directamente con Karen y recibe atención prioritaria."]];
 return `<div class="auth-wrap"><div class="auth-side">
   <div class="brand" style="margin-bottom:26px"><img src="${LOGO}" style="height:48px"><div><div style="font-family:'Corm';font-size:22px;color:#efe9dd;font-weight:600">KQ Real Estate</div><div class="brand-sub">LIMA &amp; BEACH PROPERTIES</div></div></div>
   <h2 class="serif" style="font-size:38px;color:#fff">Crea tu cuenta gratis</h2>
   <div style="margin-top:22px">${perks.map(p=>`<div class="perk"><span class="ic">${I[p[0]]}</span><div><b style="color:#efe9dd">${p[1]}</b><div style="font-size:13px">${p[2]}</div></div></div>`).join("")}</div>
 </div>
 <div class="auth-form"><h2 class="serif">Regístrate</h2><p style="color:var(--muted);margin-top:4px">¿Ya tienes cuenta? <a class="mini" onclick="go('#/login')">Inicia sesión</a></p>
   <div class="field"><label>Nombre completo</label><input id="rg-name" placeholder="Tu nombre"></div>
   <div class="field"><label>Correo electrónico</label><input id="rg-mail" type="email" placeholder="tucorreo@ejemplo.com"></div>
   <div class="field"><label>WhatsApp</label><input id="rg-wa" placeholder="9XX XXX XXX"></div>
   <div class="field"><label>Contraseña</label><input id="rg-pass" type="password" placeholder="Mínimo 8 caracteres" onkeydown="if(event.key==='Enter')doRegister()"></div>
   <button class="btn btn-gold" style="justify-content:center;margin-top:20px" onclick="doRegister()">Crear mi cuenta</button>
   <p id="rg-err" style="font-size:12.5px;color:#c0392b;margin-top:12px;display:none"></p>
   <p style="font-size:11.5px;color:var(--muted);margin-top:14px">Al registrarte aceptas nuestros Términos y la Política de Privacidad. Tus datos se usan solo para brindarte el servicio.</p>
 </div></div>`;
}
async function doRegister(){
 const g=id=>((document.getElementById(id)||{}).value||'').trim();
 const err=document.getElementById('rg-err');
 if(err){err.style.display='none';}
 try{
   await api('/api/auth/register',{method:'POST',body:JSON.stringify({nombre:g('rg-name'),email:g('rg-mail'),whatsapp:g('rg-wa'),password:g('rg-pass')})});
   location.hash='#/cuenta'; location.reload();
 }catch(e){ if(err){err.textContent=e.message||'No se pudo crear la cuenta';err.style.display='block';} }
}
async function logout(){ try{ await api('/api/auth/logout',{method:'POST'}); }catch(e){} location.hash='#/'; location.reload(); }

/* ---------- FAVORITOS / VISITAS ---------- */
async function toggleFav(cod){
 if(!state.auth.logged){ toast("Crea una cuenta gratis para guardar favoritos"); go('#/registro'); return; }
 try{
   if(state.favs.has(cod)){ await api('/api/favoritos',{method:'DELETE',body:JSON.stringify({cod})}); state.favs.delete(cod); }
   else { await api('/api/favoritos',{method:'POST',body:JSON.stringify({cod})}); state.favs.add(cod); toast("Guardado en favoritos ♥"); }
   render();
 }catch(e){ toast(e.message||'No se pudo actualizar'); }
}
async function agendar(cod){
 if(!state.auth.logged){ toast("Crea una cuenta para agendar tu visita"); go('#/registro'); return; }
 try{ await api('/api/visitas',{method:'POST',body:JSON.stringify({cod})}); toast("¡Visita solicitada! Karen te contactará para confirmar."); }
 catch(e){ toast(e.message||'No se pudo agendar'); }
}

/* ---------- LEADS (contacto / vende) ---------- */
async function leadSent(msg){
 const g=id=>{const el=document.getElementById(id);return el?(el.value||'').trim():''};
 const payload={nombre:g('ct-n'),apellido:g('ct-a'),email:g('ct-e'),whatsapp:g('ct-p'),mensaje:g('ct-m'),origen:'contacto'};
 if(!payload.email && !payload.whatsapp){ toast('Déjanos tu correo o WhatsApp para contactarte.'); return; }
 try{
   await api('/api/leads',{method:'POST',body:JSON.stringify(payload)});
   toast(msg||'¡Gracias! Te contactaremos pronto.');
   ['ct-n','ct-a','ct-e','ct-p','ct-m'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
 }catch(e){ toast('No se pudo enviar. Escríbenos por WhatsApp.'); }
}
function sellBand(){ const s=SITE.sell; return `<section style="background:linear-gradient(120deg,#1b1b1b 0%,#242424 60%,#1b1b1b 100%);color:#fff"><div class="wrap" style="display:grid;grid-template-columns:1.3fr 1fr;gap:48px;align-items:center">
   <div><div class="eyebrow" style="color:var(--goldL)">Vende con nosotros</div><h2 class="serif" style="font-size:38px;margin-top:10px">${s.title}</h2>
     <p style="color:#cfc9bd;margin-top:14px;font-size:16px;max-width:52ch">${s.body}</p></div>
   <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:26px">
     <div style="font-family:'Corm';font-size:22px;margin-bottom:14px">Cuéntanos de tu propiedad</div>
     <input id="sb-n" placeholder="Nombre" style="width:100%;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 13px;border-radius:4px;margin-bottom:10px;font-family:'Jost'">
     <input id="sb-p" placeholder="WhatsApp" style="width:100%;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 13px;border-radius:4px;margin-bottom:10px;font-family:'Jost'">
     <input id="sb-d" placeholder="Distrito de la propiedad" style="width:100%;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 13px;border-radius:4px;margin-bottom:14px;font-family:'Jost'">
     <button class="btn btn-gold" style="width:100%;justify-content:center" onclick="sendSell()">Quiero vender / alquilar</button></div>
 </div></section>`; }
async function sendSell(){
 const g=id=>{const el=document.getElementById(id);return el?(el.value||'').trim():''};
 if(!g('sb-p')){ toast('Déjanos tu WhatsApp para contactarte.'); return; }
 try{
   await api('/api/leads',{method:'POST',body:JSON.stringify({nombre:g('sb-n'),whatsapp:g('sb-p'),mensaje:'Quiere vender/alquilar. Distrito: '+g('sb-d'),origen:'vende'})});
   toast('Gracias, te contactaremos para tasar tu propiedad.');
   ['sb-n','sb-p','sb-d'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
 }catch(e){ toast('No se pudo enviar. Escríbenos por WhatsApp.'); }
}

/* ---------- FEEDBACK (guarda en BD + opción WhatsApp) ---------- */
async function submitFeedback(){
 const g=id=>{const el=document.getElementById(id);return el?(el.value||'').trim():''};
 const like=g('fbLike'),imp=g('fbImprove'),name=g('fbName');
 try{ await api('/api/feedback',{method:'POST',body:JSON.stringify({estrellas:fbStars||null,le_gusto:like,mejoraria:imp,nombre:name})}); }catch(e){}
 const txt=`Feedback KQ Real Estate%0A%0ACalificacion: ${fbStars||'-'}/5%0ALe gusto: ${encodeURIComponent(like||'-')}%0AMejoraria: ${encodeURIComponent(imp||'-')}%0ANombre: ${encodeURIComponent(name||'-')}`;
 document.getElementById('fbBody').innerHTML=`<div class="fb-ok"><div class="big">${I.check}</div>
   <h3 class="serif" style="font-size:24px">¡Gracias por tu opinión!</h3>
   <p style="color:var(--muted);margin-top:8px">Registramos tu feedback. Si quieres, envíalo también por WhatsApp.</p>
   <a class="btn btn-gold" style="justify-content:center;margin-top:16px" href="${WA}?text=${txt}">${I.wa} Enviar por WhatsApp</a>
   <button class="btn btn-ghost" style="justify-content:center;margin-top:6px;width:100%" onclick="closeFeedback()">Cerrar</button></div>`;
}

/* ---------- ADMIN: guardar propiedad (media + descripción + destacada) ---------- */
function openAdmProp(cod){
 buildAdminUI(); const p=cod?PROPS.find(x=>x.cod===cod):null;
 if(!p){ toast('El alta de nuevas propiedades se hace en el catálogo operativo (n8n).'); return; }
 document.getElementById('admTitle').textContent='Editar '+p.cod;
 document.getElementById('admSub').textContent='Contenido web de la propiedad (los precios/fichas se editan en el catálogo operativo)';
 const fotos=(p.fotos||[]).join('\n');
 document.getElementById('admBody').innerHTML=`
   <div style="background:#f6f7f9;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;font-size:13px;color:#555">
     <b>${p.tit}</b><br>${p.dist} · ${TIPO_LBL[p.tipo]||p.tipo} · ${p.consultar?'A consultar':(p.oper==='alquiler'?FMT(p.alq)+'/mes':FMT(p.venta))}
     <div style="font-size:11.5px;color:#8b9099;margin-top:4px">Estos datos vienen del catálogo (kqv_propiedades) y no se editan aquí.</div>
   </div>
   <label style="display:flex;gap:10px;align-items:center;margin-top:16px;font-size:14px"><input type="checkbox" id="ap-dest" ${p.dest?'checked':''}> Mostrar como <b>propiedad destacada</b> en la portada</label>
   <div class="lbl">Descripción para la web (opcional; si la dejas vacía se usa la del catálogo)</div>
   <textarea id="ap-desc" rows="5" placeholder="Descripción curada para el sitio…">${(p.descOverride||'')}</textarea>
   <div class="lbl">Fotos — una URL por línea (JPG/PNG)</div>
   <textarea id="ap-fotos" rows="4" placeholder="https://…/foto1.jpg&#10;https://…/foto2.jpg">${fotos}</textarea>
   <div class="lbl">Video de YouTube (canal de Karen Quezada)</div>
   <input id="ap-video" placeholder="https://youtu.be/… o https://youtube.com/watch?v=…" value="${(p.video||'').replace(/"/g,'&quot;')}">
   <div style="display:flex;gap:10px;margin-top:22px"><button class="btn btn-gold" style="flex:1;justify-content:center" onclick="saveAdmProp('${p.cod}')">Guardar</button><button class="btn btn-ghost" onclick="closeAdm()">Cancelar</button></div>`;
 admOpen();
}
async function saveAdmProp(cod){
 const g=id=>{const el=document.getElementById(id);return el?el.value:''};
 const fotos=g('ap-fotos').split('\n').map(s=>s.trim()).filter(Boolean);
 const payload={ cod, dest:document.getElementById('ap-dest').checked, descripcion:g('ap-desc').trim(), fotos, video:g('ap-video').trim() };
 try{ await api('/api/admin/propiedad',{method:'POST',body:JSON.stringify(payload)}); closeAdm(); toast('Guardado. Recargando…'); setTimeout(()=>location.reload(),700); }
 catch(e){ toast(e.message||'No se pudo guardar'); }
}

/* ---------- ADMIN: guardar secciones ---------- */
function openAdmSection(key){
 buildAdminUI(); const f=SITE.founder,h=SITE.hero,c=SITE.contacto,s=SITE.social; let body='',title='';
 if(key==='hero'){ title='Portada (Hero)';
   body=fld('Antetítulo (eyebrow)',h.eyebrow)+fld('Título principal',(h.title||'').replace(/<[^>]+>/g,''))+fld('Subtítulo',h.sub,'','area'); }
 else if(key==='founder'){ title='Reseña de la fundadora';
   body=fld('Nombre',f.name)+fld('Rol / cargo',f.role)+fld('Frase destacada',f.quote,'','area')+fld('Reseña completa',f.body,'','area'); }
 else if(key==='sell'){ title='Vende con nosotros'; body=fld('Título',SITE.sell.title)+fld('Texto',SITE.sell.body,'','area'); }
 else if(key==='video'){ title='Video destacado'; body=fld('Título',SITE.video.title)+fld('Subtítulo',SITE.video.sub)+fld('Enlace de YouTube',SITE.video.url,'https://youtu.be/…'); }
 else if(key==='stats'){ title='Estadísticas'; body='<div class="lbl">Contadores (número y etiqueta)</div>'+(SITE.stats||[]).map((st,i)=>`<div style="display:grid;grid-template-columns:1fr 2fr;gap:10px;margin-bottom:8px"><input id="stn${i}" value="${(st.n||'').replace(/"/g,'&quot;')}"><input id="stl${i}" value="${(st.l||'').replace(/"/g,'&quot;')}"></div>`).join(''); }
 else if(key==='contacto'){ title='Contacto y redes'; body=fld('WhatsApp',c.whatsapp)+fld('Correo',c.email)+fld('Instagram',s.ig)+fld('Facebook',s.fb)+fld('TikTok',s.tiktok)+fld('YouTube (canal)',s.yt,'https://youtube.com/@…'); }
 else { toast('Esta sección se editará próximamente.'); return; }
 document.getElementById('admTitle').textContent=title;
 document.getElementById('admSub').textContent='Sección editable del sitio web · se guarda en la base de datos';
 document.getElementById('admBody').innerHTML=body+`<div style="display:flex;gap:10px;margin-top:22px"><button class="btn btn-gold" style="flex:1;justify-content:center" onclick="saveAdmSection('${key}')">Guardar cambios</button><button class="btn btn-ghost" onclick="closeAdm()">Cancelar</button></div>`;
 admOpen();
}
async function saveAdmSection(key){
 const inputs=document.querySelectorAll('#admBody input, #admBody textarea');
 const v=[...inputs].map(el=>el.value);
 let updates=[];
 if(key==='hero') updates=[['hero',{eyebrow:v[0],title:v[1],sub:v[2]}]];
 else if(key==='founder') updates=[['founder',{name:v[0],role:v[1],quote:v[2],body:v[3]}]];
 else if(key==='sell') updates=[['sell',{title:v[0],body:v[1]}]];
 else if(key==='video') updates=[['video',{title:v[0],sub:v[1],url:v[2]}]];
 else if(key==='stats'){ const arr=[]; for(let i=0;i<v.length;i+=2){ if(v[i]||v[i+1]) arr.push({n:v[i],l:v[i+1]}); } updates=[['stats',arr]]; }
 else if(key==='contacto') updates=[['contacto',{whatsapp:v[0],email:v[1]}],['social',{ig:v[2],fb:v[3],tiktok:v[4],yt:v[5]}]];
 try{ for(const [clave,valor] of updates){ await api('/api/admin/content',{method:'POST',body:JSON.stringify({clave,valor})}); } closeAdm(); toast('Guardado. Recargando…'); setTimeout(()=>location.reload(),700); }
 catch(e){ toast(e.message||'No se pudo guardar'); }
}

/* ---------- ADMIN: vista con datos reales (usuarios, leads) ---------- */
function vAdmin(sub){
 if(!state.auth.logged || state.auth.role!=='admin'){
   return `<div class="lockbox"><div style="color:var(--goldD);width:40px;margin:0 auto 14px">${I.shield}</div>
     <h2 class="serif" style="font-size:26px">Acceso restringido</h2>
     <p style="color:var(--muted);margin-top:10px">La administración es exclusiva del equipo KQ Real Estate. Los usuarios del público general no pueden ingresar aquí.</p>
     <button class="btn btn-dark" style="justify-content:center;margin-top:18px" onclick="go('#/login')">Ingresar como administrador</button>
     <button class="btn btn-ghost" style="justify-content:center;margin-top:6px" onclick="go('#/')">Volver al inicio</button></div>`;
 }
 sub=sub||'propiedades';
 const AD=(window.__BOOT__&&window.__BOOT__.adminData)||{usuarios:[],leads:[]};
 const menu=[["propiedades","home","Propiedades"],["secciones","layout","Secciones del sitio"],["leads","leads","Leads del sitio"],["usuarios","users","Usuarios"]];
 let main="";
 if(sub==='propiedades'){
   main=`<div class="admin-top"><h1>Catálogo de propiedades</h1><span style="font-size:12px;color:#8b9099">El alta/edición de fichas se hace en el catálogo operativo · aquí gestionas fotos, video, descripción web y destacadas</span></div>
   <div class="kpis"><div class="kpi"><div class="n">${PROPS.length}</div><div class="l">Publicadas</div></div><div class="kpi"><div class="n">${PROPS.filter(p=>p.dest).length}</div><div class="l">Destacadas</div></div><div class="kpi"><div class="n">${PROPS.filter(p=>(p.fotos||[]).length).length}</div><div class="l">Con fotos</div></div><div class="kpi"><div class="n">${PROPS.filter(p=>p.video).length}</div><div class="l">Con video</div></div></div>
   <div class="panel"><div class="ph"><h3>Todas las propiedades</h3><span style="font-size:12px;color:#8b9099">Fotos · video · descripción web · destacada</span></div>
     <table><thead><tr><th>Código</th><th>Título</th><th>Zona</th><th>Precio</th><th>Fotos</th><th>Destacada</th><th></th></tr></thead><tbody>
     ${PROPS.map(p=>`<tr><td style="font-weight:600">${p.cod}</td><td>${p.tit}</td><td>${p.dist}</td><td>${p.consultar?'A consultar':(p.oper==='alquiler'?FMT(p.alq)+'/mes':FMT(p.venta))}</td><td>${(p.fotos||[]).length||'—'}</td><td>${p.dest?'<span class="pill ok">Sí</span>':'<span class="pill res">No</span>'}</td><td><span class="mini" onclick="openAdmProp('${p.cod}')">Editar</span></td></tr>`).join("")}
     </tbody></table></div>`;
 } else if(sub==='secciones'){
   main=`<div class="admin-top"><h1>Secciones del sitio</h1></div>
   <div class="panel"><table><thead><tr><th>Sección</th><th>Qué controla</th><th></th></tr></thead><tbody>
   ${[["hero","Portada (Hero)","Antetítulo, título y subtítulo"],["sell","Vende con nosotros","Título y texto de captación"],["stats","Estadísticas","Contadores de confianza"],["video","Video destacado","Enlace de YouTube y textos"],["founder","Reseña de la fundadora","Frase y reseña de Karen"],["contacto","Contacto y redes","WhatsApp, correo y redes sociales"]].map(s=>`<tr><td style="font-weight:600">${s[1]}</td><td>${s[2]}</td><td><span class="mini" onclick="openAdmSection('${s[0]}')">Editar</span></td></tr>`).join("")}
   </tbody></table></div>`;
 } else if(sub==='leads'){
   const L=AD.leads||[];
   main=`<div class="admin-top"><h1>Leads del sitio web</h1><span style="font-size:12px;color:#8b9099">Formularios de contacto y "vende con nosotros"</span></div>
   <div class="panel"><table><thead><tr><th>Fecha</th><th>Nombre</th><th>Contacto</th><th>Origen</th><th>Mensaje</th></tr></thead><tbody>
   ${L.length?L.map(l=>`<tr><td>${(l.created_at||'').slice(0,10)}</td><td style="font-weight:600">${(l.nombre||'—')}</td><td>${[l.email,l.whatsapp].filter(Boolean).join(' · ')||'—'}</td><td><span class="pill ${l.origen==='vende'?'res':'ok'}">${l.origen||'contacto'}</span></td><td>${(l.mensaje||'').slice(0,70)}</td></tr>`).join(""):`<tr><td colspan="5" style="text-align:center;color:#8b9099;padding:30px">Aún no hay leads del sitio.</td></tr>`}
   </tbody></table></div>`;
 } else {
   const U=AD.usuarios||[];
   main=`<div class="admin-top"><h1>Usuarios registrados</h1><span style="font-size:12px;color:#8b9099">Público general — no acceden a esta administración</span></div>
   <div class="panel"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Registro</th></tr></thead><tbody>
   ${U.length?U.map(u=>`<tr><td style="font-weight:600">${(u.nombre||'')} ${(u.apellido||'')}</td><td>${u.email||''}</td><td><span class="pill ${u.rol==='admin_sitio'?'res':'ok'}">${u.rol==='admin_sitio'?'Administrador':'Cliente'}</span></td><td>${(u.created_at||'').slice(0,10)}</td></tr>`).join(""):`<tr><td colspan="4" style="text-align:center;color:#8b9099;padding:30px">Aún no hay usuarios registrados.</td></tr>`}
   </tbody></table></div>`;
 }
 return `<div class="admin"><aside class="admin-side">
   <div class="lg"><img src="${LOGO}"><div style="font-family:'Corm';color:#efe9dd;font-weight:600">KQ Admin</div></div>
   <div class="grp">Sitio web</div>
   ${menu.map(m=>`<a class="${sub===m[0]?'on':''}" onclick="go('#/admin/${m[0]}')">${I[m[1]]}<span>${m[2]}</span></a>`).join("")}
   <div class="grp">Operación</div>
   <a onclick="window.open('https://kq-realestate.cloud/webhook/kqv-panel','_blank')">${I.leads}<span>Panel de leads (n8n)</span></a>
   <div class="grp">Sesión</div>
   <a onclick="go('#/')">${I.home}<span>Ver sitio público</span></a>
   <a onclick="logout()">${I.logout}<span>Cerrar sesión</span></a>
 </aside><main class="admin-main">
   <div style="background:#fdf6e3;border:1px solid #f0e2b8;color:#8a6d1b;font-size:12.5px;padding:9px 14px;border-radius:6px;margin-bottom:18px">Estás en la <b>administración del sitio web</b>. El panel de leads del bot y los workflows n8n se gestionan por separado.</div>
   ${main}
 </main></div>`;
}

/* ---------- router ---------- */
function render(){
 const h=location.hash||"#/";
 const root=document.getElementById('root'); let html;
 if(h==="#/"||h==="") html=vHome();
 else if(h.startsWith("#/propiedades")) html=vCatalogo();
 else if(h.startsWith("#/propiedad/")) html=vProp(decodeURIComponent(h.split("/")[2]));
 else if(h.startsWith("#/servicios")) html=vServicios();
 else if(h.startsWith("#/mapa")) html=vMapa();
 else if(h.startsWith("#/nosotros")) html=vNosotros();
 else if(h.startsWith("#/contacto")){ html=vContacto(); }
 else if(h.startsWith("#/login")) html=vLogin();
 else if(h.startsWith("#/registro")) html=vRegistro();
 else if(h.startsWith("#/cuenta")) html=vCuenta();
 else if(h.startsWith("#/admin")){ const parts=h.split("/"); html=vAdmin(parts[2]); }
 else html=vHome();
 root.innerHTML = html + `<div class="wa-float" onclick="window.open('${WA}','_blank')">${I.wa}</div>`;
 // nav scroll behavior
 const n=document.getElementById('nav');
 if(n && n.classList.contains('top')){ const onScroll=()=>{ if(window.scrollY>60){n.classList.remove('top');n.classList.add('solid');}else{n.classList.add('top');n.classList.remove('solid');} }; window.onscroll=onScroll; onScroll(); }
 else { window.onscroll=null; }
}
window.addEventListener('hashchange',render);
render();
/* feedback: botón siempre visible + invitación automática a los 3s (solo se cierra con la X) */
buildFeedbackUI();
setTimeout(()=>{const i=document.getElementById('fbInvite');if(i)i.classList.add('show');},3000);
