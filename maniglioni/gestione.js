"use strict";
/* ============================================================
   GESTIONE CODICI (parte nascosta)
   Si apre con 5 clic veloci sul logo AF oppure Ctrl+Maiusc+G.
   Le modifiche NON sono dentro l'EXE: si salvano nella cartella
   "Dati configuratore" accanto al programma (modifiche.json + immagini)
   e vengono applicate a ogni avvio.

   modifiche.json = {
     articoli:     { codFornitore: {interno, desc, marca, fin, img, aggiunto} },  // nuovi o modificati
     eliminati:    [ codFornitore, ... ],
     sostituzioni: { vecchio: nuovo }   // il configuratore usa "nuovo" al posto di "vecchio"
   }
   ============================================================ */
const G_ORIG_CAT = JSON.parse(JSON.stringify(CAT));
const G_ORIG_REG = JSON.parse(JSON.stringify(REG));
let G_REG_TXT = JSON.stringify(G_ORIG_REG);
let MOD = {articoli:{}, eliminati:[], sostituzioni:{}};
let G_CARTELLA = "";

function gClone(o){ return JSON.parse(JSON.stringify(o)); }
function gNorm(m){ m = m || {}; return {articoli: m.articoli || {}, eliminati: m.eliminati || [], sostituzioni: m.sostituzioni || {}}; }
function gFinale(c){ let n = 0; while(MOD.sostituzioni[c] && n++ < 20) c = MOD.sostituzioni[c]; return c; }
function gUsato(c){ return G_REG_TXT.includes('"'+c+'"'); }

/* ---------- applica le modifiche a CAT e REG ---------- */
function applicaModifiche(){
  for(const k of Object.keys(CAT)) delete CAT[k];
  Object.assign(CAT, gClone(G_ORIG_CAT));
  for(const k of Object.keys(REG)) delete REG[k];
  Object.assign(REG, gClone(G_ORIG_REG));
  // sostituzioni: nelle regole e nel catalogo
  const sost = MOD.sostituzioni;
  if(Object.keys(sost).length){
    const walk = o => {
      if(Array.isArray(o)){ for(let i = 0; i < o.length; i++){ if(typeof o[i] === "string" && sost[o[i]]) o[i] = gFinale(o[i]); else if(o[i] && typeof o[i] === "object") walk(o[i]); } }
      else for(const k in o){ const v = o[k]; if(typeof v === "string" && sost[v]) o[k] = gFinale(v); else if(v && typeof v === "object") walk(v); }
    };
    walk(REG);
    for(const v of Object.keys(sost)){ const n = gFinale(v); if(CAT[v] && !CAT[n]) CAT[n] = CAT[v]; delete CAT[v]; }
  }
  for(const k of MOD.eliminati) delete CAT[k];
  for(const [k, e] of Object.entries(MOD.articoli)){
    if(MOD.eliminati.includes(k)) continue;
    const a = CAT[k] || {marca:"", desc:"", interni:[], giac:null, fin:""};
    if(e.desc != null) a.desc = e.desc;
    if(e.marca != null) a.marca = e.marca;
    if(e.fin != null) a.fin = e.fin;
    const int = (e.interno || "").trim();
    if(int){
      if(!a.interni.length) a.interni = [{cod:int, giac:null, stato:""}];
      else if(a.interni[0].cod !== int) a.interni = [{cod:int, giac:a.interni[0].giac, stato:""}].concat(a.interni.slice(1).filter(x => x.cod !== int));
    }
    if(!a.interni.length) a.interni = [{cod:k, giac:null, stato:""}];
    if(e.aggiunto) a.aggiunto = true;
    a.modificato = true;
    CAT[k] = a;
  }
  G_REG_TXT = JSON.stringify(REG);
}

