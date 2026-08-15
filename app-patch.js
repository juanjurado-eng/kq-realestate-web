/* ===================================================================
   Parche del sitio KQ Real Estate. Se carga DESPUÉS de app.js.
   - Muestra las FOTOS reales (subidas por el admin) en tarjetas y ficha.
   - Editor de propiedad: subir fotos por archivo + ORDENAR (drag / ◀ ▶).
   =================================================================== */

/* ---------- Estilos del parche (tarjeta estilo minimalista) ---------- */
(function injectPatchCSS(){
 if(document.getElementById('kqv-patch-css')) return;
 const s=document.createElement('style'); s.id='kqv-patch-css';
 s.textContent=`
 .wrap{width:92%;max-width:1800px}
 .pgrid{gap:28px}
 @media(min-width:1500px){ .pgrid,.svc-grid{grid-template-columns:repeat(3,1fr)} }
 .pcard{border-radius:12px;box-shadow:0 12px 34px -20px rgba(0,0,0,.28)}
 .pcard .ph{aspect-ratio:3/2}
 .pcard .ph img{z-index:0}
 .pcard .ph::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.5),transparent 45%);pointer-events:none;z-index:1}
 .pcard .dist-badge{position:absolute;top:13px;left:13px;z-index:2;background:linear-gradient(135deg,#e2c766,#C9A227);color:#1a1400;font-size:10.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:5px 12px;border-radius:4px;box-shadow:0 4px 12px -4px rgba(201,162,39,.7)}
 .pcard .oper-badge{position:absolute;bottom:13px;left:15px;z-index:2;color:#fff;font-size:12px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase}
 .pcard .fav,.pcard .prev-tag{z-index:2}
 .pcard .body{padding:18px;gap:9px}
 .pcard .ptit{font-size:16.5px;font-weight:600;line-height:1.3;color:var(--ink)}
 .pcard .pdesc{font-size:13px;color:var(--muted);line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .pcard .specs2{display:flex;justify-content:space-between;gap:8px;padding:13px 0 0;color:var(--ink2);font-size:14px}
 .pcard .specs2 span{display:flex;align-items:center;gap:6px}
 .pcard .specs2 .ic{width:18px;height:18px;color:#a29b8c}
 .pcard .pfoot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:14px;margin-top:3px}
 .pcard .pfoot .price{font-size:22px}
 .pcard .plus{width:34px;height:34px;flex:0 0 auto;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--ink);font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s}
 .pcard:hover .plus{background:linear-gradient(135deg,#e2c766,#C9A227);border-color:transparent;color:#1a1400}
 .pcard.list .ph{aspect-ratio:auto}
 .desc-body h4.desc-sub{font-family:'Corm',serif;font-size:20px;font-weight:600;color:var(--ink);margin:26px 0 12px;padding:0 22px 7px 0;border-bottom:2px solid var(--gold);display:inline-block}
 .desc-body h4.desc-sub:first-child{margin-top:2px}
 .desc-body .desc-lead{font-weight:500;color:var(--ink);margin:16px 0 6px}
 .desc-body .desc-list2{list-style:none;margin:8px 0 12px;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:9px 34px}
 .desc-body .desc-list2 li{position:relative;padding-left:20px;font-size:15px;color:var(--ink2);line-height:1.5}
 .desc-body .desc-list2 li::before{content:'';position:absolute;left:2px;top:9px;width:6px;height:6px;border-radius:50%;background:var(--gold)}
 .desc-body p{margin-bottom:11px;line-height:1.65}
 @media(max-width:640px){ .desc-body .desc-list2{grid-template-columns:1fr} }
 .pd2-top{padding-top:96px}
 .pd2-back{color:var(--goldD);font-size:13px;letter-spacing:.4px;display:inline-block;margin-bottom:14px;cursor:pointer}
 .pd2-head{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;margin:18px 0 4px}
 .pd2-head h1{font-size:34px;margin-top:12px;color:var(--ink)}
 .pd2-addr{color:var(--muted);margin-top:6px;display:flex;align-items:center;gap:6px}
 .pd2-addr svg{width:15px;height:15px;color:var(--gold);flex:0 0 auto}
 .pd2-price{font-family:'Corm',serif;font-size:40px;font-weight:600;color:var(--goldD);white-space:nowrap}
 .pd2-specrow{display:flex;flex-wrap:wrap;margin:22px 0 6px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
 .pd2-spec{flex:1;min-width:110px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px;padding:20px 10px;border-right:1px solid var(--line)}
 .pd2-spec:last-child{border-right:0}
 .pd2-spec .ic{width:28px;height:28px;color:var(--gold);flex:0 0 auto}
 .pd2-spec b{font-size:18px;font-weight:600;color:var(--ink);line-height:1.1}
 .pd2-spec small{font-size:10.5px;letter-spacing:.8px;text-transform:uppercase;color:var(--muted)}
 .pd2-body{padding-top:10px;padding-bottom:20px}
 .pd2-gallery{margin-bottom:14px}
 .pd2-main{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:16/9;background:#141414;cursor:zoom-in}
 .pd2-main img{width:100%;height:100%;object-fit:cover;transition:.45s}
 .pd2-main:hover img{transform:scale(1.03)}
 .pd2-zoom{position:absolute;top:12px;right:12px;width:38px;height:38px;border-radius:50%;background:rgba(20,20,20,.5);color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
 .pd2-zoom svg{width:18px;height:18px}
 .pd2-thumbsrow{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:10px}
 .pd2-galhint{font-size:12px;color:var(--muted);white-space:nowrap;flex:0 0 auto}
 .pd2-thumbs{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}
 .pd2-thumbs img{width:118px;height:78px;object-fit:cover;border-radius:8px;cursor:pointer;flex:0 0 auto;border:2px solid transparent;opacity:.72;transition:.2s}
 .pd2-thumbs img:hover{opacity:1}
 .pd2-thumbs img.on{border-color:var(--gold);opacity:1}
 .pd2-lb{position:fixed;inset:0;background:rgba(8,8,8,.94);z-index:9999;display:none;align-items:center;justify-content:center}
 .pd2-lb.on{display:flex}
 .pd2-lb img{max-width:92vw;max-height:84vh;object-fit:contain;border-radius:6px;box-shadow:0 12px 60px rgba(0,0,0,.6)}
 .pd2-lb-close{position:absolute;top:14px;right:26px;color:#fff;font-size:40px;line-height:1;cursor:pointer;opacity:.85}
 .pd2-lb-close:hover{opacity:1}
 .pd2-lb-nav{position:absolute;top:50%;transform:translateY(-50%);color:#fff;font-size:40px;cursor:pointer;padding:14px 20px;user-select:none;opacity:.72}
 .pd2-lb-nav:hover{opacity:1}
 .pd2-lb-prev{left:6px}
 .pd2-lb-next{right:6px}
 .pd2-lb-count{position:absolute;bottom:20px;left:0;right:0;text-align:center;color:#fff;font-size:13px;letter-spacing:1.5px}
 .pd2-video{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;margin-bottom:24px;box-shadow:var(--shadow)}
 .pd2-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
 .pd2-general{background:#fff;border:1px solid var(--line);border-radius:12px;padding:24px 26px;margin-bottom:26px}
 .pd2-general h3{font-size:22px;margin-bottom:16px}
 .pd2-genrow{display:grid;grid-template-columns:repeat(4,1fr);gap:18px 24px}
 .pd2-genrow div{display:flex;flex-direction:column;gap:3px;border-left:2px solid var(--gold);padding-left:12px}
 .pd2-genrow small{font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted)}
 .pd2-genrow b{font-size:16px;color:var(--ink);font-weight:600}
 .pd2-cols{display:grid;grid-template-columns:1fr 380px;gap:38px;align-items:start}
 .pd2-desc h3{font-size:24px}
 .pd2-feats{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin-top:14px}
 .pd2-feats div{display:flex;align-items:center;gap:9px;font-size:14.5px;color:var(--ink2)}
 .pd2-feats .ic{width:17px;height:17px;color:var(--teal);flex:0 0 auto}
 .pd2-side{position:sticky;top:92px;display:flex;flex-direction:column;gap:16px}
 .pd2-map{border-radius:12px;overflow:hidden;border:1px solid var(--line);position:relative}
 .pd2-map iframe{width:100%;height:220px;border:0;display:block}
 .pd2-maploc{position:absolute;left:10px;bottom:10px;background:rgba(20,20,20,.82);color:#fff;font-size:12px;padding:4px 10px;border-radius:20px;display:flex;align-items:center;gap:5px}
 .pd2-contact{background:#fff;border:1px solid var(--line);border-radius:12px;padding:22px;box-shadow:var(--shadow)}
 .pd2-contact h3{font-size:21px}
 .pd2-contact p{font-size:13px;color:var(--muted);margin:4px 0 14px}
 .pd2-contact input{width:100%;border:1px solid var(--line);border-radius:6px;padding:11px 13px;font-family:'Jost';font-size:14px;background:var(--cream);margin-bottom:9px}
 .pd2-f2{display:grid;grid-template-columns:1fr 1fr;gap:9px}
 .pd2-f2 input{margin-bottom:0}
 .pd2-actions{display:flex;gap:9px;margin-top:12px}
 .pd2-actions .btn{flex:1;justify-content:center;padding:10px}
 .pd2-share{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:13px;padding-left:4px}
 .pd2-share a,.pd2-share button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--ink2);display:flex;align-items:center;justify-content:center;cursor:pointer}
 .pd2-share a svg,.pd2-share button svg{width:16px;height:16px}
 .pd2-share a:hover,.pd2-share button:hover{border-color:var(--gold);color:var(--goldD)}
 .pd2-sim{padding:34px 0 10px;border-top:1px solid var(--line);margin-top:30px}
 @media(max-width:980px){ .pd2-cols{grid-template-columns:1fr} .pd2-side{position:static} .pd2-genrow{grid-template-columns:repeat(2,1fr)} }
 @media(max-width:640px){ .pd2-galhint{display:none} .pd2-spec{min-width:33.33%;flex:0 0 33.33%;padding:14px 6px} .pd2-spec:nth-child(3){border-right:0} }
 @media(max-width:560px){ .pd2-genrow{grid-template-columns:1fr} .pd2-feats{grid-template-columns:1fr} .pd2-price{font-size:30px} .pd2-head h1{font-size:26px} }
`;
 document.head.appendChild(s);
})();

