"use strict";
/* Progetto Sicurezza AF - modulo CILINDRI: dai le misure, ti mostra quelli in assortimento. */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SERVER = location.protocol.startsWith("http") && location.hostname === "127.0.0.1";
async function apiPost(url, obj){ const r = await fetch(url, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(obj)}); return r.json(); }
if(SERVER) setInterval(() => fetch("/api/ping").catch(() => {}), 20000);
function toast(t){ const d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }

const CATS = [
  {id:"doppio", nome:"Chiave da tutti e due i lati", sub:"Cilindro europeo normale", mis:2, f:c => c.prof==="europeo" && c.tipo==="doppio"},
  {id:"friz",   nome:"Frizionato", sub:"Europeo: apre anche con la chiave inserita dall'altro lato", mis:2, f:c => c.prof==="europeo" && c.tipo==="friz"},
  {id:"pred",   nome:"Chiave fuori, pomolo dentro", sub:"Europeo con codolo o pomolo sul lato interno", mis:2, f:c => c.prof==="europeo" && (c.tipo==="pred" || c.tipo==="pomolo")},
  {id:"mezzo",  nome:"Mezzo cilindro", sub:"Europeo con chiave da un lato solo", mis:1, f:c => c.prof==="europeo" && c.tipo==="mezzo"},
  {id:"ovale",  nome:"Ovale", sub:"Per serramenti in ferro e alluminio", mis:2, f:c => c.prof==="ovale"},
  {id:"tondo",  nome:"Tondo / da applicare", sub:"Serrature da applicare, cancelli, porte in legno", mis:0, f:c => c.prof==="tondo"},
  {id:"altro",  nome:"A pompa e altri", sub:"A pompa, ridotti, a mappa, per comandi esterni", mis:0, f:c => c.prof==="pompa" || c.prof==="altro"},
];
const S = {step:0, prof:null, tipo:null, a:null, b:null, tutti:false, q:"", scelti:[]};
const PROF = [
  {id:"europeo", nome:"Europeo (sagomato)", sub:"Il più comune: porte blindate, in legno, alluminio e ferro. Forma a goccia.", mi:"doppio"},
  {id:"ovale",   nome:"Ovale", sub:"Per serrature di serramenti in ferro e alluminio. Forma ovale.", mi:"ovale"},
  {id:"tondo",   nome:"Tondo / da applicare", sub:"Per serrature da applicare, cancelli e porte in legno.", mi:"tondo"},
  {id:"altro",   nome:"A pompa e altri", sub:"A pompa, ridotti, a mappa, a spillo, per comandi esterni.", mi:"altro"},
];
const FUNZ = [
  {id:"doppio", nome:"Chiave da tutti e due i lati", sub:"Il cilindro normale.", mi:"doppio"},
  {id:"friz",   nome:"Frizionato", sub:"Apre anche se dall'altro lato è rimasta la chiave inserita.", mi:"friz"},
  {id:"pred",   nome:"Chiave fuori, pomolo dentro", sub:"Da dentro si apre con il pomolo, senza chiave.", mi:"pred"},
  {id:"mezzo",  nome:"Mezzo cilindro", sub:"Chiave da un lato solo (es. basculanti, quadri, cancelli).", mi:"mezzo"},
];
const CARDS = [
  {id:"e-doppio", prof:"europeo", tipo:"doppio", nome:"Europeo · chiave da tutti e due i lati", sub:"Il cilindro normale delle porte.", mi:"doppio"},
  {id:"e-friz",   prof:"europeo", tipo:"friz",   nome:"Europeo · frizionato", sub:"Apre anche se dall'altro lato è rimasta la chiave inserita.", mi:"friz"},
  {id:"e-pred",   prof:"europeo", tipo:"pred",   nome:"Europeo · chiave fuori, pomolo dentro", sub:"Da dentro si apre con il pomolo, senza chiave.", mi:"pred"},
  {id:"e-mezzo",  prof:"europeo", tipo:"mezzo",  nome:"Mezzo cilindro europeo", sub:"Chiave da un lato solo (basculanti, quadri, cancelli).", mi:"mezzo"},
  {id:"ovale",    prof:"ovale",   tipo:null,     nome:"Ovale", sub:"Per serramenti in ferro e alluminio.", mi:"ovale"},
  {id:"tondo",    prof:"tondo",   tipo:null,     nome:"Tondo / da applicare", sub:"Serrature da applicare, cancelli, porte in legno.", mi:"tondo"},
  {id:"altro",    prof:"altro",   tipo:null,     nome:"A pompa e altri", sub:"A pompa, ridotti, a mappa, a spillo, per comandi esterni.", mi:"altro"},
];
const card = () => CARDS.find(k => k.prof === S.prof && k.tipo === S.tipo);
const profDi = c => c.prof === "pompa" ? "altro" : c.prof;
const funzDi = c => c.tipo === "pomolo" ? "pred" : (c.tipo === "pompa" ? "doppio" : c.tipo);
function delProfilo(){ return CILINDRI.filter(c => visibile(c) && profDi(c) === S.prof); }
const semplice = () => S.prof === "tondo" || S.prof === "altro";
function funzioni(){ if(semplice()) return []; const l = delProfilo(); return FUNZ.filter(f => l.some(c => funzDi(c) === f.id)); }
function base(){ return delProfilo().filter(c => !S.tipo || funzDi(c) === S.tipo); }
function passi(){
  const st = [{id:"prof", nome:"Tipo di cilindro", col:"#0a7aff"}];
  if(!S.prof || !semplice()) st.push({id:"mis", nome:"Misura", col:"#ff9500"});
  st.push({id:"ris", nome:"Cosa abbiamo", col:"#34c759"});
  return st;
}
const attivo = c => !c.stato;
const visibile = c => S.tutti || attivo(c);
const simm = t => t === "doppio" || t === "friz";
function confronta(c){
  const mezzo = c.tipo === "mezzo";
  if(!c.a) return {k:"nomis"};
  if(semplice()) return {k:"tutti"};
  if(!S.a && !(S.b && !mezzo)) return {k:"tutti"};
  const prova = (x, y) => { const da = S.a ? x - S.a : 0, db = (mezzo || !S.b) ? 0 : y - S.b; if(da < 0 || db < 0 || da > 5 || db > 5) return null; return {da, db, tot: da + db}; };
  let r = prova(c.a, c.b), girato = false;
  if(!mezzo && c.a !== c.b){ const r2 = prova(c.b, c.a); if(r2 && (!r || r2.tot < r.tot)){ r = r2; girato = true; } }
  if(!r) return null;
  return {k: r.tot === 0 ? "esatto" : "lungo", girato, ...r};
}
const liv = c => (SERIE[c.serie] || {}).liv || 0;
const ordina = (x, y) => (attivo(y) - attivo(x)) || liv(x) - liv(y) || x.serie.localeCompare(y.serie) || (x.a||0) - (y.a||0) || (x.b||0) - (y.b||0);