/* ---------- lettura / salvataggio ---------- */
const G_LS = "af_modifiche_codici";
function gAttendiApi(ms){
  return new Promise(res => {
    if(window.pywebview && window.pywebview.api && window.pywebview.api.leggi_modifiche) return res(true);
    if(!window.pywebview && location.protocol.startsWith("http") && location.hostname !== "127.0.0.1") return res(false);
    let fatto = false;
    window.addEventListener("pywebviewready", () => { if(!fatto){ fatto = true; res(true); } });
    setTimeout(() => { if(!fatto){ fatto = true; res(!!(window.pywebview && window.pywebview.api && window.pywebview.api.leggi_modifiche)); } }, ms);
  });
}
async function gLeggi(){
  if(SERVER){ const r = await fetch("/api/modifiche"); return r.json(); }
  if(await gAttendiApi(4000)) return window.pywebview.api.leggi_modifiche();
  try{ const t = localStorage.getItem(G_LS); const d = t ? JSON.parse(t) : {}; return {ok:true, modifiche:d.modifiche || {}, immagini:d.immagini || {}, cartella:"(memoria del browser)"}; }
  catch(e){ return {ok:false, errore:"nessun posto dove salvare"}; }
}
async function gScrivi(cambiImg){
  const dati = {modifiche: MOD, immagini: cambiImg || {}};
  if(SERVER) return apiPost("/api/salva_modifiche", dati);
  if(window.pywebview && window.pywebview.api && window.pywebview.api.salva_modifiche) return window.pywebview.api.salva_modifiche(dati);
  try{
    const im = {}; for(const k of Object.keys(MOD.articoli)) if(MOD.articoli[k].img && IMG[k]) im[k] = IMG[k];
    localStorage.setItem(G_LS, JSON.stringify({modifiche: MOD, immagini: im})); return {ok:true};
  }catch(e){ return {ok:false, errore:String(e)}; }
}
async function gSalva(cambiImg, msg){
  const r = await gScrivi(cambiImg);
  if(!r || !r.ok){ toast("Salvataggio non riuscito: "+((r && r.errore) || "")); return false; }
  applicaModifiche(); sistema(); render(); gLista(); toast(msg || "Salvato");
  return true;
}
(async () => {
  try{
    const r = await gLeggi();
    if(!r || !r.ok){ if(r && r.errore) console.warn(r.errore); return; }
    MOD = gNorm(r.modifiche); G_CARTELLA = r.cartella || "";
    Object.assign(IMG, r.immagini || {});
    applicaModifiche(); sistema(); render();
  }catch(e){ console.warn("Modifiche codici non lette", e); }
})();