/* ---------- Descripción estructurada (subtítulos + listas premium) ---------- */
function renderDesc(text){
 const t = (typeof cleanText==='function'? cleanText(text): (text||'')); if(!t) return '';
 const lines = t.split('\n').map(x=>x.trim()).filter(Boolean);
 const wc = ln => ln.split(/\s+/).length;
 const SEC = /(\bpisos?\b|\bniveles?\b|\bnivel\b|^s[oó]tano|^azotea|^mezzanine|^planta baja|^distribuci[oó]n|^acabados|^amenities|^caracter[ií]sticas|^zonas? comunes|^á?reas? comunes)/i;
 const isHeading = ln => !/\d/.test(ln) && !/[.]$/.test(ln) && wc(ln) <= 6 && SEC.test(ln);
 let html='', bul=[];
 const flush=()=>{ if(bul.length){ html += '<ul class="desc-list2">' + bul.map(b=>`<li>${b}</li>`).join('') + '</ul>'; bul=[]; } };
 for(const ln of lines){
   const colon = /:$/.test(ln);
   if(isHeading(ln) && !colon){ flush(); html += `<h4 class="desc-sub">${ln}</h4>`; }
   else if(colon && wc(ln) <= 3){ flush(); html += `<h4 class="desc-sub">${ln.replace(/:$/,'')}</h4>`; }
   else if(colon){ flush(); html += `<p class="desc-lead">${ln}</p>`; }
   else if(/[.!?]$/.test(ln) && wc(ln) > 13){ flush(); html += `<p>${ln}</p>`; }
   else { bul.push(ln.replace(/\s*\.$/,'')); }
 }
 flush();
 return html;
}