function riga(c, m, mostraDesc){
  const mezzo = c.tipo === "mezzo";
  const sz = c.a ? (mezzo ? c.a+'<small>mezzo</small>' : (m && m.girato ? c.b+" / "+c.a : c.a+" / "+c.b)+'<small>mm</small>') : '—';
  const dentro = S.scelti.includes(c.int);
  let p = '<span class="pill b">'+esc(c.serie)+'</span>';
  if(c.fin) p += '<span class="pill">'+esc(c.fin)+'</span>';
  if(m && m.k === "lungo") p += '<span class="pill o">più lungo: '+(m.da?'+'+m.da+' fuori ':'')+(m.db?'+'+m.db+' dentro':'')+'</span>';
  if(m && m.girato && !simm(c.tipo)) p += '<span class="pill r">misure invertite: controlla il lato del pomolo</span>';
  if(c.stato) p += '<span class="pill r">in esaurimento</span>';
  return '<div class="cil'+(dentro?" in":"")+'" data-open="'+esc(c.int)+'"><div class="sz">'+sz+'</div>'
    + '<div class="t"><div class="hd"><b>'+esc(c.int)+'</b>'+livChip(SERIE[c.serie])+'</div>'
    + '<span class="df">'+esc(diffTxt(c))+'</span>'
    + (mostraDesc ? '<span class="dsc">'+esc(c.desc)+'</span>' : '')
    + '<div class="pills">'+p+'</div></div>'
    + '<button class="addb'+(dentro?" on":"")+'" data-add="'+esc(c.int)+'" title="'+(dentro?"Togli dalla lista":"Aggiungi alla lista")+'">'+(dentro?"✓":"+")+'</button></div>';
}
/* confronto rapido: cosa cambia tra i cilindri trovati */
function confronto(lista){
  const vis = [...new Set(lista.map(x => x[0].serie))].filter(k => SERIE[k] && SERIE[k].diff);
  if(vis.length < 2) return "";
  vis.sort((x, y) => SERIE[x].liv - SERIE[y].liv);
  let h = '<div class="cfr"><h3>Cosa cambia tra questi</h3>';
  for(const k of vis){ const Z = SERIE[k];
    h += '<div class="cfr-r">'+livChip(Z)+'<div><b>'+esc(k)+'</b> · '+esc(Z.diff)+'<span>'+esc(Z.diff2 || "")+'</span></div></div>'; }
  return h + '<p class="cfr-f">Tocca un cilindro per la scheda da leggere al cliente.</p></div>';
}
function mini(id){
  const g = 'fill="#cfd2d9" stroke="#7d818b" stroke-width="1.5"';
  if(id === "tondo" || id === "altro") return '<svg viewBox="0 0 64 64" width="56"><circle cx="32" cy="32" r="22" '+g+'/><rect x="29" y="20" width="6" height="24" rx="2" fill="#55585f"/></svg>';
  if(id === "ovale") return '<svg viewBox="0 0 64 64" width="56"><rect x="20" y="8" width="24" height="48" rx="12" '+g+'/><rect x="29" y="16" width="6" height="16" rx="2" fill="#55585f"/></svg>';
  const key = x => '<circle cx="'+x+'" cy="24" r="6" fill="#e9eaee" stroke="#7d818b"/>';
  let s = '<svg viewBox="0 0 64 64" width="60">';
  if(id === "mezzo") s += '<rect x="20" y="16" width="26" height="34" rx="4" '+g+'/><rect x="40" y="16" width="6" height="34" fill="#6f737c"/>'+key(11)+'<rect x="14" y="22" width="8" height="4" fill="#9da1ab"/>';
  else { s += '<rect x="14" y="16" width="36" height="34" rx="4" '+g+'/><rect x="29" y="16" width="6" height="34" fill="#6f737c"/>'+key(6)+'<rect x="9" y="22" width="6" height="4" fill="#9da1ab"/>';
    if(id === "pred") s += '<rect x="50" y="22" width="5" height="4" fill="#9da1ab"/><rect x="55" y="15" width="7" height="18" rx="3" fill="#e9eaee" stroke="#7d818b"/>'; else s += '<rect x="49" y="22" width="6" height="4" fill="#9da1ab"/>'+key(58);
    if(id === "friz") s += '<text x="32" y="62" text-anchor="middle" font-size="9" font-weight="700" fill="#0a7aff">2 chiavi</text>'; }
  return s + '</svg>';
}
function pagina(){
  if(S.q) return cerca();
  const st = passi()[S.step];
  if(st.id === "prof"){
    let h = '<h1>Che tipo di cilindro ti serve?</h1><div class="sub">Scegli il tipo: poi ti chiedo la misura.</div><div class="opts">';
    for(const k of CARDS){ const n = CILINDRI.filter(c => visibile(c) && profDi(c) === k.prof && (!k.tipo || funzDi(c) === k.tipo)).length; const on = S.prof === k.prof && S.tipo === k.tipo;
      h += '<button class="opt'+(on?" sel":"")+'" data-card="'+k.id+'"><div class="mini" style="height:64px">'+mini(k.mi)+'</div><div class="txt"><b>'+esc(k.nome)+'</b><p>'+esc(k.sub)+'</p></div><span class="pill">'+n+' articoli</span><div class="radio"></div></button>'; }
    return h + '</div>';
  }
  const mezzo = S.tipo === "mezzo", lista0 = base();
  if(st.id === "mis"){
    const cnt = {}; lista0.forEach(c => (mezzo ? [c.a] : [c.a, c.b]).forEach(v => { if(v) cnt[v] = (cnt[v]||0) + 1; }));
    const va = Object.keys(cnt).map(Number).sort((x, y) => x - y);
    const box = (key, lab, col) => '<div class="mbox"><label><i style="background:'+col+'"></i>'+lab+'</label><div class="row"><input type="number" inputmode="numeric" min="10" max="120" id="in'+key+'" value="'+(S[key]||"")+'" placeholder="—"><span>mm</span></div><div class="quick">'+va.map(v => '<button class="'+(S[key]===v?"a":"")+'" data-q="'+key+':'+v+'">'+v+'</button>').join("")+'</div></div>';
    return '<h1>Che misura ti serve?</h1><div class="sub">Misura dal centro della vite al bordo del cilindro, un lato alla volta. Scrivi i millimetri o tocca la misura.</div>'
      + '<div class="mis"'+(mezzo?' style="grid-template-columns:1fr"':'')+'>'+box("a", mezzo ? "Lato chiave" : "Lato esterno (fuori)", "#ff3b30")+(mezzo ? "" : box("b", "Lato interno (dentro)", "#0a7aff"))+'</div>'
      + '<div class="info2">Se non sai la misura vai avanti lo stesso: ti mostro tutte le misure che abbiamo.</div>';
  }
  // risultato: prima quello che c'è a magazzino
  const K = card(), conMis = !semplice() && lista0.some(c => c.a), haMis = conMis && (S.a || (S.b && !mezzo));
  let h = '<h1>Cosa abbiamo</h1><div class="sub">'+esc(K ? K.nome : "")+(haMis ? ' · <b>'+(mezzo ? S.a : (S.a||"?")+" / "+(S.b||"?"))+' mm</b>' : '')+'. Tocca un cilindro per la sua scheda; con <b>+</b> lo metti nella lista.</div>';
  const es = [], lu = [], al = [];
  for(const c of lista0){ const m = confronta(c); if(!m) continue; (m.k === "lungo" ? lu : m.k === "nomis" && haMis ? al : es).push([c, m]); }
  const ord = (x, y) => ordina(x[0], y[0]), perMis = (x, y) => (x[0].a||0)-(y[0].a||0) || (x[0].b||0)-(y[0].b||0) || ord(x, y);
  const blocco = (tit, L, cmp, vuoto) => { if(!L.length && !vuoto) return "";
    let t = '<div class="rh gh">'+tit+' <i>'+L.length+'</i></div>';
    if(!L.length) return t + '<div class="empty2">'+vuoto+'</div>';
    return t + L.sort(cmp).map(x => riga(x[0], x[1])).join(""); };
  h += confronto(es.length ? es : lu);
  if(haMis){
    h += blocco("MISURA ESATTA", es, ord, "Con questa misura esatta non abbiamo niente."+(lu.length ? " Guarda sotto quelli poco più lunghi." : ""));
    h += blocco("POCO PIÙ LUNGHI · fino a 5 mm per lato", lu, (x, y) => x[1].tot - y[1].tot || ord(x, y));
    h += blocco("MISURA DA LEGGERE NELLA DESCRIZIONE", al, ord);
    if(!es.length && !lu.length && !al.length) h += '<div class="info2">Prova a cambiare la misura, o toglila per vedere tutto quello che abbiamo.</div>';
  } else h += blocco(conMis ? "TUTTE LE MISURE" : "TUTTI", es, perMis, "Nessun cilindro.");
  return h + '<label class="tog" style="margin-top:14px"><input type="checkbox" id="tutti"'+(S.tutti?" checked":"")+'> Mostra anche gli articoli in esaurimento</label>';
}
function cerca(){
  const parole = S.q.toUpperCase().replace(/\s+/g, " ").trim().split(" ");
  const r = CILINDRI.filter(c => { const t = (c.int+" "+c.forn+" "+c.desc+" "+c.serie).toUpperCase(); return parole.every(p => t.includes(p)); }).sort(ordina);
  return '<h1>Ricerca</h1><div class="sub">"'+esc(S.q)+'" · '+r.length+' cilindri trovati</div>'+(r.length ? r.slice(0, 200).map(c => riga(c, null, true)).join("") : '<div class="empty2">Nessun cilindro trovato.</div>');
}

