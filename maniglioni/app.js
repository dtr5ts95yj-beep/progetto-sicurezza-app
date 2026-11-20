"use strict";
const CAT = window.CATALOGO, REG = window.REGOLE;
const $ = id => document.getElementById(id);
const STEP_TIPO = {id:"tipo", nome:"Cosa devi fare", ic:"?", col:"#1d1d1f"};
const STEPS_APP = [
  STEP_TIPO,
  {id:"porta", nome:"Ante", ic:"A", col:"#ff3b30"},
  {id:"chiusura", nome:"Punti di chiusura", ic:"P", col:"#ff9500"},
  {id:"motore", nome:"Apertura a distanza", ic:"M", col:"#34c759"},
  {id:"marca", nome:"Marca", ic:"B", col:"#00c7be"},
  {id:"serie", nome:"Serie", ic:"S", col:"#30b0ff"},
  {id:"barra", nome:"Finitura e barra", ic:"F", col:"#5856d6"},
  {id:"esterno", nome:"Lato esterno", ic:"E", col:"#af52de"},
  {id:"elettrico", nome:"Accessori", ic:"+", col:"#ff2d55"},
  {id:"riepilogo", nome:"Riepilogo e stampa", ic:"R", col:"#8e8e93"}
];
const STEPS_INF = [
  STEP_TIPO,
  {id:"imarca", nome:"Marca", ic:"B", col:"#00c7be"},
  {id:"iserratura", nome:"Serratura", ic:"S", col:"#30b0ff"},
  {id:"riepilogo", nome:"Riepilogo e stampa", ic:"R", col:"#8e8e93"}
];
const STEPS_RIC = [ STEP_TIPO, {id:"ricambi", nome:"Ricambi e adattatori", ic:"R", col:"#8e8e93"} ];
let STEPS = STEPS_APP;
const CHIUSURE = {
  laterale: {nome:"1 punto", descr:"Solo lo scrocco centrale, sul fianco della porta."},
  modulare: {nome:"3 punti laterali", descr:"Scrocco centrale più 2 scrocchi laterali sul fianco, in alto e in basso."},
  ab3: {nome:"3 punti alto/basso", descr:"Scrocco centrale più scrocco in alto nel telaio e in basso a pavimento."},
  altobasso: {nome:"2 punti alto/basso", descr:"Scrocchi in alto e in basso: anta secondaria."}
};
/* La barra va scelta il più lunga possibile (EN 1125: mai sotto il 60% della larghezza utile).
   Lunghezza consigliata = larghezza anta meno MARGINE; si accorcia in cantiere. */
const MARGINE = 100, MAXLARG = 1300;
let S = {};
function reset(){ S = {step:0, maxStep:0, ante:1, chiusura:null, altezza:2200, larg:900, larg2:900, motor:false,
  marca:null, serie:null, fin:null, barcol:null, esterno:"nessuno", elettrico:false, fermo:false, piastra:false,
  maniglione:null, serratura:null, colleg:null, porte:1, rif:"",
  tipo:"applicare", imarca:null, iserr:null, imano:"D", iverso:"spingere", iman:null, alta:false}; STEPS = STEPS_APP; }
/* Niente più misure: la lunghezza di maniglione/barra si sceglie direttamente (S.larg = lunghezza + MARGINE)
   e per l'altezza si chiede solo se la porta supera la soglia della serie (aste lunghe / prolunga). */
function sogliaH(s){ return !s ? 2500 : (s.prolunga ? s.prolunga.oltre : (s.aste ? s.aste[0].max : s.maxH)); }
function serveAltezza(){ const s = serie(); return !!s && ante().some(a => conAste(a.c)); }
function aggiornaAltezza(){ const t = sogliaH(serie()); S.altezza = S.alta ? t + 100 : Math.min(2200, t); }
const INF = () => S.tipo === "infilare";
reset();