/* ---------- Tarjeta minimalista (foto + specs con íconos + precio) ---------- */
function propCard(p, listMode){
 const price = priceMain(p);
 const areaTxt = p.area ? p.area+' m²' : '—';
 const specs = p.tipo==="terreno"
   ? `<span>${ic('area')} ${areaTxt}</span><span>${ic('pin')} ${p.dist}</span>`
   : `<span>${ic('area')} ${areaTxt}</span><span>${ic('bed')} ${p.dorm||'—'}</span><span>${ic('car')} ${p.est||0}</span><span>${ic('bath')} ${p.ban||'—'}</span>`;
 const hasFoto = p.fotos && p.fotos.length;
 const img = hasFoto ? p.fotos[0] : scene(p.scene, p.cod.charCodeAt(6));
 const sd = (p.desc||'').replace(/\s+/g,' ').trim();
 const desc1 = sd ? (sd.length>90 ? sd.slice(0,90).trim()+'…' : sd) : ((TIPO_LBL[p.tipo]||p.tipo)+' en '+p.dist+'.');
 return `<article class="pcard${listMode?' list':''}" onclick="go('#/propiedad/${p.cod}')">
   <div class="ph"><img src="${img}" alt="${p.tit}" loading="lazy">
     <span class="dist-badge">${p.dist}</span>
     <span class="oper-badge">${OPER_LBL[p.oper]}</span>
     <button class="fav ${state.favs.has(p.cod)?'on':''}" onclick="event.stopPropagation();toggleFav('${p.cod}')">${I.heart}</button>
     ${hasFoto ? '' : '<span class="prev-tag">Foto próximamente</span>'}
   </div>
   <div class="body">
     <div class="ptit">${p.tit}</div>
     <div class="pdesc">${desc1}</div>
     <div class="specs2">${specs}</div>
     <div class="pfoot"><div class="price">${price}</div><button class="plus" aria-label="Ver detalle">+</button></div>
   </div></article>`;
}