/* disegno del cilindro con le quote */
function disegno(){
  const INK = "#1d1d1f", GR = "#8e8e93", RO = "#d70015", BL = "#0058d0";
  const ln = (x1, y1, x2, y2, c, w, d) => '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(c||INK)+'" stroke-width="'+(w||1.3)+'"'+(d?' stroke-dasharray="'+d+'"':'')+'/>';
  const tx = (x, y, t, o) => { o = o || {}; return '<text x="'+x+'" y="'+y+'" text-anchor="'+(o.a||"middle")+'" font-size="'+(o.s||11)+'" font-weight="'+(o.w||400)+'" fill="'+(o.c||INK)+'"'+(o.r?' transform="rotate(-90 '+x+' '+y+')"':'')+'>'+t+'</text>'; };
  const arr = (x, y, dir, c) => { const d = {l:[[8,-3.5],[8,3.5]], r:[[-8,-3.5],[-8,3.5]], u:[[-3.5,8],[3.5,8]], d:[[-3.5,-8],[3.5,-8]]}[dir]; return '<path d="M'+x+' '+y+'L'+(x+d[0][0])+' '+(y+d[0][1])+'L'+(x+d[1][0])+' '+(y+d[1][1])+'Z" fill="'+c+'"/>'; };
  const quotaH = (x1, x2, y, t, c, sub) => ln(x1, y-7, x1, y+7, c, 1) + ln(x2, y-7, x2, y+7, c, 1) + ln(x1, y, x2, y, c, 1.4) + arr(x1, y, "l", c) + arr(x2, y, "r", c) + tx((x1+x2)/2, y+24, t, {s:22, w:800, c}) + (sub ? tx((x1+x2)/2, y+38, sub, {s:10.5, c:GR}) : "");
  const quotaV = (x, y1, y2, t) => ln(x-5, y1, x+5, y1, GR, 1) + ln(x-5, y2, x+5, y2, GR, 1) + ln(x, y1, x, y2, GR, 1) + arr(x, y1, "u", GR) + arr(x, y2, "d", GR) + tx(x+13, (y1+y2)/2+4, t, {s:11, c:"#3a3a3c", r:1});
  const semp = S.prof === "tondo" || S.prof === "altro", ovale = S.prof === "ovale", mezzo = S.tipo === "mezzo";
  let s = '<rect x="14" y="14" width="372" height="492" rx="10" fill="#fff" stroke="#d1d1d6"/>';
  s += tx(28, 36, "DISEGNO TECNICO · quote in mm", {a:"start", s:10, w:700, c:GR});
  if(semp){
    // cilindro tondo da applicare: vista frontale e di lato
    const cx = 130, cy = 230;
    s += '<circle cx="'+cx+'" cy="'+cy+'" r="62" fill="#f4f4f6" stroke="'+INK+'" stroke-width="1.5"/><circle cx="'+cx+'" cy="'+cy+'" r="30" fill="#fff" stroke="'+INK+'" stroke-width="1.3"/><rect x="'+(cx-4)+'" y="'+(cy-20)+'" width="8" height="40" rx="2" fill="'+INK+'"/>';
    s += ln(cx-78, cy, cx+78, cy, GR, .8, "10 3 2 3") + ln(cx, cy-78, cx, cy+78, GR, .8, "10 3 2 3");
    s += '<rect x="250" y="'+(cy-62)+'" width="14" height="124" fill="#f4f4f6" stroke="'+INK+'" stroke-width="1.5"/><rect x="264" y="'+(cy-30)+'" width="62" height="60" fill="#f4f4f6" stroke="'+INK+'" stroke-width="1.5"/><rect x="326" y="'+(cy-5)+'" width="34" height="10" fill="#fff" stroke="'+INK+'" stroke-width="1.3"/>';
    s += ln(240, cy, 368, cy, GR, .8, "10 3 2 3");
    s += tx(cx, 330, "vista frontale", {s:10.5, c:GR}) + tx(300, 330, "vista di lato", {s:10.5, c:GR});
    s += tx(200, 400, "Per questi cilindri la misura", {s:13, c:"#3a3a3c"}) + tx(200, 418, "è scritta nella descrizione.", {s:13, c:"#3a3a3c"});
    return s;
  }
  // ---- vista frontale (profilo) ----
  const kf = 3.0, fx = 200, fy = 62, R = 8.5*kf, Hh = 33*kf, w2 = 5*kf;
  if(ovale){
    s += '<rect x="'+(fx-R)+'" y="'+fy+'" width="'+(2*R)+'" height="'+Hh+'" rx="'+R+'" fill="#f4f4f6" stroke="'+INK+'" stroke-width="1.5"/>';
  } else {
    const yb = fy + Hh, a0 = Math.sqrt(R*R - w2*w2), yj = fy + R + a0;
    s += '<path d="M'+(fx-w2)+' '+yj+' A'+R+' '+R+' 0 1 1 '+(fx+w2)+' '+yj+' L'+(fx+w2)+' '+(yb-w2)+' A'+w2+' '+w2+' 0 0 1 '+(fx-w2)+' '+(yb-w2)+' Z" fill="#f4f4f6" stroke="'+INK+'" stroke-width="1.5"/>';
  }
  s += '<circle cx="'+fx+'" cy="'+(fy+R)+'" r="'+(R-7)+'" fill="#fff" stroke="'+INK+'" stroke-width="1.1"/><rect x="'+(fx-2.5)+'" y="'+(fy+R-13)+'" width="5" height="26" rx="1.5" fill="'+INK+'"/>';
  s += ln(fx, fy-10, fx, fy+Hh+10, GR, .8, "10 3 2 3") + ln(fx-R-12, fy+R, fx+R+12, fy+R, GR, .8, "10 3 2 3");
  s += quotaV(fx+R+26, fy, fy+Hh, "33");
  s += ln(fx-R, fy-14, fx+R, fy-14, GR, 1) + ln(fx-R, fy-19, fx-R, fy-9, GR, 1) + ln(fx+R, fy-19, fx+R, fy-9, GR, 1) + tx(fx+R+8, fy-10, "Ø 17", {a:"start", s:11, c:"#3a3a3c"});
  if(!ovale) s += ln(fx-w2, fy+Hh+14, fx+w2, fy+Hh+14, GR, 1) + ln(fx-w2, fy+Hh+9, fx-w2, fy+Hh+19, GR, 1) + ln(fx+w2, fy+Hh+9, fx+w2, fy+Hh+19, GR, 1) + tx(fx+w2+8, fy+Hh+18, "10", {a:"start", s:11, c:"#3a3a3c"});
  s += tx(fx-R-18, fy+Hh/2+4, "vista frontale", {a:"end", s:10.5, c:GR});
  // ---- vista di lato ----
  const a = S.a || 30, b = mezzo ? 10 : (S.b || 30), k = Math.min(2.6, 300/(a+b)), cx = 200 + (a-b)*k/2, y = 262, H = 33*k, Hc = 17*k;
  const x0 = cx - a*k, x1 = cx + b*k, cw = 5*k;
  s += tx(28, y-30, "vista di lato", {a:"start", s:10.5, c:GR});
  s += '<rect x="'+x0+'" y="'+y+'" width="'+(x1-x0)+'" height="'+H+'" rx="2" fill="#f4f4f6" stroke="'+INK+'" stroke-width="1.5"/>';
  s += ln(x0, y+Hc, cx-cw, y+Hc, INK, 1) + ln(cx+cw, y+Hc, x1, y+Hc, INK, 1);                 // separazione rotore / corpo
  s += '<rect x="'+(cx-cw)+'" y="'+(y-1)+'" width="'+(2*cw)+'" height="'+(Hc+1)+'" fill="#fff" stroke="'+INK+'" stroke-width="1.3"/>';   // vano camma
  s += '<path d="M'+(cx-cw+2)+' '+(y+2)+'h'+(2*cw-4)+'v'+(Hc+14)+'h-'+(2*cw-4)+'z" fill="#c9ccd3" stroke="'+INK+'" stroke-width="1.1"/>';  // camma (nottolino)
  s += '<circle cx="'+cx+'" cy="'+(y+H-6.5*k)+'" r="'+(2.5*k)+'" fill="#fff" stroke="'+INK+'" stroke-width="1.2"/>' + tx(cx, y+H+13, "vite M5", {s:9.5, c:GR});
  // perni (tratteggio) e ingresso chiave
  const perni = (xa, xb) => { let t = "", n = Math.max(3, Math.min(6, Math.floor(Math.abs(xb-xa)/(5.2*k)))); for(let i = 0; i < n; i++){ const px = xa + (xb-xa)*(i+0.7)/(n+0.4); t += ln(px, y+Hc*0.55, px, y+H-4, GR, .9, "3 2"); } return t; };
  s += perni(x0, cx-cw); if(!mezzo) s += perni(x1, cx+cw);
  s += ln(x0, y+Hc/2, cx-cw, y+Hc/2, GR, .8, "10 3 2 3"); if(!mezzo) s += ln(cx+cw, y+Hc/2, x1, y+Hc/2, GR, .8, "10 3 2 3");
  s += ln(x0-16, y+Hc/2, x0, y+Hc/2, INK, 3); if(!mezzo && S.tipo !== "pred") s += ln(x1, y+Hc/2, x1+16, y+Hc/2, INK, 3);
  if(S.tipo === "pred") s += '<rect x="'+x1+'" y="'+(y+Hc/2-4)+'" width="14" height="8" fill="#fff" stroke="'+INK+'" stroke-width="1.2"/><rect x="'+(x1+14)+'" y="'+(y+Hc/2-15)+'" width="18" height="30" rx="7" fill="#f4f4f6" stroke="'+INK+'" stroke-width="1.3"/>';
  s += tx(x0, y-9, "FUORI", {s:10.5, w:700, c:RO, a:"start"}) + (mezzo ? "" : tx(x1, y-9, "DENTRO", {s:10.5, w:700, c:BL, a:"end"}));
  // asse della vite e quote A / B
  const yq = y + H + 44;
  s += ln(cx, y-14, cx, yq+12, GR, .9, "10 3 2 3");
  s += quotaH(x0, cx, yq, S.a ? S.a : "A", RO, mezzo ? "lato chiave" : "esterno");
  if(!mezzo) s += quotaH(cx, x1, yq, S.b ? S.b : "B", BL, "interno");
  else s += tx(cx + b*k/2, yq+16, "10", {s:11, c:GR});
  const yt = yq + 62;
  s += ln(x0, yt-6, x0, yt+6, GR, 1) + ln(x1, yt-6, x1, yt+6, GR, 1) + ln(x0, yt, x1, yt, GR, 1) + arr(x0, yt, "l", GR) + arr(x1, yt, "r", GR);
  s += tx((x0+x1)/2, yt+16, "lunghezza totale " + (S.a && (mezzo || S.b) ? (a+b)+" mm" : (mezzo ? "A + 10" : "A + B")), {s:11, c:"#3a3a3c"});
  s += tx(200, 488, "Le misure si prendono dal centro della vite", {s:10.5, c:GR});
  return s;
}
function act(v){ const [k, x] = [v.slice(0, v.indexOf(":")), v.slice(v.indexOf(":")+1)];
  if(k === "add"){ if(S.scelti.includes(x)) S.scelti = S.scelti.filter(y => y !== x); else S.scelti.push(x); render(); } }
