/* ===== Serrature — domande adattive =====
   A ogni passo il programma sceglie la domanda che divide meglio quello che resta,
   mostra solo le risposte presenti in magazzino con il numero di articoli,
   e si ferma appena i pezzi rimasti sono pochi. */
"use strict";

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const BASTA = 12;          // sotto questo numero si va dritti ai risultati

/* ---------- gli articoli ---------- */
const SOLO = window.AF_SOLO || "";
function tutti(){
  const t = window.SERRATURE || [];
  return SOLO ? t.filter(x => x.impiego === SOLO) : t.filter(x => x.impiego !== "lucchetti");
}

function famiglia(x){
  if(x.fam === "accessori") return "accessori";
  if(x.impiego === "lucchetti") return "lucchetti";
  if(x.impiego === "catenacci") return "catenacci";
  if(x.impiego === "elettriche") return "elettriche";
  return "serrature";
}

/* ---------- le domande possibili ---------- */
const DOMANDE = [
  { id:"tipo", peso:1, q:"Da applicare o da infilare?", val: x => x.tipo,
    nomi:{infilare:"Da infilare", applicare:"Da applicare"} },
  { id:"punti", peso:.96, q:"Quanti punti di chiusura?", val: x => (x.punti ? String(x.punti) : ""),
    nomi:{"1":"1 punto", "2":"2 punti", "3":"3 punti", "4":"4 punti", "5":"5 punti"} },
  { id:"impiego", peso:.95, q:"Dove va montata?", val: x => (x.impiego === "altro" ? "" : x.impiego),
    nomi:{fascia:"A fascia o basculante", montanti:"Da montante", legno:"Porta in legno",
          interne:"Porta interna", blindate:"Porta blindata o alluminio", serrande:"Serranda o persiana",
          cancelli:"Cancello o inferriata", tagliafuoco:"Porta tagliafuoco", scuretti:"Scuri",
          casseforti:"Cassaforte", lucchetti:"Lucchetto", catenacci:"Catenaccio o paletto",
          elettriche:"Elettroserratura o incontro"} },
  { id:"entrata", peso:.9, q:"Che entrata?",   val: x => x.entrata,   mis:"mm", disegno:true },
  { id:"interasse", peso:.8, q:"Che interasse?", val: x => x.interasse, mis:"mm", disegno:true },
  { id:"lung", peso:.9, q:"Che lunghezza?", val: x => (x.lung ? String(x.lung) : ""), mis:"mm" },
  { id:"forma", peso:.7, q:"Che foro per la chiave?", val: x => x.forma,
    nomi:{europeo:"Cilindro europeo (sagomato)", ovale:"Ovale", tondo:"Tondo",
          patent:"Patent", pompa:"A pompa"} },
  { id:"mandate", peso:.6, q:"Quante mandate?", val: x => x.mandate,
    nomi:{"1":"1 mandata","2":"2 mandate","3":"3 mandate","4":"4 mandate","5":"5 mandate","6":"6 mandate"} },
  { id:"lato", peso:.5, q:"Che mano?", val: x => x.lato,
    nomi:{dx:"Destra", sx:"Sinistra", rev:"Reversibile"} },
  { id:"marca", peso:.3, q:"Di che marca?", val: x => x.marca }
];
const DOM = {}; DOMANDE.forEach(d => DOM[d.id] = d);

/* ---------- stato ---------- */
const S = { risposte: {}, vedi: false, scelti: [] };

function vuoto(v){ return v === undefined || v === null || v === "" || v === "ns"; }

/* gli articoli che restano: chi non ha il dato non viene mai buttato via */
const SALTA = "\u0000salta";
function restano(salta){
  return tutti().filter(x => {
    for(const id in S.risposte){
      if(id === salta || S.risposte[id] === SALTA) continue;
      const v = DOM[id].val(x);
      if(vuoto(v)) continue;                 // non lo so per quell'articolo: resta
      if(String(v) !== String(S.risposte[id])) return false;
    }
    return true;
  });
}
/* quelli che corrispondono davvero, cioè con il dato scritto */
function certi(lista){
  return lista.filter(x => Object.keys(S.risposte).every(id => {
    if(S.risposte[id] === SALTA) return true;
    const v = DOM[id].val(x);
    return !vuoto(v) && String(v) === String(S.risposte[id]);
  }));
}