/* ---------- Ficha: galería con fotos reales ---------- */
function vProp(cod){
 const p=PROPS.find(x=>x.cod===cod); if(!p) return vCatalogo();
 const price=priceMain(p);
 const yt=ytId(p.video);
 const hasFotos = p.fotos && p.fotos.length;
 const imgs = hasFotos ? p.fotos : [0,1,2,3].map(n=>scene(p.scene, p.cod.charCodeAt(6)+n));
 const areaT = p.area ? p.area+' m²' : '—';
 const areaC = p.areaC ? p.areaC+' m²' : null;
 const spec=[['area',areaT,'Área total']];
 if(areaC) spec.push(['area',areaC,'Á. techada']);
 if(p.tipo!=='terreno'){ spec.push(['bed',p.dorm||'—','Dorm.']); spec.push(['bath',p.ban||'—','Baños']); spec.push(['car',p.est||0,'Cocheras']); }
 const gen=[['Operación',OPER_LBL[p.oper]],[p.oper==='alquiler'?'Precio alquiler':'Precio',price],['Área total',areaT]];
 if(areaC) gen.push(['Área techada',areaC]);
 if(p.dorm) gen.push(['Dormitorios',p.dorm]);
 if(p.ban) gen.push(['Baños',p.ban]);
 if(p.est!=null) gen.push(['Cocheras',p.est]);
 if(p.piso) gen.push(['Piso',p.piso]);
 if(p.ant!=null) gen.push(['Antigüedad',p.ant+' años']);
 if(p.vista) gen.push(['Vista',p.vista]);
 gen.push(['Tipo',TIPO_LBL[p.tipo]||p.tipo]); gen.push(['Código',p.cod]);
 let sim=PROPS.filter(x=>x.cod!==p.cod && (x.dist===p.dist||x.tipo===p.tipo)).slice(0,3);
 if(sim.length<3) sim=sim.concat(PROPS.filter(x=>x.cod!==p.cod && sim.indexOf(x)<0).slice(0,3-sim.length));
 const mapQ=encodeURIComponent((p.dir?p.dir+', ':'')+p.dist+', Lima, Perú');
 const shareU=encodeURIComponent(location.href);
 const zoomIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path><path d="M11 8v6M8 11h6"></path></svg>';
 return nav(false)+`
 <div class="wrap pd2-top">
   <a class="pd2-back" onclick="go('#/propiedades')">← Volver al catálogo</a>
   <div class="pd2-gallery">
     <div class="pd2-main" onclick="pdLbOpen()"><img id="pd-main-img" src="${imgs[0]}" alt="${p.tit}"><span class="pd2-zoom">${zoomIco}</span>${hasFotos?'':'<span class="prev-tag">Fotos próximamente</span>'}</div>
     ${imgs.length>1?`<div class="pd2-thumbsrow"><div class="pd2-thumbs">${imgs.map((u,i)=>`<img src="${u}" class="${i===0?'on':''}" onclick="event.stopPropagation();pdMain('${u}',this)">`).join('')}</div><span class="pd2-galhint">Haz clic en la imagen para ampliar</span></div>`:''}
   </div>
   <div class="pd2-head">
     <div><span class="tag t-${p.oper}">${OPER_LBL[p.oper]}</span> <span class="tag t-dist" style="background:#2a2a2a;color:#efe9dd">${p.cod}</span>
       <h1 class="serif">${p.tit}</h1>
       <p class="pd2-addr">${ic('pin')} ${p.dir}, ${p.dist}</p></div>
     <div class="pd2-price">${price}</div>
   </div>
   <div class="pd2-specrow">${spec.map(s=>`<div class="pd2-spec"><span class="ic">${I[s[0]]}</span><b>${s[1]}</b><small>${s[2]}</small></div>`).join('')}</div>
 </div>
 <div class="wrap pd2-body">
   ${yt?`<div class="pd2-video"><iframe src="https://www.youtube.com/embed/${yt}" title="Video" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>`:''}
   <div class="pd2-general"><h3 class="serif">General</h3>
     <div class="pd2-genrow">${gen.map(g=>`<div><small>${g[0]}</small><b>${g[1]}</b></div>`).join('')}</div>
   </div>
   <div class="pd2-cols">
     <div class="pd2-desc">
       <h3 class="serif">Descripción</h3>
       <div class="desc-body">${renderDesc(p.desc) || ('<p>'+(TIPO_LBL[p.tipo]||p.tipo)+' en '+p.dist+'. Escríbenos para recibir la ficha completa y coordinar una visita.</p>')}</div>
       ${p.feats&&p.feats.length?`<h3 class="serif" style="margin-top:30px">Características</h3><div class="pd2-feats">${p.feats.map(f=>`<div>${ic('check')} ${f}</div>`).join('')}</div>`:''}
     </div>
     <aside class="pd2-side">
       <div class="pd2-map"><iframe src="https://maps.google.com/maps?q=${mapQ}&z=14&output=embed" loading="lazy" title="Mapa"></iframe><div class="pd2-maploc">${ic('pin')} ${p.dist}</div></div>
       <div class="pd2-contact">
         <h3 class="serif">¿Te interesa esta propiedad?</h3>
         <p>Déjanos tus datos y Karen te contactará contigo.</p>
         <div class="pd2-f2"><input id="pc-n" placeholder="Nombre"><input id="pc-a" placeholder="Apellido"></div>
         <input id="pc-e" type="email" placeholder="Correo electrónico">
         <input id="pc-p" placeholder="WhatsApp / celular" onkeydown="if(event.key==='Enter')pdLead('${p.cod}')">
         <button class="btn btn-gold" style="width:100%;justify-content:center;margin-top:12px" onclick="pdLead('${p.cod}')">Enviar</button>
         <a class="btn btn-teal" style="width:100%;justify-content:center;margin-top:8px" href="${WA}?text=Hola,%20me%20interesa%20${p.cod}%20-%20${encodeURIComponent(p.tit)}">${I.wa} Consultar por WhatsApp</a>
         <div class="pd2-actions"><button class="btn btn-outline" onclick="agendar('${p.cod}')">Agendar visita</button><button class="btn btn-ghost" onclick="toggleFav('${p.cod}')">${state.favs.has(p.cod)?'♥ Guardada':'♡ Guardar'}</button></div>
       </div>
       <div class="pd2-share"><span>Compartir:</span>
         <a href="https://wa.me/?text=${encodeURIComponent(p.tit)}%20${shareU}" target="_blank" rel="noopener" title="WhatsApp">${I.wa}</a>
         <a href="https://www.facebook.com/sharer/sharer.php?u=${shareU}" target="_blank" rel="noopener" title="Facebook">${I.fb}</a>
         <a href="mailto:?subject=${encodeURIComponent(p.tit)}&body=${shareU}" title="Correo">${I.mail}</a>
         <button onclick="pdCopy()" title="Copiar enlace">${I.doc}</button>
       </div>
     </aside>
   </div>
   <section class="pd2-sim"><div class="result-bar"><h2 class="serif" style="font-size:30px">Propiedades similares</h2><button class="btn btn-outline" onclick="go('#/propiedades')">Ver todo →</button></div>
     <div class="pgrid">${sim.map(x=>propCard(x)).join('')}</div>
   </section>
 </div>
 <div class="pd2-lb" id="pd-lb" onclick="if(event.target.id==='pd-lb')pdLbClose()">
   <span class="pd2-lb-close" onclick="pdLbClose()">&times;</span>
   ${imgs.length>1?`<span class="pd2-lb-nav pd2-lb-prev" onclick="pdLbNav(-1)">&#8249;</span><span class="pd2-lb-nav pd2-lb-next" onclick="pdLbNav(1)">&#8250;</span>`:''}
   <img id="pd-lb-img" src="" alt="${p.tit}">
   <span class="pd2-lb-count" id="pd-lb-count"></span>
 </div>`+footer();
}

/* ===================================================================
   Editor de propiedad (admin): subir fotos + ordenar
   =================================================================== */
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
   <textarea id="ap-desc" rows="4" placeholder="Descripción curada para el sitio…">${(p.descOverride||'')}</textarea>
   <div class="lbl">Fotos de la propiedad</div>
   <label class="btn btn-teal" style="justify-content:center;cursor:pointer;width:100%">📷 Subir fotos desde mi computadora
     <input type="file" id="ap-file" accept="image/*" multiple onchange="uploadFotos()" style="display:none"></label>
   <div id="ap-upmsg" style="font-size:12px;color:var(--teal);margin-top:8px;min-height:16px"></div>
   <div style="font-size:12px;color:var(--muted);margin-top:4px">Arrastra las fotos para ordenarlas, o usa ◀ ▶. La <b>#1</b> es la portada.</div>
   <div id="ap-gal" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px"></div>
   <div class="lbl" style="margin-top:12px">O pega URLs de fotos (una por línea)</div>
   <textarea id="ap-fotos" rows="3" placeholder="https://…/foto1.jpg" oninput="renderApGallery()">${fotos}</textarea>
   <div class="lbl">Video de YouTube (canal de Karen Quezada)</div>
   <input id="ap-video" placeholder="https://youtu.be/… o https://youtube.com/watch?v=…" value="${(p.video||'').replace(/"/g,'&quot;')}">
   <div style="display:flex;gap:10px;margin-top:22px"><button class="btn btn-gold" style="flex:1;justify-content:center" onclick="saveAdmProp('${p.cod}')">Guardar</button><button class="btn btn-ghost" onclick="closeAdm()">Cancelar</button></div>`;
 renderApGallery();
 admOpen();
}

