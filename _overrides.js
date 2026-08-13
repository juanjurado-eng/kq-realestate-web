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