/* ---------- scelta della prossima domanda ---------- */
function conteggi(lista, d){
  const m = new Map();
  lista.forEach(x => {
    const v = d.val(x);
    if(vuoto(v)) return;
    const k = String(v);
    m.set(k, (m.get(k) || 0) + 1);
  });
  return m;
}

function punteggio(lista, d){
  const m = conteggi(lista, d);
  if(m.size < 2) return -1;                        // non divide niente
  const noti = [...m.values()].reduce((a, b) => a + b, 0);
  const copertura = noti / lista.length;           // quanti articoli hanno il dato
  if(copertura < 0.25) return -1;                  // troppo pochi: domanda inutile
  let gini = 1;
  m.forEach(n => { const p = n / noti; gini -= p * p; });
  return gini * copertura * (d.peso == null ? 1 : d.peso);   // divide bene, su molti, ed e' una domanda facile
}

const ORDINE = ["tipo", "impiego", "punti"];
function prossima(lista){
  /* prima le domande che si fanno al banco, nell'ordine giusto */
  for(const id of ORDINE){
    if(id in S.risposte) continue;
    const m = conteggi(lista, DOM[id]);
    const noti = [...m.values()].reduce((a, b) => a + b, 0);
    if(m.size >= 2 && noti >= 8) return DOM[id];   // basta che divida qualcosa
  }
  let best = null, bp = 0;
  for(const d of DOMANDE){
    if(d.id in S.risposte) continue;
    const p = punteggio(lista, d);
    if(p > bp){ bp = p; best = d; }
  }
  return best;
}

/* ---------- disegno della serratura (solo per le misure) ---------- */
function quota(x1,y1,x2,y2,t,on){
  const c = on ? "#ff9500" : "#c7c7cc", tc = on ? "#b36b00" : "#8e8e93", o = y1 === y2;
  const mx = (x1+x2)/2, my = (y1+y2)/2;
  const cap = (x,y) => `<line x1="${o?x:x-5}" y1="${o?y-5:y}" x2="${o?x:x+5}" y2="${o?y+5:y}" stroke="${c}" stroke-width="1.3"/>`;
  return `<g><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${on?2:1.3}"/>`
    + cap(x1,y1) + cap(x2,y2)
    + `<text x="${o?mx:mx+8}" y="${o?my-7:my}" fill="${tc}" font-size="13" font-weight="700"`
    + ` text-anchor="${o?"middle":"start"}" dominant-baseline="${o?"auto":"middle"}">${esc(t)}</text></g>`;
}

function disegno(att){
  const d = $("draw"); if(!d) return;
  const FX=70, FW=16, BX=86, BW=170, BY=95, BH=150, CY=200, QY=140, CX=181;
  const mE = S.risposte.entrata   ? S.risposte.entrata + " mm"   : "entrata";
  const mI = S.risposte.interasse ? S.risposte.interasse + " mm" : "interasse";
  d.innerHTML =
    `<rect x="${FX-44}" y="60" width="44" height="220" fill="#eceff3" stroke="#d6dae0" stroke-width="1.5"/>`
  + `<rect x="${FX}" y="62" width="${FW}" height="216" rx="2" fill="#cfd4da" stroke="#9aa1a9" stroke-width="1.6"/>`
  + `<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="4" fill="#f7f7f9" stroke="#9aa1a9" stroke-width="1.8"/>`
  + `<rect x="${FX-12}" y="118" width="14" height="22" rx="3" fill="#b9bfc6" stroke="#8d949c" stroke-width="1.3"/>`
  + `<rect x="${FX-16}" y="190" width="18" height="26" rx="2" fill="#b9bfc6" stroke="#8d949c" stroke-width="1.3"/>`
  + `<circle cx="${CX}" cy="${CY}" r="15" fill="#fff" stroke="#6e7780" stroke-width="2"/>`
  + `<path d="M${CX-5} ${CY+10}h10l-3 12h-4z" fill="#6e7780"/>`
  + `<rect x="${CX-10}" y="${QY-10}" width="20" height="20" rx="3" fill="#fff" stroke="#6e7780" stroke-width="2"/>`
  + quota(FX, 300, CX, 300, mE, att === "entrata")
  + quota(CX+118, QY, CX+118, CY, mI, att === "interasse")
  + `<text x="${FX-22}" y="300" fill="#8e8e93" font-size="11" text-anchor="middle">porta</text>`;
}