function apUrls(){ const ta=document.getElementById('ap-fotos'); return ta? ta.value.split('\n').map(s=>s.trim()).filter(Boolean):[]; }
function apSetUrls(urls){ const ta=document.getElementById('ap-fotos'); if(ta) ta.value=urls.join('\n'); renderApGallery(); }
let apDragIdx=null;
function renderApGallery(){
 const gal=document.getElementById('ap-gal'); if(!gal) return;
 const urls=apUrls();
 if(!urls.length){ gal.innerHTML='<div style="font-size:12px;color:var(--muted)">Aún no hay fotos. Sube o pega URLs; la primera será la portada.</div>'; return; }
 gal.innerHTML=urls.map((u,i)=>`
   <div class="ap-thumb" draggable="true" data-i="${i}" ondragstart="apDrag(${i})" ondragover="event.preventDefault()" ondrop="apDrop(${i})" style="position:relative;width:96px">
     <img src="${u}" style="width:96px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--line);cursor:grab" draggable="false">
     <span style="position:absolute;top:-7px;left:-7px;background:linear-gradient(135deg,#e2c766,#C9A227);color:#1a1400;font-size:11px;font-weight:700;width:21px;height:21px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,.3)">${i+1}</span>
     <button onclick="apMove(${i},-1)" title="Mover antes" ${i===0?'disabled':''} style="position:absolute;bottom:3px;left:3px;width:21px;height:21px;border:none;border-radius:5px;background:rgba(20,20,20,.74);color:#fff;cursor:pointer;font-size:11px;${i===0?'opacity:.35':''}">◀</button>
     <button onclick="apMove(${i},1)" title="Mover después" ${i===urls.length-1?'disabled':''} style="position:absolute;bottom:3px;left:26px;width:21px;height:21px;border:none;border-radius:5px;background:rgba(20,20,20,.74);color:#fff;cursor:pointer;font-size:11px;${i===urls.length-1?'opacity:.35':''}">▶</button>
     <button onclick="removeApFoto(${i})" title="Quitar" style="position:absolute;top:-7px;right:-7px;width:21px;height:21px;border-radius:50%;border:none;background:#c0392b;color:#fff;cursor:pointer;font-size:12px;line-height:1">✕</button>
   </div>`).join('');
}
function apDrag(i){ apDragIdx=i; }
function apDrop(i){ if(apDragIdx===null||apDragIdx===i){ apDragIdx=null; return; } const urls=apUrls(); const [m]=urls.splice(apDragIdx,1); urls.splice(i,0,m); apDragIdx=null; apSetUrls(urls); }
function apMove(i,dir){ const urls=apUrls(); const j=i+dir; if(j<0||j>=urls.length) return; const t=urls[i]; urls[i]=urls[j]; urls[j]=t; apSetUrls(urls); }
function removeApFoto(i){ const urls=apUrls(); urls.splice(i,1); apSetUrls(urls); }
async function uploadFotos(){
 const inp=document.getElementById('ap-file'); if(!inp||!inp.files.length) return;
 const msg=document.getElementById('ap-upmsg'); if(msg){ msg.style.color='var(--teal)'; msg.textContent='Subiendo '+inp.files.length+' foto(s)…'; }
 const fd=new FormData(); for(const f of inp.files) fd.append('files', f);
 try{
   const r=await fetch('/api/admin/upload',{method:'POST',credentials:'same-origin',body:fd});
   const d=await r.json(); if(!r.ok) throw new Error(d.error||'Error al subir');
   const ta=document.getElementById('ap-fotos'); const cur=ta.value.trim();
   ta.value=(cur?cur+'\n':'')+(d.urls||[]).join('\n');
   if(msg) msg.textContent='✔ '+(d.urls||[]).length+' foto(s) subida(s). Ordénalas y pulsa Guardar.';
   inp.value=''; renderApGallery();
 }catch(e){ if(msg){ msg.style.color='#c0392b'; msg.textContent='Error: '+e.message; } }
}