/* ---------- immagine: ridotta a max 600 px, JPEG ---------- */
function gRiduci(file){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = rej;
    fr.onload = () => {
      const im = new Image();
      im.onerror = rej;
      im.onload = () => {
        const k = Math.min(1, 600 / Math.max(im.width, im.height));
        const c = document.createElement("canvas"); c.width = Math.round(im.width*k); c.height = Math.round(im.height*k);
        const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.85));
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* ---------- interfaccia ---------- */
let G_SEL = null, G_NUOVO = false, G_IMG_TMP = undefined, G_CONF = null;
function gApri(){
  if(!$("gest")){
    document.body.insertAdjacentHTML("beforeend",
      '<div class="gest" id="gest"><div class="gbox">'+
      '<div class="ghead"><div><b>Gestione codici</b><span id="gcart"></span></div>'+
      '<input class="search gsearch" id="gq" placeholder="Cerca codice o descrizione" autocomplete="off">'+
      '<button class="btn p" id="gnew">+ Nuovo codice</button><button class="btn s" id="gclose">Chiudi</button></div>'+
      '<div class="gbody"><div class="glist" id="glist"></div><div class="gform" id="gform"></div></div></div></div>');
    $("gclose").onclick = gChiudi;
    $("gnew").onclick = () => { G_SEL = null; G_NUOVO = true; G_IMG_TMP = undefined; G_CONF = null; gForm(); };
    $("gq").addEventListener("input", gLista);
  }
  $("gest").style.display = "flex";
  $("gcart").textContent = G_CARTELLA ? "Salvati in: "+G_CARTELLA : "";
  gLista();
  if(!G_SEL && !G_NUOVO) $("gform").innerHTML = '<div class="gempty">Scegli un codice dall\'elenco per modificarlo,<br>oppure crea un <b>nuovo codice</b>.</div>';
}
function gChiudi(){ if($("gest")) $("gest").style.display = "none"; G_SEL = null; G_NUOVO = false; }

function gStato(k){
  if(MOD.eliminati.includes(k)) return '<span class="pill r">eliminato</span>';
  const e = MOD.articoli[k];
  if(e && e.aggiunto) return '<span class="pill g">nuovo</span>';
  if(e) return '<span class="pill b">modificato</span>';
  return '';
}
function gLista(){
  if(!$("glist")) return;
  const q = ($("gq").value || "").trim().toUpperCase();
  let h = "";
  const sost = Object.entries(MOD.sostituzioni);
  if(sost.length && !q){
    h += '<div class="gsec">SOSTITUZIONI</div>';
    for(const [v, n] of sost) h += '<div class="grow"><div class="gt"><b>'+esc(v)+' → '+esc(n)+'</b><span>il configuratore usa '+esc(n)+' al posto di '+esc(v)+'</span></div><button class="btn s gsm" data-gsostdel="'+esc(v)+'">Annulla</button></div>';
  }
  const elim = MOD.eliminati;
  if(elim.length && !q){
    h += '<div class="gsec">ELIMINATI</div>';
    for(const k of elim){ const a = G_ORIG_CAT[k] || MOD.articoli[k] || {}; h += '<div class="grow"><div class="gt"><b>'+esc(k)+'</b><span>'+esc(a.desc||"")+'</span></div><button class="btn s gsm" data-grip="'+esc(k)+'">Ripristina</button></div>'; }
  }
  h += '<div class="gsec">CODICI ('+Object.keys(CAT).length+')</div>';
  let n = 0;
  const voci = Object.entries(CAT).sort((x, y) => (y[1].aggiunto?1:0)-(x[1].aggiunto?1:0) || (y[1].modificato?1:0)-(x[1].modificato?1:0) || x[1].marca.localeCompare(y[1].marca) || x[1].desc.localeCompare(y[1].desc));
  for(const [k, a] of voci){
    const hay = (k+" "+a.interni.map(i => i.cod).join(" ")+" "+a.desc+" "+a.marca).toUpperCase();
    if(q && !hay.includes(q)) continue;
    if(++n > 300) break;
    h += '<div class="grow'+(G_SEL===k?" sel":"")+'" data-gsel="'+esc(k)+'">'+(IMG[k] ? '<img class="th" src="'+IMG[k]+'">' : '<div class="th gno">—</div>')+
      '<div class="gt"><b>'+esc(a.interni[0].cod)+'</b><span>'+esc(a.desc)+'</span><span class="gsub">'+esc(a.marca)+(a.interni[0].cod!==k?' · fornitore '+esc(k):'')+(gUsato(k)?' · usato dal configuratore':'')+'</span></div>'+gStato(k)+'</div>';
  }
  if(!n) h += '<div class="gempty">Nessun codice trovato</div>';
  $("glist").innerHTML = h;
}
function gVal(id){ const n = $(id); return n ? n.value.trim() : ""; }
function gForm(){
  const k = G_SEL, a = k ? CAT[k] : null, nuovo = G_NUOVO;
  const img = G_IMG_TMP !== undefined ? G_IMG_TMP : (k ? IMG[k] : null);
  const marche = ["CISA", "ISEO", "ANTIPANIC"];
  const mk = a ? a.marca : "CISA";
  let h = '<h2>'+(nuovo ? "Nuovo codice" : "Modifica codice")+'</h2>';
  if(!nuovo) h += '<div class="gnote">Codice fornitore <b class="mono">'+esc(k)+'</b>'+(gUsato(k) ? ' · <span style="color:#1d7a3a">usato dal configuratore</span>' : ' · non usato dal configuratore (si trova con la ricerca)')+'</div>';
  h += '<div class="gimg">'+(img ? '<img src="'+img+'">' : '<span>Nessuna immagine</span>')+'</div>'+
       '<div class="gbtns"><label class="btn s">Scegli immagine…<input type="file" id="gfile" accept="image/*" hidden></label>'+(img ? '<button class="btn s" id="gimgdel">Togli immagine</button>' : '')+'</div>';
  h += '<label class="glab">Codice interno (gestionale)</label><input class="txtin" id="gint" value="'+esc(a ? a.interni[0].cod : "")+'" placeholder="es. CISA59616000">';
  if(nuovo) h += '<label class="glab">Codice fornitore <small>(se vuoto = codice interno)</small></label><input class="txtin" id="gforn" placeholder="es. 159616000">';
  h += '<label class="glab">Descrizione</label><input class="txtin" id="gdesc" value="'+esc(a ? a.desc : "")+'">';
  h += '<div class="g2"><div><label class="glab">Marca</label><select class="txtin" id="gmarca">'+
       marche.concat(marche.includes(mk) || !mk ? [] : [mk]).map(m => '<option'+(m===mk?" selected":"")+'>'+esc(m)+'</option>').join("")+'<option value="">altra</option></select></div>'+
       '<div><label class="glab">Finitura</label><input class="txtin" id="gfin" value="'+esc(a ? (a.fin||"") : "")+'" placeholder="Nero, Grigio…"></div></div>';
  if(nuovo) h += '<div class="gnote">Un codice nuovo si trova con la ricerca e compare nella pagina <b>Ricambi e adattatori</b>. Per farlo usare dal configuratore al posto di un codice esistente, apri quel codice e usa <b>Sostituisci</b>.</div>';
  h += '<div class="gbtns" style="margin-top:16px"><button class="btn p" id="gsave">Salva</button><button class="btn s" id="gcanc">Annulla</button></div>';
  if(!nuovo){
    h += '<div class="gbox2"><b>Sostituisci con un altro codice</b><p>Il configuratore userà il nuovo codice al posto di <span class="mono">'+esc(k)+'</span> in tutte le configurazioni. Se il nuovo codice non esiste, viene creato con questi dati.</p>'+
         '<div class="gbtns"><input class="txtin" id="gsost" placeholder="nuovo codice fornitore" style="flex:1"><button class="btn s" id="gsostok">Sostituisci</button></div></div>';
    h += '<div class="gbtns" style="margin-top:14px">'+(MOD.articoli[k] && !MOD.articoli[k].aggiunto ? '<button class="btn s" id="gorig">Torna all\'originale</button>' : '')+
         '<button class="btn s gdanger" id="gdel">'+(G_CONF === "del:"+k ? "Tocca di nuovo per eliminare" : "Elimina codice")+'</button></div>';
    if(gUsato(k)) h += '<div class="gnote">Attenzione: se lo elimini, dove il configuratore lo usa comparirà "da ordinare". Meglio <b>Sostituisci</b>.</div>';
  }
  $("gform").innerHTML = h;
  $("gfile").onchange = async e => { const f = e.target.files[0]; if(!f) return; try{ G_IMG_TMP = await gRiduci(f); gTieni(); gForm(); }catch(err){ toast("Immagine non leggibile"); } };
  if($("gimgdel")) $("gimgdel").onclick = () => { gTieni(); G_IMG_TMP = null; gForm(); };
  $("gcanc").onclick = () => { G_IMG_TMP = undefined; G_CONF = null; G_NUOVO = false; G_SEL = null; gApri(); gLista(); };
  $("gsave").onclick = gSalvaForm;
  if(!nuovo){
    $("gsostok").onclick = gSostituisci;
    $("gdel").onclick = gElimina;
    if($("gorig")) $("gorig").onclick = async () => { delete MOD.articoli[k]; G_IMG_TMP = undefined; const ci = {}; if(IMG[k]){ ci[k] = null; delete IMG[k]; } await gSalva(ci, "Codice riportato all'originale"); gForm(); };
  }
}
/* conserva i valori scritti quando la scheda si ridisegna (es. dopo la scelta immagine) */
let G_BOZZA = null;
function gTieni(){ G_BOZZA = {int:gVal("gint"), forn:gVal("gforn"), desc:gVal("gdesc"), marca:$("gmarca") ? $("gmarca").value : "", fin:gVal("gfin")}; }
const _gForm = gForm;
gForm = function(){
  _gForm();
  if(G_BOZZA){ const b = G_BOZZA; G_BOZZA = null;
    $("gint").value = b.int; if($("gforn")) $("gforn").value = b.forn; $("gdesc").value = b.desc; $("gfin").value = b.fin;
    if(b.marca && [...$("gmarca").options].some(o => o.value === b.marca)) $("gmarca").value = b.marca; }
};

async function gSalvaForm(){
  const int = gVal("gint").toUpperCase(), desc = gVal("gdesc"), marca = $("gmarca").value, fin = gVal("gfin");
  if(!int){ toast("Scrivi il codice interno"); return; }
  if(!desc){ toast("Scrivi la descrizione"); return; }
  let k = G_SEL;
  if(G_NUOVO){
    k = (gVal("gforn") || int).toUpperCase();
    if(CAT[k] || G_ORIG_CAT[k] && !MOD.eliminati.includes(k)){ toast("Il codice "+k+" esiste già: cercalo nell'elenco e modificalo"); return; }
    MOD.eliminati = MOD.eliminati.filter(x => x !== k);
  }
  const doppio = Object.entries(CAT).find(([c, a]) => c !== k && a.interni.some(i => i.cod === int));
  if(doppio){ toast("Il codice interno "+int+" è già usato da "+doppio[0]); return; }
  const prima = MOD.articoli[k] || {};
  const e = {interno:int, desc, marca, fin};
  if(G_NUOVO || prima.aggiunto) e.aggiunto = true;
  if(prima.dasost) e.dasost = prima.dasost;
  const ci = {};
  if(G_IMG_TMP !== undefined){ if(G_IMG_TMP){ IMG[k] = G_IMG_TMP; ci[k] = G_IMG_TMP; e.img = true; } else { delete IMG[k]; ci[k] = null; } }
  else if(IMG[k]) e.img = true;
  MOD.articoli[k] = e;
  G_IMG_TMP = undefined; G_NUOVO = false; G_SEL = k; G_CONF = null;
  if(await gSalva(ci, "Codice salvato")) gForm();
}
async function gSostituisci(){
  const v = G_SEL, n = gVal("gsost").toUpperCase();
  if(!n){ toast("Scrivi il nuovo codice fornitore"); return; }
  if(n === v){ toast("È lo stesso codice"); return; }
  if(gFinale(n) === v){ toast("Sostituzione circolare non ammessa"); return; }
  if(!CAT[n]){
    const a = CAT[v];
    MOD.articoli[n] = {interno: n, desc: a.desc, marca: a.marca, fin: a.fin || "", dasost: v};
    if(IMG[v]){ IMG[n] = IMG[v]; MOD.articoli[n].img = true; }
  }
  MOD.sostituzioni[v] = n;
  MOD.eliminati = MOD.eliminati.filter(x => x !== n);
  const ci = {}; if(MOD.articoli[n] && MOD.articoli[n].img && IMG[n]) ci[n] = IMG[n];
  G_SEL = n; G_CONF = null;
  if(await gSalva(ci, v+" sostituito da "+n)) gForm();
}
async function gElimina(){
  const k = G_SEL;
  if(G_CONF !== "del:"+k){ G_CONF = "del:"+k; gForm(); return; }
  G_CONF = null;
  const ci = {};
  if(MOD.articoli[k] && !G_ORIG_CAT[k]){ delete MOD.articoli[k]; }
  else if(!MOD.eliminati.includes(k)) MOD.eliminati.push(k);
  if(IMG[k] && !MOD.articoli[k]){ delete IMG[k]; ci[k] = null; }
  for(const [v, n] of Object.entries(MOD.sostituzioni)) if(n === k) delete MOD.sostituzioni[v];
  G_SEL = null;
  if(await gSalva(ci, "Codice "+k+" eliminato")) gApri();
}
document.addEventListener("click", async e => {
  const g = $("gest"); if(!g || g.style.display === "none") return;
  const s = e.target.closest("[data-gsel]"); if(s){ G_SEL = s.getAttribute("data-gsel"); G_NUOVO = false; G_IMG_TMP = undefined; G_CONF = null; gLista(); gForm(); return; }
  const r = e.target.closest("[data-grip]"); if(r){ const k = r.getAttribute("data-grip"); MOD.eliminati = MOD.eliminati.filter(x => x !== k); await gSalva({}, "Codice "+k+" ripristinato"); return; }
  const d = e.target.closest("[data-gsostdel]"); if(d){ const v = d.getAttribute("data-gsostdel"), n = MOD.sostituzioni[v]; delete MOD.sostituzioni[v];
    const ci = {}; if(n && MOD.articoli[n] && MOD.articoli[n].dasost === v && !G_ORIG_CAT[n]){ delete MOD.articoli[n]; if(IMG[n]){ delete IMG[n]; ci[n] = null; } if(G_SEL === n) G_SEL = null; } await gSalva(ci, "Sostituzione annullata: torna "+v); if(!G_SEL) gApri(); return; }
});

/* ---------- apertura nascosta ---------- */
let G_CLIC = [];
document.querySelector(".logo").addEventListener("click", () => {
  const t = Date.now(); G_CLIC = G_CLIC.filter(x => t - x < 2500); G_CLIC.push(t);
  if(G_CLIC.length >= 5){ G_CLIC = []; gApri(); }
});
document.addEventListener("keydown", e => {
  if(e.ctrlKey && e.shiftKey && (e.key === "G" || e.key === "g")){ e.preventDefault(); gApri(); }
  if(e.key === "Escape" && $("gest") && $("gest").style.display !== "none") gChiudi();
});
