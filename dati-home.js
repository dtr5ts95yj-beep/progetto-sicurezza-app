/* ===== Progetto Sicurezza AF — pannello Opzioni della pagina iniziale ===== */
"use strict";
(function(){
const $ = id => document.getElementById(id);
const box = $("dati");
if(!box) return;

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function avviso(t, ok){
  const d = document.createElement("div");
  d.className = "af-toast" + (ok ? " ok" : "");
  d.textContent = t;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 4200);
}
const ITA = s => {
  if(!s) return "";
  const x = new Date(s);
  return isNaN(x) ? s : x.toLocaleDateString("it-IT", {day:"2-digit", month:"2-digit", year:"numeric"});
};

/* ---------- apertura e chiusura del pannello ---------- */
const pan = $("opzpan"), fondo = $("opzfondo");
function apri(){ if(pan){ pan.hidden = false; fondo.hidden = false; } }
function chiudi(){ if(pan){ pan.hidden = true; fondo.hidden = true; } }
if($("apriopz")) $("apriopz").addEventListener("click", apri);
if($("chiudiopz")) $("chiudiopz").addEventListener("click", chiudi);
if(fondo) fondo.addEventListener("click", chiudi);
if($("manca")) $("manca").addEventListener("click", apri);
document.addEventListener("keydown", e => { if(e.key === "Escape") chiudi(); });

let confermaTogli = false;

function disegna(){
  const d = window.AF.leggi();
  const serve = new URLSearchParams(location.search).has("serve");

  if(d){
    const c = window.AF.conta(d);
    const righe = [
      ["Cilindri", c.cilindri || 0],
      ["Serrature", c.serrature || 0],
      ["Accessori", c.accessori || 0],
      ["Antipanico", c.maniglioni || 0]
    ].filter(r => r[1]);
    box.innerHTML =
      '<div class="dcard ok">' +
        '<div class="dtop"><span class="dpall">✓</span><div>' +
          '<b>Dati caricati su questo telefono</b>' +
          '<p>' + righe.map(r => r[1] + " " + r[0].toLowerCase()).join(" · ") +
          (d.importato ? '<br>importati il ' + esc(ITA(d.importato)) : '') +
          (d.generato ? ' · estrazione del ' + esc(ITA(d.generato)) : '') + '</p>' +
        '</div></div>' +
        '<div class="dbtn">' +
          '<label class="dbt p">Aggiorna i dati<input type="file" id="dfile" accept=".json,application/json,*/*" hidden></label>' +
          '<button class="dbt s" id="dtogli" type="button">' +
            (confermaTogli ? "Tocca di nuovo per togliere" : "Togli da questo telefono") + '</button>' +
        '</div>' +
      '</div>';
  } else {
    box.innerHTML =
      '<div class="dcard no">' +
        (serve ? '<div class="dserve">Per usare i configuratori devi prima importare i dati.</div>' : '') +
        '<div class="dtop"><span class="dpall no">!</span><div>' +
          '<b>Nessun dato su questo telefono</b>' +
          '<p>L\'app è vuota: i codici non stanno qui dentro. Apri il Drive, prendi il file ' +
          '<b>progetto-sicurezza-dati.json</b> e importalo. Resta solo su questo telefono ' +
          'e vale anche senza connessione.</p>' +
        '</div></div>' +
        '<div class="dbtn">' +
          '<label class="dbt p">Importa il file<input type="file" id="dfile" accept=".json,application/json,*/*" hidden></label>' +
        '</div>' +
      '</div>';
  }

  /* senza dati i configuratori restano spenti */
  document.querySelectorAll('.mod[href]').forEach(a => {
    a.classList.toggle("sono", false);
    a.classList.toggle("soon", !d);
    a.style.pointerEvents = d ? "" : "none";
  });
  const m = $("manca");
  if(m) m.hidden = !!d;

  const f = $("dfile");
  if(f) f.addEventListener("change", leggiFile);

  const t = $("dtogli");
  if(t) t.addEventListener("click", () => {
    if(!confermaTogli){
      confermaTogli = true; disegna();
      setTimeout(() => { confermaTogli = false; disegna(); }, 5000);
      return;
    }
    window.AF.togli(); confermaTogli = false; disegna();
    avviso("Dati tolti da questo telefono.");
  });
}

function leggiFile(e){
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if(!file) return;
  const r = new FileReader();
  r.onerror = () => avviso("Non sono riuscito a leggere il file.");
  r.onload = () => {
    let d;
    try{ d = JSON.parse(r.result); }
    catch(err){ avviso("Questo non è il file dei dati: non si riesce a leggerlo."); return; }
    const male = window.AF.verifica(d);
    if(male){ avviso(male); return; }
    d.importato = new Date().toISOString();
    try{ window.AF.salva(d); }
    catch(err){ avviso("Memoria del telefono piena: non sono riuscito a salvare."); return; }
    avviso("Dati importati: " + d.articoli.length + " articoli.", true);
    setTimeout(() => location.replace("index.html"), 900);
  };
  r.readAsText(file);
}

/* se mancano i dati e arrivo da un modulo, apro subito il pannello */
if(!window.AF.leggi() && new URLSearchParams(location.search).has("serve")) apri();

disegna();
})();