/* ---------- Footer: enlace de feedback discreto, sin texto de "prototipo" ---------- */
function footer(){
 return `<footer><div class="wrap"><div class="foot-grid">
  <div><div class="brand" style="margin-bottom:14px"><img src="${LOGO}" style="height:44px"><div><div style="font-family:'Corm';font-size:20px;color:#efe9dd;font-weight:600">KQ Real Estate</div><div class="brand-sub">LIMA &amp; BEACH PROPERTIES</div></div></div>
   <p style="font-size:14px;max-width:32ch">Asesoría inmobiliaria premium en Lima y balnearios del sur. Venta, compra e inversión con acompañamiento profesional de principio a fin.</p>
   <div class="socials" style="margin-top:18px"><a href="${SITE.social.ig}" target="_blank" rel="noopener">${I.ig}</a><a href="${SITE.social.fb}" target="_blank" rel="noopener">${I.fb}</a><a href="${SITE.social.tiktok}" target="_blank" rel="noopener">${I.tiktok}</a><a href="${WA}" target="_blank" rel="noopener">${I.wa}</a></div></div>
  <div><h4>Explorar</h4><a onclick="go('#/propiedades')">Catálogo de propiedades</a><a onclick="go('#/servicios')">Servicios</a><a onclick="go('#/nosotros')">Nosotros</a><a onclick="go('#/registro')">Crear cuenta</a></div>
  <div><h4>Zonas</h4>${DISTRICTS.slice(0,6).map(d=>`<a onclick="filterDist('${d}')">${d}</a>`).join("")}</div>
  <div><h4>Contacto</h4><a href="${WA}">WhatsApp ${SITE.contacto.whatsapp}</a><a href="mailto:${SITE.contacto.email}">${SITE.contacto.email}</a><a>Karen Quezada · Agente Inmobiliario</a><a style="color:#8f8a7e">REG. 28319-PN-MVCS</a></div>
 </div><div class="foot-bottom"><span>© 2026 KQ Real Estate — Lima &amp; Beach Properties. Todos los derechos reservados.</span><a onclick="openFeedback()" style="cursor:pointer;color:#b3ada0">¿Sugerencias? Danos tu opinión</a></div></div></footer>`;
}