/* ---------- le risposte date, nel menu ---------- */
function nav(){
  const n = $("nav"); if(!n) return;
  const date = Object.keys(S.risposte);
  let h = date.map(id => {
    const d = DOM[id], v = S.risposte[id];
    const et = (d.nomi && d.nomi[v]) || (d.mis ? v + " " + d.mis : v);
    return `<div class="step done" data-tolgo="${esc(id)}"><span class="ic">✓</span>`
      + `<span class="nm">${esc(d.q.replace("?",""))}</span><span class="v">${esc(et)}</span></div>`;
  }).join("");
  if(!date.length) h = '<div class="step on"><span class="ic">1</span><span class="nm">Comincia da qui</span></div>';
  else h += '<div class="rh" style="margin:14px 2px 6px">Tocca una risposta per toglierla</div>';
  n.innerHTML = h;
}

/* ---------- risultati ---------- */
function riga(x, esatto){
  const dentro = S.scelti.some(y => y.codice === x.codice);
  const pil = [];
  if(x.marca) pil.push(x.marca);
  if(x.entrata) pil.push("E " + x.entrata);
  if(x.interasse) pil.push("I " + x.interasse);
  if(x.lung) pil.push(x.lung + " mm");
  if(x.mandate && x.mandate !== "ns") pil.push(x.mandate + " mand.");
  return `<article class="res${esatto?"":" forse"}" data-code="${esc(x.codice)}">`
    + `<div class="t"><div class="code">${esc(x.codice)}</div>`
    + `<div class="desc">${esc(x.descrizione)}</div>`
    + `<div class="meta">${pil.map(p => `<span class="pill">${esc(p)}</span>`).join("")}</div></div>`
    + `<button class="addb${dentro?" on":""}" type="button" data-add="${esc(x.codice)}">${dentro?"✓":"+"}</button>`
    + `</article>`;
}

function pagRisultati(){
  const lista = restano();
  const ok = certi(lista);
  /* i "forse" ordinati per quanto davvero corrispondono: prima quelli che hanno piu dati giusti */
  const quanti = x => Object.keys(S.risposte).filter(id => {
    if(S.risposte[id] === SALTA) return false;
    const v = DOM[id].val(x);
    return !vuoto(v) && String(v) === String(S.risposte[id]);
  }).length;
  const forse = lista.filter(x => !ok.includes(x)).sort((x, y) => quanti(y) - quanti(x));
  let h = `<h1>Cosa abbiamo</h1>`;
  if(ok.length) h += `<p class="sub"><b>${ok.length}</b> ${ok.length === 1 ? "corrisponde" : "corrispondono"} a quello che hai detto`
        + (forse.length ? `. Altri ${forse.length} possono andare, ma nel gestionale non hanno tutte le misure scritte` : "") + `.</p>`;
  else if(forse.length) h += `<p class="sub">Nessun articolo ha tutte le caratteristiche scritte nel gestionale. `
        + `Questi <b>${forse.length}</b> possono andare lo stesso: controlla il pezzo in mano.</p>`;
  if(!lista.length) h += `<div class="note">Non c'è niente con queste caratteristiche. Togli una risposta dal menu a sinistra e riprova.</div>`;
  if(ok.length) h += ok.slice(0, 60).map(x => riga(x, true)).join("");
  if(forse.length){
    const mostro = forse.slice(0, 25);
    h += `<div class="rh">DA VERIFICARE · il gestionale non ha tutte le misure`
       + (forse.length > mostro.length ? ` · i ${mostro.length} piu vicini su ${forse.length}` : "") + `</div>`;
    h += mostro.map(x => riga(x, false)).join("");
  }
  if(ok.length > 60) h += `<div class="note">Ne mostro solo una parte: rispondi a un'altra domanda per stringere.</div>`;
  return h;
}