/* ---------- utilità ---------- */
const serie = () => REG.serie.find(s => s.id === S.serie);
const marca = () => REG.marche.find(m => m.id === S.marca);
function lookupWith(v, len, fin){
  if(v == null) return null;
  if(typeof v === "string") return v;
  for(const k of [len+"|"+fin, len, fin, "*"]){ if(k != null && v[k]) return v[k]; }
  return null;
}
function art(cod){ return CAT[cod] || null; }
/* immagini dei codici (scelte nella parte nascosta "Gestione codici") */
const IMG = {};
function thumb(cod, cls){ return IMG[cod] ? '<img class="'+(cls||"th")+'" src="'+IMG[cod]+'" alt="">' : ''; }
function giac(cod){ const a = art(cod); return a ? a.giac : 0; }
function stockPill(cod){
  if(!cod) return '<span class="pill r">non disponibile</span>';
  const a = art(cod);
  if(!a) return '<span class="pill r">'+cod+' · da ordinare</span>';
  return '<span class="pill">'+cod+'</span>';
}
function esc(t){ return String(t==null?"":t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function toast(t){ const d=document.createElement("div"); d.className="toast"; d.textContent=t; document.body.appendChild(d); setTimeout(()=>d.remove(), 2600); }

/* ---------- ante, lunghezze, barre ---------- */
function ante(){
  if(S.ante === 2) return [{nome:"Anta principale", c:"modulare", main:true, larg:S.larg}, {nome:"Anta secondaria", c:"altobasso", main:false, larg:S.larg2}];
  return [{nome:"Porta", c:S.chiusura, main:true, larg:S.larg}];
}
const manKey = c => c === "ab3" ? "modulare" : c;
const extraKey = c => c === "ab3" ? "altobasso" : c;
const conAste = c => c && c !== "laterale";
const altoBasso = c => c === "ab3" || c === "altobasso";
function scegliLen(s, larg){
  if(!s || !s.lunghezze.length) return null;
  const need = larg - MARGINE, arr = s.lunghezze.map(l => l.id).sort((a,b) => +a - +b);
  return arr.find(l => +l >= need) || arr[arr.length-1];
}
const BARCOL = {"#e0201b":"rossa", "#b8bcc2":"inox", "#8e939b":"grigia", "#1c1c1e":"nera"};
function barre(s){
  return (s && s.barre || []).map(b => ({cod:b.cod, mm:+((b.label.match(/(\d{3,4})\s*mm/)||[0,0])[1]), col:(b.label.split("·")[1]||"").trim(), colore:b.colore}));
}
function barColori(s){ const m = new Map(); for(const b of barre(s)) if(!m.has(b.col)) m.set(b.col, b.colore); return [...m.entries()]; }
function scegliBarra(s, larg, col){
  const list = barre(s).filter(b => b.col === col).sort((a,b) => a.mm - b.mm);
  if(!list.length) return null;
  const need = larg - MARGINE;
  return list.find(b => b.mm >= need) || list[list.length-1];
}
function lunghezzaAnta(s, a){
  if(!s) return null;
  if(s.barra === "separata"){ const b = S.barcol ? scegliBarra(s, a.larg, S.barcol) : null; return b ? b.mm : null; }
  const l = scegliLen(s, a.larg); return l ? +l : null;
}
function manAnta(s, a, fin){
  const len = scegliLen(s, a.larg);
  if(s.infilare) return S.maniglione || s.maniglioni[0].cod;
  if(S.motor && a.main && s.motorizzato) return lookupWith(s.motorizzato, len, fin);
  return lookupWith(s.man[manKey(a.c)], len, fin);
}
/* CISA Alpha: la prolunga 07A64.51 serve sia con scrocchi alto/basso sia con scrocchi laterali (07A63.51) */
const conProlunga = c => altoBasso(c) || c === "modulare";
function soloCavi(){ const s = serie(); return !!(s && s.collegamento && s.prolunga && S.altezza > s.prolunga.oltre && ante().some(a => conProlunga(a.c))); }
function serveColleg(){ const s = serie(); return !!(s && s.collegamento && ante().some(a => conAste(a.c))); }
function compatibile(s, conVincoli=true){
  if(conVincoli && S.motor && !s.motorizzato) return false;
  if(conVincoli && S.elettrico && !s.elettrico) return false;
  if(S.ante === 2 && (s.solo1anta || !s.man.altobasso || !s.man.modulare)) return false;
  if(S.ante === 1 && S.chiusura && !s.man[manKey(S.chiusura)]) return false;
  if(s.infilare && S.chiusura !== "laterale") return false;
  return true;
}
function disponibile(fin){
  const s = serie(); if(!s || s.infilare) return true;
  return ante().every(a => !!manAnta(s, a, fin));
}

/* ---------- elenco codici ---------- */
function unPunto(){ return S.ante === 1 && S.chiusura === "laterale"; }
function incontroAmmesso(){ return S.ante === 1 && S.chiusura === "laterale" && !S.motor; }
function elettricoOk(){ const s = serie(); return !!(s && s.elettrico && incontroAmmesso()); }
function serrInfilare(){ const I = REG.infilare[S.imarca]; return I ? I.serrature.find(x => x.id === S.iserr) : null; }
function codSerratura(sr){ return sr.varianti ? sr.varianti[(S.iverso === "tirare" ? "C" : "")+S.imano] : sr.cod; }
function righeInfilare(){
  const I = REG.infilare[S.imarca]; if(!I) return [];
  const out = [], A = "Anta";
  const add = (cod, ruolo) => out.push({cod, ruolo, anta:A, q:1});
  const nota = t => out.push({cod:null, ruolo:t, anta:A, q:1, nota:true});
  const sr = serrInfilare();
  if(sr) add(codSerratura(sr), "Serratura da infilare · "+sr.nome);
  if(I.maniglioni){ const mn = I.maniglioni.find(x => x.id === S.iman) || I.maniglioni[0]; add(mn.cod, mn.label); }
  else if(I.maniglione.cod) add(I.maniglione.cod, I.maniglione.label); else nota(I.maniglione.label);
  if(I.barre){ const b = I.barre.find(x => x.mm >= S.larg - MARGINE) || I.barre[I.barre.length-1]; add(b.cod, "Barra ovale "+b.mm+" mm"); }
  if(sr && sr.placca) add(sr.placca.cod, sr.placca.label);
  if(sr) for(const t of sr.esterno) nota(t);
  return out;
}
function righe(){
  if(S.tipo === "ricambi") return [];
  if(INF()) return righeInfilare();
  const s = serie(); if(!s || (S.ante === 1 && !S.chiusura)) return [];
  const out = [];
  const add = (cod, ruolo, anta, q=1) => { if(cod) out.push({cod, ruolo, anta, q}); };
  for(const a of ante()){
    const man = manAnta(s, a, S.fin);
    const len = lunghezzaAnta(s, a);
    if(!man){ out.push({cod:null, ruolo:"Combinazione non disponibile ("+(len?len+" mm ":"")+(S.fin||"")+")", anta:a.nome, q:1, err:true}); continue; }
    add(man, (S.motor && a.main ? "Maniglione motorizzato" : "Maniglione")+(len && s.barra!=="separata" ? " "+len+" mm" : ""), a.nome);
    if(s.infilare && S.serratura) add(S.serratura, "Serratura da infilare", a.nome);
    for(const e of (s.extra[extraKey(a.c)] || [])) add(lookupWith(e, null, S.fin), a.c==="modulare" ? "Scrocchi laterali / collegamento" : "Scrocchi alto/basso / collegamento", a.nome);
    if(s.aste && conAste(a.c)){
      const r = s.aste.find(x => S.altezza <= x.max) || s.aste[s.aste.length-1];
      add(lookupWith(r.cod, null, S.fin), "Aste e coperture fino a "+r.max+" mm", a.nome);
    }
    if(s.collegamento && conAste(a.c) && S.colleg){ const k = s.collegamento[S.colleg]; add(k.cod, "Kit "+k.label.toLowerCase()+" di collegamento", a.nome); }
    if(s.prolunga && conProlunga(a.c) && S.altezza > s.prolunga.oltre) add(s.collegamento && S.colleg ? s.collegamento[S.colleg].prolunga : s.prolunga.cod, "Prolunga asta superiore", a.nome);
    if(s.barra === "separata" && S.barcol){ const b = scegliBarra(s, a.larg, S.barcol); if(b) add(b.cod, "Barra orizzontale "+b.mm+" mm", a.nome); }
    if(a.main && S.esterno !== "nessuno"){
      const e = s.esterni.find(x => x.id === S.esterno);
      if(e && !(e.solo1p && !unPunto())){ add(lookupWith(e.cod, null, S.fin), "Comando esterno", a.nome); for(const x of (e.extra || [])) add(x, "Cilindro tondo per comando solo cilindro", a.nome); }
    }
    if(a.main && S.elettrico && elettricoOk()) for(const c of s.elettrico.cod) add(lookupWith(c, null, S.fin), "Incontro elettrico", a.nome);
    if(S.fermo && s.fermo) add(s.fermo, "Fermo a giorno", a.nome);
    if(a.main && S.piastra && s.piastra) add(s.piastra, "Piastra copri lavorazioni", a.nome);
  }
  return out;
}
function righeUnite(){
  const m = new Map();
  for(const r of righe()){ if(!r.cod) continue; if(!m.has(r.cod)) m.set(r.cod, {...r, q:0, ruoli:new Set()}); const x = m.get(r.cod); x.q += r.q * S.porte; x.ruoli.add(r.ruolo); }
  return [...m.values()];
}
function avvisi(){
  if(S.tipo === "ricambi") return [];
  if(INF()){
    const w = [];
    for(const r of righe()){ if(r.nota) w.push("Da aggiungere: "+r.ruolo+"."); else if(!art(r.cod)) w.push(r.cod+" ("+r.ruolo.toLowerCase()+") non è nel gestionale: da ordinare."); }
    w.push("Solo porta a 1 anta: per 2 ante serve anche la controserratura sull'anta secondaria (da ordinare).");
    return w;
  }
  const s = serie(); const w = [];
  for(const a of ante()){
    const n = S.ante === 2 ? a.nome.toLowerCase()+": " : "";
    const L = lunghezzaAnta(s, a);
    if(L && L < a.larg - MARGINE) w.push(n+"in questa finitura la lunghezza scelta non c'è: uso "+L+" mm.");
  }
  if(!s) return w;
  const cs = ante().map(a => a.c);
  if(cs.some(altoBasso) || (s.prolunga && cs.some(conProlunga))){
    if(s.prolunga){ if(S.alta) w.push("Porta più alta di "+s.prolunga.oltre+" mm: solo cavi + prolunga, al massimo "+s.prolunga.max+" mm."); }
    else if(S.altezza > s.maxH) w.push("Porta più alta di "+s.maxH+" mm: oltre il limite di questa serie.");
  }
  if(!s.prolunga && cs.includes("modulare") && S.alta) w.push("3 punti laterali su porta più alta di "+sogliaH(s)+" mm: verifica sulla scheda che le chiusure laterali arrivino a quell'altezza.");
  if(s.id === "idea_base") w.push("Porta tagliafuoco: Idea Base va bene solo con i componenti per tagliafuoco (incontro in acciaio, non in zama). Verificare la versione con ISEO.");
  if(S.motor && S.ante === 2) w.push("Porta a 2 ante: il Push Electro va sull'anta principale, la secondaria resta meccanica alto/basso. Verifica la scheda ISEO prima dell'ordine.");
  for(const r of righe()){
    if(r.err) w.push(r.ruolo+".");
    else if(!art(r.cod)) w.push(r.cod+" ("+r.ruolo.toLowerCase()+") non è nel gestionale: da ordinare.");
  }
  return w;
}

/* ---------- validazione passi ---------- */
const idx = id => STEPS.findIndex(x => x.id === id);
function idxAvvisi(){ const k = STEPS.findIndex(x => x.id === "serie" || x.id === "iserratura"); return k < 0 ? 99 : k; }
function lunghezzeTxt(){
  if(INF()){ const I = REG.infilare[S.imarca]; if(!I || !I.barre) return ""; const b = I.barre.find(x => x.mm >= S.larg - MARGINE) || I.barre[I.barre.length-1]; return "barra "+b.mm+" mm"; }
  const s = serie(); if(!s) return "";
  const L = ante().map(a => lunghezzaAnta(s, a)).filter(Boolean);
  return (L.length ? (s.barra === "separata" ? "barra " : "maniglione ")+L.join(" + ")+" mm" : "") + (serveAltezza() && S.alta ? (L.length ? " · " : "")+"porta più alta di "+sogliaH(s)+" mm" : "");
}
function stepOk(i){
  const s = serie();
  switch(STEPS[i].id){
    case "chiusura": return S.ante === 2 || !!S.chiusura;
    case "imarca": return !!S.imarca;
    case "iserratura": return !!serrInfilare();
    case "marca": return !!S.marca;
    case "serie": return !!S.serie;
    case "barra":
      if(!s || !S.fin) return false;
      if(s.barra === "separata" && !S.barcol) return false;
      if(serveColleg() && !S.colleg) return false;
      if(s.infilare && (!S.maniglione || !S.serratura)) return false;
      return true;
    default: return true;
  }
}
function go(i){
  if(i < 0 || i >= STEPS.length) return;
  if(i > S.step) for(let k = 0; k < i; k++) if(!stepOk(k)) { toast("Completa prima: "+STEPS[k].nome); return; }
  S.step = i; S.maxStep = Math.max(S.maxStep, i); render();
}

/* ---------- porta (foto) ---------- */
function mix(hex, t){ // t>0 schiarisce, t<0 scurisce
  const n = parseInt(hex.slice(1),16); let r=n>>16, g=(n>>8)&255, b=n&255;
  const f = v => Math.round(t>0 ? v+(255-v)*t : v*(1+t));
  return "#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
function finColore(){ const s = serie(); const f = s && s.finiture.find(x => x.id === S.fin); return f ? f.colore : "#e0201b"; }
function barraInt(id, col){
  const top = mix(col,.35), bot = mix(col,-.45);
  return '<defs><linearGradient id="g'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+top+'"/><stop offset=".45" stop-color="'+col+'"/><stop offset="1" stop-color="'+bot+'"/></linearGradient>'
    + '<linearGradient id="k'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4b4f"/><stop offset=".5" stop-color="#202124"/><stop offset="1" stop-color="#0b0b0d"/></linearGradient></defs>'
    + '<g filter="url(#sh)"><rect x="166" y="556" width="414" height="70" rx="12" fill="url(#k'+id+')"/>'
    + '<rect x="232" y="566" width="300" height="50" rx="8" fill="url(#g'+id+')"/><rect x="236" y="569" width="292" height="8" rx="4" fill="#fff" opacity=".28"/>'
    + '<rect x="540" y="562" width="34" height="58" rx="8" fill="#2a2b2e"/><rect x="172" y="562" width="52" height="58" rx="8" fill="#2a2b2e"/><circle cx="198" cy="591" r="5" fill="#55575c"/></g>';
}
const LAT = (y) => '<rect x="116" y="'+(y-19)+'" width="40" height="38" rx="3" fill="url(#mt)" stroke="#5c6168" filter="url(#sh)"/>';
const TESTA = (y) => '<rect x="171" y="'+(y-22)+'" width="34" height="44" rx="5" fill="#1f2023" filter="url(#sh)"/>';
const ALTO = '<rect x="172" y="34" width="32" height="46" rx="3" fill="url(#mt)" stroke="#5c6168" filter="url(#sh)"/>';
const BASSO = '<rect x="172" y="1062" width="32" height="46" rx="3" fill="url(#mt)" stroke="#5c6168" filter="url(#sh)"/>';
const CER = (x, y, c) => '<circle cx="'+x+'" cy="'+y+'" r="44" fill="none" stroke="'+c+'" stroke-width="6" stroke-dasharray="7 5"/>';
function puntiLeaf(c){ // posizioni scrocchi in coordinate anta
  if(c === "laterale") return [[136,593]];
  if(c === "modulare") return [[136,593],[136,238],[136,930]];
  if(c === "ab3") return [[136,593],[188,70],[188,1074]];
  if(c === "altobasso") return [[188,70],[188,1074]];
  return [];
}
function leafSVG(id, c, main, col){
  const s = serie(), integ = s ? s.barra !== "separata" : false;
  const rods = !c || c === "laterale" ? "nessuna" : c === "modulare" ? "lat3" : "piena";
  let img;
  if(integ) img = "img/int_"+rods+".jpg";
  else { const b = s && S.barcol ? barColori(s).find(x => x[0] === S.barcol) : null; img = "img/sep_"+((b && BARCOL[b[1]]) || "rossa")+"_"+rods+".jpg"; }
  let g = '<image href="'+img+'" x="0" y="0" width="727" height="1105"/>';
  if(integ) g += barraInt(id, finColore());
  if(c === "laterale") g += LAT(593);
  if(c === "modulare") g += TESTA(238) + TESTA(930) + LAT(593) + LAT(238) + LAT(930);
  if(c === "ab3") g += LAT(593) + ALTO + BASSO;
  if(c === "altobasso") g += ALTO + BASSO;
  for(const [x,y] of puntiLeaf(c)) g += CER(x, y, col);
  if(main && S.motor) g += '<path d="M150 560 C 150 520, 140 500, 138 480" stroke="#2a2b2e" stroke-width="6" fill="none"/><rect x="130" y="440" width="20" height="50" rx="4" fill="#3a3b3f"/><circle cx="190" cy="575" r="11" fill="#36d64b" opacity=".3"/><circle cx="190" cy="575" r="6" fill="#36d64b"/>';
  if(main && S.elettrico && elettricoOk()) g += '<path d="M128 560 C 118 450, 118 200, 124 72" stroke="#2a2b2e" stroke-width="5" fill="none" stroke-dasharray="12 7"/><rect x="104" y="540" width="26" height="140" rx="5" fill="url(#mt)" stroke="#5c6168" filter="url(#sh)"/><rect x="110" y="585" width="14" height="40" rx="3" fill="#2a2b2e"/>';
  return g;
}
function badge(x, y){ return '<g transform="translate('+x+','+y+')"><circle r="24" fill="#ffcc00" stroke="#1d1d1f" stroke-width="3"/><path d="M4 -14 L-8 3 L0 3 L-4 15 L9 -3 L1 -3 Z" fill="#1d1d1f"/></g>'; }
function pin(x, y, n, c){ return '<g transform="translate('+x+','+y+')"><circle r="28" fill="'+c+'" stroke="#fff" stroke-width="3"/><text y="10" text-anchor="middle" font-family="Segoe UI,Arial" font-weight="700" font-size="28" fill="#fff">'+n+'</text></g>'; }
function drawDoor(){
  const s = serie(), two = S.ante === 2, BLU = "#0a84ff", ARA = "#ff9500";
  let g = '<defs><linearGradient id="mt" x1="0" x2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset="1" stop-color="#8b9097"/></linearGradient>'
    + '<filter id="sh" x="-20%" y="-40%" width="140%" height="200%"><feDropShadow dx="2" dy="5" stdDeviation="4" flood-opacity=".35"/></filter>'
    + '<clipPath id="cs"><rect x="0" y="0" width="585" height="1105"/></clipPath><clipPath id="cm"><rect x="585" y="0" width="600" height="1105"/></clipPath></defs>';
  let W = 727;
  if(two){
    W = 1170;
    g += '<g clip-path="url(#cs)"><g transform="translate(727,0) scale(-1,1)">'+leafSVG("s", "altobasso", false, ARA)+'</g></g>';
    g += '<g clip-path="url(#cm)"><g transform="translate(443,0)">'+leafSVG("m", "modulare", true, BLU)+'</g></g>';
    puntiLeaf("altobasso").forEach(([x,y], i) => g += pin(727-x-72, y<200?40:1070, i+1, ARA));
    [[593,1],[238,2],[930,3]].forEach(([y,n]) => g += pin(443+136+120, y-40, n, BLU));
    if(S.motor) g += badge(443+90, 465);
  } else {
    const c = S.chiusura;
    // 1 anta: scrocchi a destra (foto specchiata)
    g += '<g transform="translate(727,0) scale(-1,1)">'+leafSVG("u", c, true, BLU)+'</g>';
    puntiLeaf(c).forEach(([x,y], i) => g += x < 150 ? pin(727-70, y-44, i+1, BLU) : pin(727-x-72, y<200?40:1070, i+1, BLU));
    if(S.motor) g += badge(727-80, 465);
    if(S.elettrico && elettricoOk()) g += badge(727-66, 610);
  }
  // etichette
  const tags = [];
  if(INF()) tags.push("Tagliafuoco · serratura da infilare"+(S.imarca ? " "+S.imarca : ""));
  if(s) tags.push(s.nome + (S.motor ? " Electro" : "") + (s.barra==="separata" ? " · barra separata" : " · barra integrata"));
  if(two) tags.push("Principale: 3 punti laterali · Secondaria: alto/basso");
  else if(S.chiusura) tags.push(CHIUSURE[S.chiusura].nome);
  { const lt = lunghezzeTxt(); if(lt) tags.push(lt.charAt(0).toUpperCase()+lt.slice(1)); }
  const f = W/727, fs = 22*f, th = 44*f, gap = 56*f;
  tags.forEach((t, i) => { const w = Math.min(W-20, (t.length*13 + 40)*f); g += '<g transform="translate('+(W/2-w/2)+','+(1125+i*gap)+')"><rect width="'+w+'" height="'+th+'" rx="'+(14*f)+'" fill="#fff" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.12))"/><text x="'+(w/2)+'" y="'+(29*f)+'" font-size="'+fs+'" font-family="Segoe UI,Arial" text-anchor="middle" fill="#1d1d1f">'+esc(t)+'</text></g>'; });
  $("door").innerHTML = g;
  $("door").setAttribute("viewBox", "-10 20 "+(W+20)+" "+(1105+tags.length*gap+10));
}
function miniDoor(c, two){
  const dot = (x,y,col) => '<circle cx="'+x+'" cy="'+y+'" r="3.6" fill="'+(col||"#0a7aff")+'"/>';
  const bar = (x0,x1) => '<rect x="'+x0+'" y="37" width="'+(x1-x0)+'" height="5" rx="2.5" fill="#e0201b"/>';
  if(two){
    return '<svg width="56" height="70" viewBox="0 0 56 70"><rect x="2" y="2" width="25" height="66" rx="2" fill="#fff" stroke="#9aa0a8" stroke-width="1.5"/><rect x="29" y="2" width="25" height="66" rx="2" fill="#fff" stroke="#9aa0a8" stroke-width="1.5"/>'+bar(5,24)+bar(32,51)
      +'<line x1="22" y1="3" x2="22" y2="67" stroke="#9aa0a8" stroke-width="1.5"/>'+dot(22,3,"#ff9500")+dot(22,67,"#ff9500")
      +'<line x1="32" y1="12" x2="32" y2="58" stroke="#9aa0a8" stroke-width="1.5"/>'+dot(30,12)+dot(30,39.5)+dot(30,58)+'</svg>';
  }
  let g = '<svg width="44" height="70" viewBox="0 0 44 70"><rect x="2" y="2" width="40" height="66" rx="2" fill="#fff" stroke="#9aa0a8" stroke-width="1.5"/>'+bar(6,36);
  if(c==="laterale") g += dot(40,39.5);
  if(c==="modulare") g += '<line x1="37" y1="12" x2="37" y2="58" stroke="#9aa0a8" stroke-width="1.5"/>'+dot(40,12)+dot(40,39.5)+dot(40,58);
  if(c==="ab3") g += '<line x1="36" y1="3" x2="36" y2="67" stroke="#9aa0a8" stroke-width="1.5"/>'+dot(36,3)+dot(40,39.5)+dot(36,67);
  return g + '</svg>';
}

/* ---------- pagine ---------- */
function opt(sel, inner, onclick, dis){
  return '<button class="opt'+(sel?" sel":"")+(dis?" dis":"")+'" '+(dis?"disabled":"")+' data-act="'+esc(onclick)+'">'+inner+'</button>';
}
function pageTipo(){
  let h = '<h1>Cosa devi fare?</h1><div class="sub">Scegli il tipo di lavoro.</div><div class="opts">';
  h += opt(S.tipo==="applicare", '<div class="mini">'+miniDoor("laterale")+'</div><div class="txt"><b>Maniglione da applicare</b><p>Maniglione avvitato sull\'anta, 1 o 2 ante, 1 o 3 punti. CISA, ISEO, Antipanic.</p></div><div class="radio"></div>', "tipo:applicare");
  h += opt(S.tipo==="infilare", '<div class="mini"><svg width="44" height="70" viewBox="0 0 44 70"><rect x="2" y="2" width="40" height="66" rx="2" fill="#fff" stroke="#9aa0a8" stroke-width="1.5"/><rect x="6" y="37" width="30" height="5" rx="2.5" fill="#e0201b"/><rect x="31" y="28" width="9" height="22" rx="1.5" fill="#1d1d1f"/><circle cx="35.5" cy="46" r="2" fill="#ffcc00"/></svg></div><div class="txt"><b>Porta tagliafuoco con serratura da infilare</b><p>La serratura va dentro l\'anta e il maniglione da infilare la comanda. 1 anta. CISA Mito Panic o ISEO serie 214.</p></div><div class="radio"></div>', "tipo:infilare");
  h += opt(S.tipo==="ricambi", '<div class="mini"><svg width="44" height="70" viewBox="0 0 44 70"><rect x="6" y="20" width="32" height="30" rx="4" fill="#8e8e93"/><rect x="14" y="12" width="16" height="10" rx="2" fill="none" stroke="#8e8e93" stroke-width="3"/></svg></div><div class="txt"><b>Ricambi e adattatori</b><p>Kit per montare pezzi vecchi (Fast) su un maniglione Alpha.</p></div><div class="radio"></div>', "tipo:ricambi");
  return h + '</div>';
}
function pageIMarca(){
  let h = '<h1>Che marca di serratura?</h1><div class="sub">Il maniglione da infilare deve essere della stessa marca della serratura.</div><div class="opts">';
  for(const [id, I] of Object.entries(REG.infilare)){
    const m = REG.marche.find(x => x.id === id);
    h += opt(S.imarca===id, '<div class="txt"><b style="color:'+(m?m.colore:"#1d1d1f")+'">'+esc(I.nome)+'</b><p>'+esc(I.descr)+'</p><div class="pills">'+((I.maniglioni || I.maniglione.cod) ? '<span class="pill g">Maniglione in assortimento</span>' : '<span class="pill o">Maniglione da ordinare</span>')+'</div></div><div class="radio"></div>', "imarca:"+id);
  }
  return h + '</div>';
}
function pageISerratura(){
  const I = REG.infilare[S.imarca];
  let h = '<h1>Quale serratura?</h1><div class="sub">Scegli in base a come si deve aprire la porta da fuori.</div><div class="opts">';
  for(const sr of I.serrature){
    const c = sr.varianti ? sr.varianti[(S.iverso==="tirare"?"C":"")+S.imano] : sr.cod;
    h += opt(S.iserr===sr.id, '<div class="txt"><b>'+esc(sr.nome)+(sr.elettrica?' ⚡':'')+'</b><p>'+esc(sr.descr)+'</p><div class="pills"><span class="pill">'+esc(art(c)?art(c).interni[0].cod:c)+'</span>'+(art(c)?'':'<span class="pill o">da ordinare</span>')+'</div></div><div class="radio"></div>', "iserr:"+sr.id);
  }
  h += '</div>';
  const sr = serrInfilare();
  if(I.maniglioni){
    h += '<div class="group" style="margin-top:18px"><h3>Maniglione da infilare</h3><div class="opts grid">';
    for(const mn of I.maniglioni){ const a = art(mn.cod); h += opt((S.iman||I.maniglioni[0].id)===mn.id, '<div class="txt"><b>'+esc(mn.label)+'</b><div class="pills"><span class="pill">'+esc(a?a.interni[0].cod:mn.cod)+'</span></div></div><div class="radio"></div>', "iman:"+mn.id); }
    h += '</div></div>';
  }
  if(I.barre && I.barre.length > 1){
    const cur = (I.barre.find(x => x.mm >= S.larg - MARGINE) || I.barre[I.barre.length-1]).mm;
    h += '<div class="group" style="margin-top:18px"><h3>Lunghezza barra</h3><div class="info" style="margin:0 0 8px">Se la porta è più larga, prendi la più lunga: si accorcia in cantiere.</div><div class="opts grid">';
    for(const b of I.barre) h += opt(cur === b.mm, '<div class="txt"><b>'+b.mm+' mm</b><p>per ante larghe fino a '+(b.mm + MARGINE)+' mm</p></div><div class="radio"></div>', "len:0:"+b.mm);
    h += '</div></div>';
  }
  if(sr && sr.varianti){
    h += '<div class="group" style="margin-top:18px"><h3>Mano della serratura</h3><div class="opts grid">'
      + opt(S.imano==="D", '<div class="txt"><b>DIN destra</b></div><div class="radio"></div>', "imano:D")
      + opt(S.imano==="S", '<div class="txt"><b>DIN sinistra</b></div><div class="radio"></div>', "imano:S") + '</div></div>';
    h += '<div class="group"><h3>Verso di apertura</h3><div class="opts grid">'
      + opt(S.iverso==="spingere", '<div class="txt"><b>Porta a spingere</b><p>Uscita normale: il maniglione è sul lato a spingere.</p></div><div class="radio"></div>', "iverso:spingere")
      + opt(S.iverso==="tirare", '<div class="txt"><b>Porta a tirare</b><p>Scrocco rovesciato (versione .C), per porte di emergenza che si aprono verso l\'interno.</p></div><div class="radio"></div>', "iverso:tirare") + '</div></div>';
  }
  return h;
}
function pageRicambi(){
  let h = '<h1>Ricambi e adattatori</h1><div class="sub">Tutti gli articoli che il configuratore non propone: adattatori, ricambi e serie vecchie (Fast, Prestige). Per cercare un codice usa la ricerca in alto.</div><h3 style="margin:18px 0 10px;font-size:13px;color:#6e6e73">ADATTATORI</h3><div class="opts">';
  for(const r of REG.ricambi){
    const a = art(r.cod), con = r.con ? art(r.con) : null;
    h += '<div class="opt" style="cursor:default">'+(IMG[r.cod] ? '<div class="mini">'+thumb(r.cod, "fit")+'</div>' : '')+'<div class="txt"><b>'+esc(r.nome)+'</b><p>'+esc(r.descr)+'</p><div class="pills"><span class="pill">'+esc(a?a.interni[0].cod:r.cod)+'</span>'+(con?'<span class="pill">con '+esc(con.interni[0].cod)+'</span>':'')+'</div></div></div>';
  }
  h += '</div>';
  // tutto quello che il configuratore non propone è un ricambio (anche Fast, Prestige, fuori produzione)
  const usati = JSON.stringify(REG), grp = new Map();
  for(const [c, a] of Object.entries(CAT)){
    if(usati.includes('"'+c+'"')) continue;
    const g = gruppoRicambio(c, a);
    if(!grp.has(g)) grp.set(g, []);
    grp.get(g).push([c, a]);
  }
  const ord = ["CISA · vecchia serie Fast", "CISA · Prestige", "CISA · comandi esterni e cilindri", "CISA · altri ricambi", "ISEO", "ANTIPANIC", "Altri articoli"];
  const nomi = [...grp.keys()].sort((x, y) => (ord.indexOf(x) < 0 ? 99 : ord.indexOf(x)) - (ord.indexOf(y) < 0 ? 99 : ord.indexOf(y)));
  for(const g of nomi){
    const list = grp.get(g).sort((x, y) => x[1].desc.localeCompare(y[1].desc));
    h += '<h3 style="margin:22px 0 10px;font-size:13px;color:#6e6e73">'+esc(g.toUpperCase())+' ('+list.length+')</h3><div class="opts">';
    for(const [c, a] of list){
      const st = (a.interni[0].stato || "").trim();
      h += '<div class="opt" style="cursor:default">'+(IMG[c] ? '<div class="mini">'+thumb(c, "fit")+'</div>' : '')+'<div class="txt"><b>'+esc(a.desc)+'</b><div class="pills"><span class="pill">'+esc(a.interni[0].cod)+'</span>'+(a.interni[0].cod!==c?'<span class="pill">fornitore '+esc(c)+'</span>':'')+(st?'<span class="pill o">stato '+esc(st)+'</span>':'')+(a.aggiunto?'<span class="pill g">aggiunto</span>':'')+'</div></div></div>';
    }
    h += '</div>';
  }
  return h;
}
function gruppoRicambio(c, a){
  const d = (a.desc || "").toUpperCase(), m = (a.marca || "").toUpperCase();
  if(m === "CISA"){
    if(/PRESTIGE|59311|59316/.test(d) || /^1593/.test(c)) return "CISA · Prestige";
    if(/FAST|TOUCH BAR/.test(d) || /^1590|^1598/.test(c)) return "CISA · vecchia serie Fast";
    if(/COMANDO|POMOLO|PLACCA|ELETTROMANIGLIA/.test(d)) return "CISA · comandi esterni e cilindri";
    return "CISA · altri ricambi";
  }
  return m || "Altri articoli";
}
function pagePorta(){
  let h = '<h1>Quante ante ha la porta?</h1><div class="sub">Con 2 ante la principale chiude a 3 punti laterali e si appoggia sulla secondaria, che chiude in alto e in basso.</div><div class="opts">';
  h += opt(S.ante===1, '<div class="mini">'+miniDoor("laterale")+'</div><div class="txt"><b>Porta a 1 anta</b><p>Un solo maniglione.</p></div><div class="radio"></div>', "ante:1");
  h += opt(S.ante===2, '<div class="mini">'+miniDoor(null,true)+'</div><div class="txt"><b>Porta a 2 ante</b><p>Principale 3 punti laterali + secondaria alto/basso.</p></div><div class="radio"></div>', "ante:2");
  return h + '</div>';
}
function pageChiusura(){
  if(S.ante === 2){
    return '<h1>Punti di chiusura</h1><div class="sub">Con 2 ante la configurazione è fissa.</div><div class="opts">'
      + opt(true, '<div class="mini">'+miniDoor(null,true)+'</div><div class="txt"><b>Principale: 3 punti laterali</b><p>Scrocco centrale più 2 laterali, che chiudono sulla secondaria.</p></div><div class="radio"></div>', "noop:")
      + opt(true, '<div class="mini">'+miniDoor(null,true)+'</div><div class="txt"><b>Secondaria: alto/basso</b><p>Chiude nel telaio in alto e a pavimento.</p></div><div class="radio"></div>', "noop:")
      + '</div>';
  }
  let h = '<h1>Come chiude la porta?</h1><div class="sub">Scegli i punti di chiusura.</div><div class="opts">';
  for(const c of ["laterale","modulare","ab3"]) h += opt(S.chiusura===c, '<div class="mini">'+miniDoor(c)+'</div><div class="txt"><b>'+CHIUSURE[c].nome+'</b><p>'+CHIUSURE[c].descr+'</p>'+(c==="laterale"?'<div class="pills"><span class="pill b">Unico con incontro elettrico</span></div>':'')+'</div><div class="radio"></div>', "chiusura:"+c);
  return h + '</div>';
}
function campo(label, key, min, max, step){
  return '<div class="group"><h3>'+label+'</h3><div class="field"><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+S[key]+'" data-in="'+key+'"><div class="big"><input class="numin" type="number" min="'+min+'" max="'+max+'" step="'+step+'" value="'+S[key]+'" data-in="'+key+'"> mm</div></div></div>';
}
function pageMisure(){
  if(INF()){
    let h = '<h1>Larghezza dell\'anta</h1><div class="sub">Serve per scegliere la lunghezza della barra del maniglione da infilare.</div>';
    h += campo("Larghezza anta", "larg", 500, 1600, 10);
    return h + '<div class="info">Barra consigliata = larghezza anta − '+MARGINE+' mm, si accorcia in cantiere.</div>';
  }
  let h = '<h1>Misure della porta</h1><div class="sub">Dall\'altezza scelgo aste e prolunghe, dalla larghezza la lunghezza del maniglione (il più lungo possibile, si accorcia in cantiere).</div>';
  h += campo("Altezza porta", "altezza", 1800, 3600, 10);
  h += campo(S.ante===2 ? "Larghezza anta principale" : "Larghezza anta", "larg", 500, 1600, 10);
  if(S.ante === 2) h += campo("Larghezza anta secondaria", "larg2", 300, 1600, 10);
  h += '<div class="info">Lunghezza consigliata = larghezza anta − '+MARGINE+' mm. La barra non deve mai coprire meno del 60% dell\'anta (EN 1125).</div>';
  return h;
}
function pageMotore(){
  const push = REG.serie.find(x => x.motorizzato);
  const a = ante().find(x => x.main), len = scegliLen(push, a.larg), cod = lookupWith(push.motorizzato, len, "nerorosso");
  let h = '<h1>Apertura a distanza?</h1><div class="sub">Da pulsante, badge o citofono. L\'incontro elettrico va solo sulla porta a 1 anta a 1 punto; negli altri casi serve il motorizzato.</div><div class="opts">';
  h += opt(!S.motor && !S.elettrico, '<div class="txt"><b>No, solo meccanico</b><p>Poi scegli marca e serie.</p></div><div class="radio"></div>', "motor:0");
  if(incontroAmmesso() || S.elettrico) h += opt(S.elettrico, '<div class="mini"><svg width="30" height="56"><rect x="6" y="2" width="18" height="52" rx="4" fill="#ffd60a" stroke="#c9a000"/><path d="M17 14 L11 29 H16 L13 42 L20 25 H15 Z" fill="#1d1d1f"/></svg></div><div class="txt"><b>Sì · incontro elettrico</b><p>Sul telaio, dove entra lo scrocco laterale. Disponibile su CISA Alpha e ISEO Idea Base / Push.</p></div><div class="radio"></div>', "inc:1");
  else h += '<div class="info">Incontro elettrico non possibile: '+(S.ante===2?"porta a 2 ante":"porta a 3 punti")+'. Per aprire a distanza usa il motorizzato.</div>';
  h += opt(S.motor, '<div class="mini"><svg width="30" height="56"><rect x="6" y="2" width="18" height="52" rx="4" fill="#ffd60a" stroke="#c9a000"/><path d="M17 14 L11 29 H16 L13 42 L20 25 H15 Z" fill="#1d1d1f"/></svg></div><div class="txt"><b>Sì · motorizzato ISEO Push Electro</b><p>Unico motorizzato in assortimento. Nero/rosso, '+len+' mm per questa anta.</p><div class="pills">'+stockPill(cod)+'</div></div><div class="radio"></div>', "motor:1");
  return h + '</div>';
}
function pageMarca(){
  let h = '<h1>Che marca usiamo?</h1><div class="sub">'+(S.motor ? "Motorizzato: in assortimento c'è solo ISEO Push Electro. Se scegli un'altra marca, il motorizzato si toglie." : "Ti mostro solo le marche con serie adatte alla porta.")+'</div><div class="opts">';
  for(const m of REG.marche){
    const n = REG.serie.filter(s => s.marca === m.id && compatibile(s, false)).length;
    const nm = REG.serie.filter(s => s.marca === m.id && compatibile(s)).length;
    h += opt(S.marca===m.id, '<div class="brandlogo" style="background:'+m.colore+'">'+esc(m.nome.slice(0,4).toUpperCase())+'</div><div class="txt"><b>'+esc(m.nome)+'</b><p>'+esc(m.descr)+'</p><div class="pills"><span class="pill">'+n+' serie adatte</span>'+(!nm ? '<span class="pill o">Scegliendola togli '+(S.motor?"il motorizzato":"l\'incontro elettrico")+'</span>' : '')+'</div></div><div class="radio"></div>', "marca:"+m.id, !n);
  }
  return h + '</div>';
}
function pageSerie(){
  let h = '<h1>Quale maniglione?</h1><div class="sub">Barra integrata (push/touch bar) o barra separata montata su due leve.</div>';
  for(const tipo of ["separata","integrata"]){
    const list = REG.serie.filter(s => s.marca === S.marca && s.barra === tipo && compatibile(s, false));
    if(!list.length) continue;
    h += '<div class="group"><h3>'+(tipo==="separata" ? "Barra separata" : "Barra integrata")+'</h3><div class="opts">';
    for(const s of list){
      const tot = [...new Set(Object.values(s.man).map(v => typeof v === "string" ? [v] : Object.values(v)).flat())];
      const lens = s.lunghezze.length ? ante().map(a => scegliLen(s, a.larg)+" mm").join(" + ") : "";
      h += opt(S.serie===s.id, '<div class="mini">'+(s.stile==="touch" ? '<svg width="50" height="30"><rect x="2" y="5" width="46" height="20" rx="6" fill="#1c1c1e"/><rect x="12" y="10" width="32" height="10" rx="4" fill="#e0201b"/></svg>' : '<svg width="50" height="30"><rect x="2" y="4" width="10" height="22" rx="3" fill="#1c1c1e"/><rect x="36" y="2" width="12" height="26" rx="3" fill="#1c1c1e"/><rect x="8" y="11" width="32" height="8" rx="4" fill="#e0201b"/></svg>')+'</div><div class="txt"><b>'+esc(s.nome)+(S.motor && s.motorizzato?" Electro":"")+'</b><p>'+esc(s.descr)+'</p><div class="pills">'+(s.infilare?'<span class="pill o">Tagliafuoco · da infilare</span>':'')+(lens?'<span class="pill b">'+lens+'</span>':'')+'</div></div><div class="radio"></div>', "serie:"+s.id);
    }
    h += '</div></div>';
  }
  return h;
}
function pageBarra(){
  const s = serie();
  let h = '<h1>Finitura e barra</h1><div class="sub">Scegli finitura, lunghezza'+(serveAltezza()?' e altezza porta':'')+'.</div>';
  if(s.infilare){
    h += '<div class="group"><h3>Maniglione da infilare</h3><div class="opts">';
    for(const m of s.maniglioni) h += opt(S.maniglione===m.cod, '<div class="txt"><b>'+esc(m.label)+'</b><div class="pills">'+stockPill(m.cod)+'</div></div><div class="radio"></div>', "maniglione:"+m.cod);
    h += '</div></div><div class="group"><h3>Serratura tagliafuoco</h3><div class="opts">';
    for(const m of s.serrature) h += opt(S.serratura===m.cod, '<div class="txt"><b>'+esc(m.label)+'</b><div class="pills">'+stockPill(m.cod)+'</div></div><div class="radio"></div>', "serratura:"+m.cod);
    h += '</div></div>';
  }
  h += '<div class="group"><h3>'+(s.barra==="separata"?"Colore carter":"Finitura")+'</h3><div class="opts grid">';
  for(const f of s.finiture){
    const ok = disponibile(f.id) && !(S.motor && f.id !== "nerorosso");
    h += opt(S.fin===f.id, '<span class="swatch" style="background:'+f.colore+'"></span><div class="txt"><b>'+esc(f.label)+'</b>'+(ok?'':'<p>Non disponibile con queste misure'+(S.motor?" o col motorizzato":"")+'</p>')+'</div><div class="radio"></div>', "fin:"+f.id, !ok);
  }
  h += '</div></div>';
  if(s.barra==="separata"){
    h += '<div class="group"><h3>Colore barra</h3><div class="opts grid">';
    for(const [col, colore] of barColori(s)){
      const b = ante().map(a => scegliBarra(s, a.larg, col));
      h += opt(S.barcol===col, '<span class="swatch" style="background:'+colore+'"></span><div class="txt"><b>'+esc(col.charAt(0).toUpperCase()+col.slice(1))+'</b><div class="pills">'+[...new Set(b.map(x=>x.cod))].map(c => { const x = b.find(y=>y.cod===c); return '<span class="pill b">'+x.mm+' mm</span>'+stockPill(c); }).join("")+'</div></div><div class="radio"></div>', "barcol:"+col);
    }
    h += '</div></div>';
  }
  h += sceltaLunghezza(s);
  h += sceltaAltezza(s);
  h += sceltaColleg();
  return h;
}
/* lunghezza del maniglione (barra integrata) o della barra (separata), scelta per anta */
function lunghezzeAnta(s, a){
  if(s.barra === "separata"){
    if(!S.barcol) return [];
    return [...new Set(barre(s).filter(b => b.col === S.barcol).map(b => b.mm))].sort((x, y) => x - y).map(mm => ({mm, ok:true}));
  }
  const fin = S.fin || s.finiture[0].id;
  return s.lunghezze.map(l => +l.id).sort((x, y) => x - y).map(mm => {
    const src = (S.motor && a.main && s.motorizzato) ? s.motorizzato : s.man[manKey(a.c)];
    return {mm, ok: !!lookupWith(src, String(mm), fin)};
  });
}
function sceltaLunghezza(s){
  let h = "";
  ante().forEach((a, i) => {
    const L = lunghezzeAnta(s, a); if(L.length < 2) return;
    const cur = lunghezzaAnta(s, a);
    h += '<div class="group"><h3>Lunghezza '+(s.barra === "separata" ? "barra" : "maniglione")+(S.ante === 2 ? " · "+a.nome.toLowerCase() : "")+'</h3>'
       + '<div class="info" style="margin:0 0 8px">Se la porta è più larga, prendi la più lunga: si accorcia in cantiere.</div><div class="opts grid">';
    for(const x of L) h += opt(cur === x.mm, '<div class="txt"><b>'+x.mm+' mm</b><p>'+(x.ok ? 'per ante larghe fino a '+(x.mm + MARGINE)+' mm' : 'non disponibile in questa finitura')+'</p></div><div class="radio"></div>', "len:"+i+":"+x.mm, !x.ok);
    h += '</div></div>';
  });
  return h;
}
/* altezza: solo la domanda "è più alta della soglia?" quando ci sono chiusure alto/basso o laterali */
function sceltaAltezza(s){
  if(!serveAltezza()) return "";
  const t = sogliaH(s);
  const no = s.collegamento ? "Cavi o aste normali." : (s.aste ? "Aste "+s.aste[0].max+" mm." : "Aste e scrocchi del kit.");
  const si = s.prolunga ? "Solo cavi + prolunga "+s.prolunga.cod+" (fino a "+s.prolunga.max+" mm)." : (s.aste && s.aste[1] ? "Aste lunghe "+s.aste[1].max+" mm (fino a "+s.aste[1].max+" mm)." : null);
  let h = '<div class="group"><h3>La porta è più alta di '+t+' mm?</h3><div class="opts grid">';
  h += opt(!S.alta, '<div class="txt"><b>No, fino a '+t+' mm</b><p>'+esc(no)+'</p></div><div class="radio"></div>', "alta:0");
  h += opt(S.alta, '<div class="txt"><b>Sì, più alta</b><p>'+esc(si || "Questa serie arriva al massimo a "+s.maxH+" mm: scegli un'altra serie (es. CISA Alpha con prolunga o ISEO con aste 3400).")+'</p></div><div class="radio"></div>', "alta:1", !si);
  return h + '</div></div>';
}
function sceltaColleg(){
  const s = serie(); if(!serveColleg()) return "";
  let h = '<div class="group"><h3>Collegamento scrocchi</h3><div class="opts grid">';
  const sc = soloCavi();
  for(const [k, c] of Object.entries(s.collegamento)){
    const no = sc && k !== "cavi";
    const p = no ? 'Porta oltre '+s.prolunga.oltre+' mm con chiusure supplementari: si usano solo i cavi (la prolunga per aste non è in assortimento).' : (k==="cavi"?"Cavo flessibile":"Asta rigida")+'. Prolunga per porte oltre '+s.prolunga.oltre+' mm: '+c.prolunga;
    h += opt(S.colleg===k, '<div class="txt"><b>'+c.label+'</b><p>'+p+'</p><div class="pills">'+stockPill(c.cod)+'</div></div><div class="radio"></div>', "colleg:"+k, no);
  }
  return h + '</div></div>';
}
function pageEsterno(){
  const s = serie();
  let h = '<h1>Cosa c\'è dal lato esterno?</h1><div class="sub">Il comando va solo sull\'anta principale. Senza comando, da fuori la porta non si apre.</div><div class="opts">';
  h += opt(S.esterno==="nessuno", '<div class="mini"><svg width="40" height="40"><rect x="8" y="4" width="24" height="32" rx="4" fill="none" stroke="#9aa0a8" stroke-width="2"/></svg></div><div class="txt"><b>Nessun comando esterno</b><p>Porta solo di uscita.</p></div><div class="radio"></div>', "esterno:nessuno");
  for(const e of s.esterni){
    const cod = lookupWith(e.cod, null, S.fin);
    const icon = e.id.indexOf("pomolo")===0 ? '<circle cx="20" cy="22" r="8" fill="#1c1c1e"/>' : e.id==="cilindro" ? '<circle cx="20" cy="20" r="6" fill="#c9a227"/><rect x="18" y="20" width="4" height="9" fill="#c9a227"/>' : '<rect x="16" y="20" width="22" height="6" rx="3" fill="#1c1c1e"/><circle cx="18" cy="23" r="6" fill="#1c1c1e"/>';
    const no = e.solo1p && !unPunto();
    h += opt(S.esterno===e.id, '<div class="mini"><svg width="40" height="44"><rect x="8" y="4" width="24" height="36" rx="5" fill="#e4e6ea" stroke="#b8bcc2"/>'+icon+'</svg></div><div class="txt"><b>'+esc(e.label)+'</b>'+(no?'<p>Solo con 1 punto di chiusura: con più punti usa il pomolo con cilindro, che con la chiave aziona fino a 3 punti.</p>':(e.extra?'<p>Si monta con l\'adattatore e un cilindro tondo CISA 0G200.55, che aggiungo in automatico.</p>':''))+'<div class="pills">'+stockPill(cod)+(e.extra && !no ? e.extra.map(stockPill).join("") : '')+'</div></div><div class="radio"></div>', "esterno:"+e.id, no);
  }
  h += '</div>';
  if(s.piastra) h += '<div class="group" style="margin-top:20px"><h3>Accessori</h3><div class="opts">'+opt(S.piastra, '<div class="txt"><b>Piastra copri lavorazioni</b><p>Copre i fori di un vecchio comando esterno.</p><div class="pills">'+stockPill(s.piastra)+'</div></div><div class="check">'+(S.piastra?"✓":"")+'</div>', "toggle:piastra")+'</div></div>';
  return h;
}
function pageElettrico(){
  const s = serie();
  const ap = S.motor ? "motorizzato ISEO Push Electro" : (S.elettrico && elettricoOk() ? "incontro elettrico ("+s.elettrico.cod.map(c=>lookupWith(c,null,S.fin)).join(" + ")+")" : "nessuna");
  let h = '<h1>Accessori</h1><div class="sub">Apertura a distanza scelta: <b>'+esc(ap)+'</b>. Per cambiarla torna al passo "Apertura a distanza".</div>';
  if(s.fermo) h += '<div class="opts">'+opt(S.fermo, '<div class="txt"><b>Fermo a giorno</b><p>Tiene lo scrocco rientrato durante il giorno.</p><div class="pills">'+stockPill(s.fermo)+'</div></div><div class="check">'+(S.fermo?"✓":"")+'</div>', "toggle:fermo")+'</div>';
  else h += '<div class="info">Per questa serie non ci sono altri accessori in assortimento.</div>';
  return h;
}
function descrPorta(){ const lt = lunghezzeTxt(); if(INF()) return "Porta tagliafuoco 1 anta · serratura da infilare"+(lt?" · "+lt:""); if(S.tipo === "ricambi") return "Ricambi e adattatori"; return (S.ante===2 ? "2 ante · principale 3 punti laterali, secondaria alto/basso" : "1 anta · "+(S.chiusura?CHIUSURE[S.chiusura].nome:"")) + (lt?" · "+lt:"") + (S.motor?" · motorizzato":""); }
function titolo(){
  if(INF()){ const I = REG.infilare[S.imarca]; return I ? I.nome+" · da infilare" : "Serratura da infilare"; }
  const s = serie(); return (marca()?marca().nome+" ":"")+(s?s.nome:"")+(S.motor?" Electro":"");
}
function pageRiepilogo(){
  const rows = righeUnite();
  let h = '<h1>Riepilogo</h1><div class="sub">'+esc(titolo())+' · '+esc(descrPorta())+'</div>';
  h += '<div><h3 style="font-size:12px;color:#6e6e73;margin-bottom:6px">Riferimento (cliente, cantiere, ordine)</h3><input class="txtin" data-in="rif" value="'+esc(S.rif)+'" placeholder="Rossi srl · uscita magazzino"></div>';
  h += '<table class="table"><tr><th>Codice interno</th><th>Fornitore</th><th>Descrizione</th><th style="text-align:right">Q.tà</th><th></th></tr>';
  for(const r of rows){
    const a = art(r.cod), int = a ? a.interni.map(x=>x.cod) : [];
    h += '<tr><td>'+thumb(r.cod, "th big")+'<span class="mono">'+(int[0]||"—")+'</span>'+(int.length>1?'<div style="font-size:11px;color:#0756c4">anche '+int.slice(1).join(", ")+'</div>':"")+'</td><td class="mono" style="font-weight:500">'+esc(r.cod)+'</td><td>'+esc(a?a.desc:"Da ordinare al fornitore")+'<div style="font-size:11px;color:#8e8e93">'+[...r.ruoli].join(" · ")+'</div></td><td style="text-align:right;font-weight:700">'+r.q+'</td><td style="text-align:right">'+stockBadge(r.cod, r.q)+'</td></tr>';
  }
  h += '</table>';
  return h;
}
function stockBadge(cod, q){
  const a = art(cod);
  if(!a) return '<span class="st n">da ordinare</span>';
  return '';
}

/* ---------- render ---------- */
function stepValue(id){
  const s = serie();
  switch(id){
    case "tipo": return S.tipo==="applicare" ? "Da applicare" : (S.tipo==="infilare" ? "Da infilare" : "Ricambi");
    case "imarca": return S.imarca ? REG.infilare[S.imarca].nome : "";
    case "iserratura": { const sr = serrInfilare(); return sr ? sr.nome : ""; }
    case "porta": return S.ante+" ant"+(S.ante===1?"a":"e")+(S.porte>1?" ×"+S.porte:"");
    case "chiusura": return S.ante===2 ? "3 lat. + alto/basso" : (S.chiusura ? CHIUSURE[S.chiusura].nome : "");
    case "motore": return S.motor ? "Motorizzato" : (S.elettrico ? "Incontro elettrico" : "No");
    case "marca": return marca() ? marca().nome : "";
    case "serie": return s ? s.nome : "";
    case "barra": { if(!s) return ""; const f = s.finiture.find(x=>x.id===S.fin); return [f && f.label, S.barcol, lunghezzeTxt(), serveColleg() && S.colleg ? serie().collegamento[S.colleg].label.toLowerCase() : ""].filter(Boolean).join(" · "); }
    case "esterno": { if(!s) return ""; const e = s.esterni.find(x=>x.id===S.esterno); return e ? e.label : "Nessuno"; }
    case "elettrico": return S.fermo ? "Fermo a giorno" : "Nessuno";
    default: return "";
  }
}
function render(){
  let nav = "";
  STEPS.forEach((st, i) => {
    if(i === STEPS.length-1) nav += '<div class="sec" style="margin-top:12px">FINE</div>';
    const cls = i === S.step ? "on" : (i <= S.maxStep ? "" : "todo");
    const v = (i <= S.maxStep && i !== S.step) ? stepValue(st.id) : "";
    nav += '<button class="step '+cls+'" data-go="'+i+'"><div class="ic" style="background:'+st.col+'">'+st.ic+'</div>'+st.nome+(v?'<span class="v">'+esc(v)+'</span>':'')+'</button>';
  });
  $("steps").innerHTML = nav;
  const m = marca();
  $("brandcard").innerHTML = m ? '<small>Marca scelta</small><b style="color:'+m.colore+'">'+esc(m.nome.toUpperCase())+'</b><p>'+esc(m.descr)+'</p>' : '<small>Porta</small><b style="color:#1d1d1f;font-size:15px">'+esc(descrPorta())+'</b><p>'+(S.tipo==="applicare"?"Poi scegli marca e serie.":(S.tipo==="infilare"?"Serratura e maniglione da infilare della stessa marca.":"Consultazione, non entra in stampa."))+'</p>';
  const parts = S.tipo==="ricambi" ? [] : (INF() ? ["Tagliafuoco da infilare", S.imarca] : [S.ante===2?"Porta 2 ante":"Porta 1 anta", m && m.nome, serie() && serie().nome]).filter(Boolean);
  $("crumb").innerHTML = parts.map(esc).join(" › ") + (parts.length?" › ":"") + "<b>"+STEPS[S.step].nome+"</b>";
  const P = {tipo:pageTipo, imarca:pageIMarca, iserratura:pageISerratura, ricambi:pageRicambi, porta:pagePorta, chiusura:pageChiusura, misure:pageMisure, motore:pageMotore, marca:pageMarca, serie:pageSerie, barra:pageBarra, esterno:pageEsterno, elettrico:pageElettrico, riepilogo:pageRiepilogo};
  let html = P[STEPS[S.step].id]();
  if(S.step >= idxAvvisi()){ const w = avvisi(); if(w.length) html += w.map(t => '<div class="warn">⚠︎ '+esc(t)+'</div>').join(""); }
  $("page").innerHTML = html;
  $("passo").textContent = "Passo "+(S.step+1)+" di "+STEPS.length;
  $("progbar").style.width = ((S.step+1)/STEPS.length*100)+"%";
  $("back").style.visibility = S.step === 0 ? "hidden" : "visible";
  $("next").innerHTML = S.step === STEPS.length-1 ? "Nuova configurazione" : "Continua ›";
  $("heroseg").style.display = S.tipo === "applicare" ? "" : "none";
  $("heroseg").innerHTML = '<button class="'+(S.ante===1?"a":"")+'" data-act="ante:1">1 anta</button><button class="'+(S.ante===2?"a":"")+'" data-act="ante:2">2 ante</button>';
  document.querySelector(".hero").style.display = (STEPS[S.step].id === "riepilogo" || S.tipo === "ricambi") ? "none" : "";
  drawDoor();
  renderLines();
}
function renderLines(){
  const r = righe();
  if(!r.length){ $("lines").innerHTML = '<div class="empty">Scegli porta e serie:<br>qui compaiono i codici.</div>'; $("bcbox").style.display="none"; return; }
  let h = "", last = null;
  for(const x of r){
    if(x.anta !== last && S.ante === 2){ h += '<div class="anta">'+x.anta.toUpperCase()+'</div>'; last = x.anta; }
    if(x.nota){ h += '<div class="ln" style="box-shadow:0 0 0 1.5px #d1d1d6"><div class="q">+</div><div class="t"><b style="font-family:inherit">Da aggiungere</b><span>'+esc(x.ruolo)+'</span></div></div>'; continue; }
    if(x.err){ h += '<div class="ln" style="box-shadow:0 0 0 1.5px #ff9f0a"><div class="q">!</div><div class="t"><b style="font-family:inherit">Non disponibile</b><span>'+esc(x.ruolo)+'</span></div></div>'; continue; }
    const a = art(x.cod), int = a ? a.interni.map(i=>i.cod) : [];
    h += '<div class="ln"><div class="q">'+(x.q*S.porte)+'</div>'+thumb(x.cod)+'<div class="t"><b>'+(int[0]||x.cod)+'</b><span>'+esc(x.cod)+' · '+esc(x.ruolo)+'</span>'+(int.length>1?'<span class="alt">anche '+int.slice(1).join(", ")+'</span>':'')+'</div>'+stockBadge(x.cod, x.q*S.porte)+'</div>';
  }
  $("lines").innerHTML = h;
  const first = r.find(x => !x.err && !x.nota);
  if(first){ const a = art(first.cod), code = a ? a.interni[0].cod : first.cod; $("bcbox").style.display=""; $("bctext").textContent = code; code128svg($("bcprev"), code); } else $("bcbox").style.display="none";
}

/* ---------- azioni ---------- */
function sistema(){ // dopo un cambio: toglie le scelte non più valide
  aggiornaAltezza();
  const s = serie();
  if(s && !compatibile(s)){ S.serie = null; S.fin = null; S.barcol = null; S.maniglione = null; S.serratura = null; S.esterno = "nessuno"; S.fermo = false; S.piastra = false; }
  if(S.marca && !REG.serie.some(x => x.marca === S.marca && compatibile(x))) S.marca = null;
  const s2 = serie();
  if(s2 && S.fin && (!disponibile(S.fin) || (S.motor && S.fin !== "nerorosso"))) S.fin = null;
  if(!incontroAmmesso() || (serie() && !serie().elettrico)) S.elettrico = false;
  if(serie() && S.esterno !== "nessuno"){ const e = serie().esterni.find(x => x.id === S.esterno); if(!e || (e.solo1p && !unPunto())) S.esterno = "nessuno"; }
  if(S.alta && serie() && !serie().prolunga && !(serie().aste && serie().aste[1])) S.alta = false;
  aggiornaAltezza();
  if(soloCavi() && S.colleg !== "cavi") S.colleg = "cavi";
  if(S.tipo === "applicare" && !S.serie) S.maxStep = Math.min(S.maxStep, idx("serie"));
}
function act(a){
  const i = a.indexOf(":"), k = a.slice(0, i), v = a.slice(i+1);
  switch(k){
    case "tipo": if(S.tipo !== v){ const keep = {porte:S.porte, rif:S.rif, altezza:S.altezza, larg:S.larg}; reset(); Object.assign(S, keep); S.tipo = v; STEPS = v === "infilare" ? STEPS_INF : (v === "ricambi" ? STEPS_RIC : STEPS_APP); if(v !== "applicare"){ S.ante = 1; S.chiusura = "laterale"; } } break;
    case "imarca": if(S.imarca !== v){ S.imarca = v; S.iserr = null; } break;
    case "iserr": S.iserr = v; break;
    case "imano": S.imano = v; break;
    case "iverso": S.iverso = v; break;
    case "iman": S.iman = v; break;
    case "ante": if(S.tipo !== "applicare") return; S.ante = +v; if(S.ante === 2) S.chiusura = null; break;
    case "chiusura": S.chiusura = v; break;
    case "inc": S.elettrico = true; S.motor = false; break;
    case "motor": S.motor = v === "1"; S.elettrico = false; if(S.motor){ S.marca = "ISEO"; S.serie = REG.serie.find(x => x.motorizzato).id; S.fin = "nerorosso"; } break;
    case "marca": if(S.marca !== v){ S.marca = v; S.serie = null; if(!REG.serie.some(x => x.marca === v && compatibile(x))){ if(S.motor){ S.motor = false; S.fin = null; toast("Motorizzato tolto: c'è solo su ISEO Push"); } if(S.elettrico){ S.elettrico = false; toast("Incontro elettrico tolto: non c'è per questa marca"); } } } break;
    case "serie": { const ns0 = REG.serie.find(x => x.id === v); if(S.motor && !ns0.motorizzato){ S.motor = false; toast("Motorizzato tolto: c'è solo su ISEO Push"); } if(S.elettrico && !ns0.elettrico){ S.elettrico = false; toast("Incontro elettrico tolto: non c'è per questa serie"); } }
      if(S.serie !== v){ S.serie = v; const ns = serie(); S.fin = ns.finiture.length===1 ? ns.finiture[0].id : (S.motor ? "nerorosso" : null); S.barcol = barColori(ns).length===1 ? barColori(ns)[0][0] : null; S.esterno="nessuno"; S.fermo=false; S.piastra=false; S.maniglione=null; S.serratura=null; } break;
    case "fin": S.fin = v; break;
    case "len": { const [ai, mm] = v.split(":"); if(+ai === 1) S.larg2 = +mm + MARGINE; else S.larg = +mm + MARGINE; break; }
    case "alta": S.alta = v === "1"; break;
    case "barcol": S.barcol = v; break;
    case "colleg": S.colleg = v; break;
    case "maniglione": S.maniglione = v; break;
    case "serratura": S.serratura = v; break;
    case "esterno": S.esterno = v; break;
    case "elettrico": S.elettrico = v === "1"; break;
    case "toggle": S[v] = !S[v]; break;
    case "vai": go(idx(v)); return;
    case "noop": return;
  }
  sistema();
  render();
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if(b && !b.disabled){ act(b.getAttribute("data-act")); return; }
  const g = e.target.closest("[data-go]"); if(g){ const i = +g.getAttribute("data-go"); if(i <= S.maxStep || i === S.step+1) go(i); return; }
  if(!e.target.closest(".searchwrap")) $("results").hidden = true;
});
let tMis = null;
document.addEventListener("input", e => {
  const k = e.target.getAttribute("data-in"); if(!k) return;
  if(k === "altezza" || k === "larg" || k === "larg2"){
    const v = +e.target.value; if(!v) return;
    S[k] = v;
    document.querySelectorAll('[data-in="'+k+'"]').forEach(n => { if(n !== e.target) n.value = v; });
    drawDoor(); renderLines();
    clearTimeout(tMis); tMis = setTimeout(() => { sistema(); refreshWarn(); }, 250);
  }
  if(k === "porte"){ S.porte = +e.target.value; $("porteval").textContent = S.porte; renderLines(); }
  if(k === "porte2"){ S.porte = Math.max(1, Math.min(99, +e.target.value||1)); renderLines(); }
  if(k === "rif"){ S.rif = e.target.value; }
});
document.addEventListener("change", e => { if(e.target.getAttribute("data-in") === "porte2") render(); });
function refreshWarn(){ document.querySelectorAll(".warn").forEach(n=>n.remove()); const w = avvisi(); if(S.step>=idxAvvisi() && w.length) $("page").insertAdjacentHTML("beforeend", w.map(t => '<div class="warn">⚠︎ '+esc(t)+'</div>').join("")); }
$("next").onclick = () => { if(S.step === STEPS.length-1){ reset(); render(); return; } if(!stepOk(S.step)){ toast("Fai una scelta per continuare"); return; } go(S.step+1); };
$("back").onclick = () => go(S.step-1);


/* ---------- ricerca ---------- */
$("search").addEventListener("input", e => {
  const q = e.target.value.trim().toUpperCase(); const box = $("results");
  if(q.length < 2){ box.hidden = true; return; }
  const res = [];
  for(const [cod, a] of Object.entries(CAT)){
    const hay = (cod+" "+a.interni.map(i=>i.cod).join(" ")+" "+a.desc).toUpperCase();
    if(hay.includes(q)) res.push([cod, a]);
    if(res.length >= 40) break;
  }
  box.innerHTML = res.length ? res.map(([c,a]) => '<div class="res">'+thumb(c)+'<div style="flex:1;min-width:0"><b>'+a.interni[0].cod+'</b> <span style="color:#8e8e93">· '+esc(c)+'</span><div style="font-size:11.5px;color:#6e6e73;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(a.desc)+'</div></div>'+stockBadge(c,1)+'</div>').join("") : '<div class="empty">Nessun articolo trovato</div>';
  box.hidden = false;
});


/* ---------- stampa e copia ---------- */
function payload(){
  const s = serie();
  return {
    rif: S.rif, porte: S.porte,
    titolo: titolo(),
    dettagli: INF() ? [ descrPorta(), "Serratura: "+stepValue("iserratura")+(serrInfilare() && serrInfilare().varianti ? " · DIN "+(S.imano==="D"?"destra":"sinistra")+" · porta a "+S.iverso : "") ]
      : [ descrPorta(), stepValue("barra"), "Esterno: "+stepValue("esterno"), "Apertura a distanza: "+stepValue("motore"), "Accessori: "+stepValue("elettrico") ].filter(Boolean),
    righe: righeUnite().map(r => { const a = art(r.cod); return {interno: a?a.interni[0].cod:"", altri: a?a.interni.slice(1).map(i=>i.cod):[], fornitore: r.cod, descrizione: a?a.desc:"DA ORDINARE AL FORNITORE", ruolo:[...r.ruoli].join(" · "), qta: r.q}; }),
    avvisi: avvisi()
  };
}
const SERVER = location.protocol.startsWith("http") && location.hostname==="127.0.0.1";
async function apiPost(url, obj){ const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(obj)}); return r.json(); }
if(SERVER){ setInterval(()=>fetch("/api/ping").catch(()=>{}), 20000); }
$("copy").onclick = async () => {
  const p = payload(); if(!p.righe.length){ toast("Nessun codice da copiare"); return; }
  const txt = p.righe.map(r => (r.interno||r.fornitore)+"\t"+r.qta+"\t"+r.descrizione).join("\r\n");
  try{
    if(window.pywebview && window.pywebview.api) await window.pywebview.api.copia(txt);
    else if(SERVER) await apiPost("/api/copia",{testo:txt});
    else await navigator.clipboard.writeText(txt);
    toast("Codici copiati: "+p.righe.length+" righe");
  }catch(err){ toast("Copia non riuscita"); }
};
$("print").onclick = async () => {
  if(S.tipo === "ricambi" || STEPS.slice(0, -1).some((st, k) => !stepOk(k))){ toast("Completa la configurazione prima di stampare"); return; }
  const p = payload();
  if(window.pywebview && window.pywebview.api){
    const r = await window.pywebview.api.stampa_pdf(p);
    toast(r && r.ok ? "PDF salvato in "+r.nome : "Errore nella stampa: "+(r&&r.errore||""));
  } else if(SERVER){
    const r = await apiPost("/api/stampa", p);
    toast(r && r.ok ? "PDF salvato in "+r.nome : "Errore nella stampa: "+(r&&r.errore||""));
  } else { window.print(); }
};
render();