/* ---------- Feedback: solo modal (sin botón flotante ni pop-up automático) ---------- */
function buildFeedbackUI(){
 if(document.getElementById('fbRoot')) return;
 const d=document.createElement('div'); d.id='fbRoot';
 d.innerHTML=`
  <div class="modal-back" id="fbModal">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="mh"><button class="mx" onclick="closeFeedback()">✕</button>
        <h3>Tu opinión</h3><p>KQ Real Estate — Lima &amp; Beach Properties</p></div>
      <div class="mb" id="fbBody">
        <div class="lbl">¿Cómo calificarías el sitio?</div>
        <div class="stars" id="fbStars">${[1,2,3,4,5].map(n=>`<span data-n="${n}" onclick="setStars(${n})">${I.star}</span>`).join("")}</div>
        <div class="lbl">¿Qué te gustó?</div><textarea id="fbLike" rows="2" placeholder="Lo que más te gustó…"></textarea>
        <div class="lbl">¿Qué mejorarías o agregarías?</div><textarea id="fbImprove" rows="3" placeholder="Sugerencias…"></textarea>
        <div class="lbl">Tu nombre (opcional)</div><input id="fbName" placeholder="Nombre">
        <button class="btn btn-gold" style="width:100%;justify-content:center;margin-top:20px" onclick="submitFeedback()">Enviar</button>
      </div>
    </div>
  </div>`;
 document.body.appendChild(d);
 document.getElementById('fbModal').addEventListener('click', closeFeedback);
}