/* ---------- la domanda ---------- */
function pagDomanda(d, lista){
  const m = conteggi(lista, d);
  const voci = [...m.entries()].sort((a, b) => {
    if(d.mis) return Number(a[0]) - Number(b[0]);
    return b[1] - a[1];
  });
  const senza = lista.length - [...m.values()].reduce((a, b) => a + b, 0);
  let h = `<h1>${esc(d.q)}</h1><p class="sub">Restano ${lista.length} articoli. Scegli, oppure salta la domanda.</p>`;
  if(d.mis){
    const comuni = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
      .sort((a, b) => Number(a[0]) - Number(b[0]));
    h += `<div class="mbox"><label>Scrivi la misura in millimetri</label>`
      + `<div class="row"><input id="mis" type="text" inputmode="numeric" autocomplete="off" placeholder="">`
      + `<span>mm</span></div>`
      + `<div class="quick">` + comuni.map(([v, n]) =>
          `<button type="button" data-rispondo="${esc(d.id)}" data-v="${esc(v)}">${esc(v)}<small> ${n}</small></button>`).join("")
      + `</div></div>`;
  } else {
    h += voci.map(([v, n]) => {
      const et = (d.nomi && d.nomi[v]) || v;
      return `<button class="opt" type="button" data-rispondo="${esc(d.id)}" data-v="${esc(v)}">`
        + `<div><b>${esc(et)}</b></div><span class="cnt">${n}</span><span class="radio"></span></button>`;
    }).join("");
  }
  h += `<button class="opt salta" type="button" data-salto="${esc(d.id)}">`
    + `<div><b>Non lo so</b><p>Vai avanti senza rispondere${senza ? ", " + senza + " articoli non hanno questo dato" : ""}.</p></div>`
    + `<span class="radio"></span></button>`;
  return h;
}

/* ---------- lista delle scelte ---------- */
function lista(){
  const l = $("lines"); if(!l) return;
  if(!S.scelti.length){
    l.innerHTML = '<div class="vuoto">Nessuna serratura scelta.<br>Dai risultati, tocca <b>+</b> per aggiungerla.</div>';
  } else {
    l.innerHTML = S.scelti.map(x =>
      `<div class="ln"><b>${esc(x.codice)}</b><span>${esc(x.descrizione)}</span>`
      + `<button class="tog" type="button" data-via="${esc(x.codice)}">×</button></div>`).join("");
  }
  const b = document.querySelector(".m-sel .n");
  if(b){ b.textContent = S.scelti.length; b.classList.toggle("z", !S.scelti.length); }
}

/* ---------- disegna tutto ---------- */
function render(){
  const lista0 = restano();
  const esatti = certi(lista0).length;
  const risposte = Object.keys(S.risposte).length;
  const d = S.vedi ? null : prossima(lista0);
  // basta domande: pochi articoli, oppure le corrispondenze piene stanno sparendo
  const finito = !d || lista0.length <= BASTA || (risposte >= 2 && esatti <= 3);

  $("page").innerHTML = finito ? pagRisultati() : pagDomanda(d, lista0);

  const corpo = document.querySelector(".body");
  const conMis = !finito && d && d.disegno;
  if(corpo) corpo.classList.toggle("m-nohero", !conMis);
  if(conMis) disegno(d.id);
  const cap = $("herocap");
  if(cap) cap.textContent = conMis
    ? (d.id === "entrata" ? "Dal bordo del frontale al centro del foro chiave."
                          : "Dal centro del quadro maniglia al centro del foro chiave.")
    : "";

  $("crumb").innerHTML = (window.AF_TITOLO || "Serrature") + " · <b>" + esc(finito ? "Cosa abbiamo" : d.q.replace("?", "")) + "</b>";
  const n = Object.keys(S.risposte).length;
  $("passo").textContent = finito ? lista0.length + " articoli" : (n ? n + " risposte date" : "");

  const back = $("back"), next = $("next");
  back.style.visibility = (n || S.vedi) ? "visible" : "hidden";
  if(finito){ next.hidden = true; }
  else { next.hidden = false; next.textContent = "Vedi i " + lista0.length + " ›"; }

  nav(); lista();
}