function vai(i){ const P = passi(); i = Math.max(0, Math.min(P.length-1, i)); if(i > 0 && !S.prof){ toast("Scegli prima il tipo di cilindro"); return; } S.step = i; S.q = ""; $("search").value = ""; render(); $("page").scrollTop = 0; }
function render(){
  const P = passi(); if(S.step >= P.length) S.step = P.length - 1;
  const pr = card(), mezzo = S.tipo === "mezzo";
  const val = {prof: pr ? pr.nome.replace("Europeo · ", "").replace("chiave da tutti e due i lati", "chiave/chiave").replace("chiave fuori, pomolo dentro", "con pomolo") : "", mis: S.a || S.b ? (mezzo ? (S.a||"?") : (S.a||"?")+" / "+(S.b||"?"))+" mm" : "", ris:""};
  $("nav").innerHTML = P.map((st, i) => '<button class="nav'+(S.step===i && !S.q?" on":"")+(i > 0 && !S.prof?" todo":"")+'" data-step="'+i+'"><span class="ic" style="background:'+st.col+'">'+(i+1)+'</span>'+st.nome+'<span class="v">'+esc(val[st.id])+'</span></button>').join("")
    + '<div class="sec" style="margin-top:14px">IN ARRIVO</div><div class="nav todo"><span class="ic">S</span>Serrature</div>';
  $("crumb").innerHTML = 'Cilindri › '+(S.q ? '<b>Ricerca</b>' : (pr && S.step > 0 ? esc(pr.nome)+' › ' : '')+'<b>'+P[S.step].nome+'</b>');
  $("brandcard").innerHTML = '<small>Assortimento</small><b>'+CILINDRI.length+'</b><p>cilindri a catalogo<br>CISA · ISEO · Omec</p>';
  const foc = document.activeElement && document.activeElement.id;
  $("page").innerHTML = pagina();
  if(foc === "ina" || foc === "inb"){ const n = $(foc); if(n){ n.focus(); const v = n.value; n.value = ""; n.value = v; } }
  $("draw").innerHTML = disegno();
  $("herocap").textContent = !S.prof ? "Rispondi alle domande: ti dico cosa abbiamo" : (S.prof === "tondo" || S.prof === "altro") ? "Per questi la misura è nella descrizione" : mezzo ? "Mezzo cilindro: conta solo il lato chiave" : (S.a && S.b ? "Cilindro "+S.a+" / "+S.b+" · lungo "+(S.a+S.b)+" mm in tutto" : "Fuori = lato esterno · Dentro = lato interno");
  const ult = S.step === P.length - 1;
  $("back").style.visibility = S.step === 0 || S.q ? "hidden" : "visible"; $("next").style.visibility = S.q ? "hidden" : "visible";
  $("next").textContent = ult ? "Nuova ricerca" : (P[S.step+1].id === "ris" ? "Mostra cosa c'è ›" : "Continua ›");
  $("passo").textContent = S.q ? "" : "Passo "+(S.step+1)+" di "+P.length;
  linee();
}
function linee(){
  const L = S.scelti.map(i => CILINDRI.find(c => c.int === i)).filter(Boolean);
  $("lines").innerHTML = L.length ? L.map(c => '<div class="ln"><div class="q">'+(c.a ? (c.tipo==="mezzo"?c.a:c.a+"/"+c.b) : "·")+'</div><div class="t"><b>'+esc(c.int)+'</b><span>'+esc(c.forn)+' · '+esc(c.serie)+'</span></div><button data-del="'+esc(c.int)+'" style="color:#8e8e93;font-size:16px;padding:0 4px">×</button></div>').join("") : '<div class="empty">Usa il <b>+</b> accanto a un cilindro<br>per metterlo qui.</div>';
  const f = L[L.length-1];
  $("bcbox").hidden = !f; if(f){ $("bctext").textContent = f.int; code128svg($("bcprev"), f.int); }
}
document.addEventListener("click", e => {
  const g = (a) => { const n = e.target.closest("["+a+"]"); return n ? n.getAttribute(a) : null; };
  let v;
  if((v = g("data-card")) !== null){ const k = CARDS.find(x => x.id === v); if(S.prof !== k.prof || S.tipo !== k.tipo){ S.a = S.b = null; } S.prof = k.prof; S.tipo = k.tipo; vai(1); return; }
  if((v = g("data-step")) !== null){ vai(+v); return; }
  if((v = g("data-serie")) !== null){ S.serie = v || null; render(); return; }
  if((v = g("data-q")) !== null){ const [k, n] = v.split(":"); S[k] = S[k] === +n ? null : +n; render(); return; }
  if((v = g("data-del")) !== null){ S.scelti = S.scelti.filter(x => x !== v); render(); return; }
  if((v = g("data-add")) !== null){ e.stopPropagation(); act("add:"+v); return; }
  if((v = g("data-open")) !== null){ apriScheda(v); return; }
});
document.addEventListener("input", e => {
  if(e.target.id === "ina" || e.target.id === "inb"){ const n = +e.target.value; S[e.target.id === "ina" ? "a" : "b"] = n >= 10 && n <= 120 ? n : null; render(); }
  if(e.target.id === "search"){ S.q = e.target.value.trim(); render(); }
  if(e.target.id === "tutti"){ S.tutti = e.target.checked; render(); }
});
document.addEventListener("keydown", e => { if(e.key === "Enter" && (e.target.id === "ina" || e.target.id === "inb")) vai(S.step + 1); });
$("back").onclick = () => vai(S.step - 1);
$("next").onclick = () => { if(S.step === passi().length - 1){ S.prof = S.tipo = null; S.a = S.b = null; S.step = 0; vai(0); } else vai(S.step + 1); };
$("clear").onclick = () => { S.scelti = []; render(); };
$("copy").onclick = async () => {
  if(!S.scelti.length){ toast("Nessun cilindro scelto"); return; }
  const t = S.scelti.join("\n");
  try{ if(window.pywebview && window.pywebview.api && window.pywebview.api.copia) await window.pywebview.api.copia(t); else if(SERVER) await apiPost("/api/copia", {testo:t}); else await navigator.clipboard.writeText(t); toast("Codici copiati: "+S.scelti.length); }
  catch(err){ toast("Copia non riuscita"); }
};
render();