/* ---------- Home: destacadas completas (rellena hasta 6) ---------- */
function vHome(){
 const dest=[...PROPS.filter(p=>p.dest), ...PROPS.filter(p=>!p.dest)].slice(0,6);
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

/* ---------- Ficha: galería, formulario y compartir ---------- */
function pdMain(src, el){
 var m=document.getElementById('pd-main-img'); if(m) m.src=src;
 document.querySelectorAll('.pd2-thumbs img').forEach(function(t){ t.classList.remove('on'); });
 if(el) el.classList.add('on');
}
async function pdLead(cod){
 var g=function(id){ var e=document.getElementById(id); return e?(e.value||'').trim():''; };
 var email=g('pc-e'), wa=g('pc-p');
 if(!email && !wa){ toast('Déjanos tu correo o WhatsApp para contactarte.'); return; }
 try{
   await api('/api/leads',{method:'POST',body:JSON.stringify({nombre:g('pc-n'),apellido:g('pc-a'),email:email,whatsapp:wa,mensaje:'Interesado en la propiedad '+cod,origen:'contacto',cod:cod})});
   toast('¡Gracias! Karen te contactará muy pronto.');
   ['pc-n','pc-a','pc-e','pc-p'].forEach(function(id){ var e=document.getElementById(id); if(e) e.value=''; });
 }catch(e){ toast('No se pudo enviar. Escríbenos por WhatsApp.'); }
}
function pdCopy(){ try{ navigator.clipboard.writeText(location.href); toast('Enlace copiado'); }catch(e){ toast(location.href); } }

/* ---------- Lightbox de la galería (ampliar foto) ---------- */
var __PDI={list:[],i:0};
function pdLbCollect(){ var t=document.querySelectorAll('.pd2-thumbs img'); var m=document.getElementById('pd-main-img'); __PDI.list = t.length ? Array.prototype.map.call(t,function(x){return x.src;}) : (m?[m.src]:[]); }
function pdLbShow(){ var im=document.getElementById('pd-lb-img'); if(im&&__PDI.list[__PDI.i]) im.src=__PDI.list[__PDI.i]; var c=document.getElementById('pd-lb-count'); if(c) c.textContent=(__PDI.i+1)+' / '+__PDI.list.length; }
function pdLbOpen(){ var lb=document.getElementById('pd-lb'); if(!lb) return; pdLbCollect(); if(!__PDI.list.length) return; var cur=document.getElementById('pd-main-img'); var idx=cur?__PDI.list.indexOf(cur.src):0; __PDI.i=idx<0?0:idx; pdLbShow(); lb.classList.add('on'); document.body.style.overflow='hidden'; }
function pdLbClose(){ var lb=document.getElementById('pd-lb'); if(lb) lb.classList.remove('on'); document.body.style.overflow=''; }
function pdLbNav(d){ if(!__PDI.list.length) return; __PDI.i=(__PDI.i+d+__PDI.list.length)%__PDI.list.length; pdLbShow(); var th=document.querySelectorAll('.pd2-thumbs img')[__PDI.i]; pdMain(__PDI.list[__PDI.i], th); }
if(!window.__pdKeys){ window.__pdKeys=1; document.addEventListener('keydown',function(e){ var lb=document.getElementById('pd-lb'); if(!lb||!lb.classList.contains('on')) return; if(e.key==='Escape') pdLbClose(); else if(e.key==='ArrowLeft') pdLbNav(-1); else if(e.key==='ArrowRight') pdLbNav(1); }); }

/* ---------- Aplicar el parche en la carga: quitar feedback viejo y re-render ---------- */
(function applyPatch(){
 try{ const old=document.getElementById('fbRoot'); if(old) old.remove(); }catch(e){}
 try{ if(typeof render==='function') render(); }catch(e){}
})();