/* ---------- comandi ---------- */
document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if(add){
    e.stopPropagation();
    const c = add.dataset.add, i = S.scelti.findIndex(x => x.codice === c);
    if(i >= 0) S.scelti.splice(i, 1);
    else { const a = tutti().find(x => x.codice === c); if(a) S.scelti.push(a); }
    render(); return;
  }
  const via = e.target.closest("[data-via]");
  if(via){
    const i = S.scelti.findIndex(x => x.codice === via.dataset.via);
    if(i >= 0) S.scelti.splice(i, 1);
    render(); return;
  }
  const r = e.target.closest("[data-rispondo]");
  if(r){ S.risposte[r.dataset.rispondo] = r.dataset.v; S.vedi = false; render(); return; }
  const sa = e.target.closest("[data-salto]");
  if(sa){ S.risposte[sa.dataset.salto] = SALTA; S.vedi = false; render(); return; }
  const t = e.target.closest("[data-tolgo]");
  if(t){ delete S.risposte[t.dataset.tolgo]; S.vedi = false; render(); return; }
  const res = e.target.closest(".res");
  if(res){ scheda(res.dataset.code); return; }
});

function daCasella(){
  const c = $("mis"); if(!c) return false;
  const v = (c.value || "").trim();
  if(!v) return false;
  const d = prossima(restano());
  if(d && d.mis){ S.risposte[d.id] = String(parseInt(v, 10)); S.vedi = false; render(); return true; }
  return false;
}
document.addEventListener("keydown", e => {
  if(e.key === "Enter" && document.activeElement && document.activeElement.id === "mis"){
    e.preventDefault(); daCasella();
  }
});
$("next").addEventListener("click", () => { if(daCasella()) return; S.vedi = true; render(); });
$("back").addEventListener("click", () => {
  if(S.vedi){ S.vedi = false; render(); return; }
  const k = Object.keys(S.risposte);
  if(k.length){ delete S.risposte[k[k.length - 1]]; render(); }
});
$("clear").addEventListener("click", () => { S.scelti.length = 0; render(); });
$("copy").addEventListener("click", () => {
  if(!S.scelti.length) return;
  const t = S.scelti.map(x => x.codice + "  " + x.descrizione).join("\n");
  const ok = () => { const d = document.createElement("div"); d.className = "toast";
    d.textContent = "Codici copiati"; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); };
  if(navigator.clipboard) navigator.clipboard.writeText(t).then(ok).catch(() => {});
});

/* ---------- scheda dell'articolo ---------- */
function scheda(cod){
  const x = tutti().find(y => y.codice === cod); if(!x) return;
  const r = [["Codice interno", x.codice], ["Codice fornitore", x.forn], ["Marca", x.marca],
             ["Entrata", x.entrata && x.entrata + " mm"], ["Interasse", x.interasse && x.interasse + " mm"],
             ["Frontale", x.frontale && x.frontale + " mm"], ["Lunghezza", x.lung && x.lung + " mm"],
             ["Mandate", x.mandate !== "ns" && x.mandate], ["Mano", {dx:"Destra",sx:"Sinistra",rev:"Reversibile"}[x.lato]],
             ["Foro chiave", {europeo:"Europeo",ovale:"Ovale",tondo:"Tondo",patent:"Patent",pompa:"A pompa"}[x.forma]]]
            .filter(y => y[1]);
  $("body").innerHTML = `<h2>${esc(x.codice)}</h2><p class="sub">${esc(x.descrizione)}</p>`
    + `<div class="kv">` + r.map(y => `<div><b>${esc(y[0].toUpperCase())}</b><span>${esc(y[1])}</span></div>`).join("") + `</div>`
    + (x.fonte ? `<div class="note">Misure prese dal ${esc(x.fonte)}: controlla il pezzo prima di ordinare.</div>` : "")
    + `<div class="actions"><button class="btn" type="button" data-add="${esc(x.codice)}">Aggiungi alla lista</button></div>`;
  $("sheet").hidden = false;
}
$("close").addEventListener("click", () => { $("sheet").hidden = true; });
$("sheet").addEventListener("click", e => { if(e.target === $("sheet")) $("sheet").hidden = true; });

render();
