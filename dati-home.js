/* ===== Progetto Sicurezza AF — riquadro dei dati sulla pagina iniziale ===== */
"use strict";
(function(){
const box = document.getElementById("dati");
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

const ITA = d => {
  if(!d) return "";
  const x = new Date(d);
  return isNaN(x) ? d : x.toLocaleDateString("it-IT", {day:"2-digit", month:"2-digit", year:"numeric"});
};

let confermaTogli = false;

function leggiSerrature(){
  try{ return JSON.parse(localStorage.getItem("af_serrature_ferro") || "[]"); }catch(e){ return []; }
}

function disegna(){
  const d = window.AF.leggi();
  const sf = leggiSerrature();
  const serve = new URLSearchParams(location.search).has("serve");

  if(d){
    const nc = (d.cilindri || []).length;
    const nm = Object.keys(d.catalogo || {}).length;
    box.innerHTML =
      '<div class="dcard ok">' +
        '<div class="dtop"><span class="dpall">✓</span><div>' +
          '<b>Dati caricati su questo telefono</b>' +
          '<p>' + nc + ' cilindri · ' + nm + ' articoli maniglioni' +
          (sf.length ? ' · ' + sf.length + ' serrature da ferro' : '') +
          (d.importato ? ' · importati il ' + esc(ITA(d.importato)) : '') +
          (d.data ? ' · aggiornamento gestionale ' + esc(d.data) : '') + '</p>' +
        '</div></div>' +
        '<div class="dbtn">' +
          '<label class="dbt p">Aggiorna i dati<input type="file" id="dfile" accept=".json,application/json" hidden></label>' +
          '<label class="dbt s">Serrature da ferro<input type="file" id="sfile" accept=".json,application/json" hidden></label>' +
          '<button class="dbt s" id="dtogli">' + (confermaTogli ? "Tocca di nuovo per togliere" : "Togli da questo telefono") + '</button>' +
        '</div>' +
      '</div>';
  } else {
    box.innerHTML =
      '<div class="dcard no">' +
        (serve ? '<div class="dserve">Per usare i moduli devi prima importare i dati.</div>' : '') +
        '<div class="dtop"><span class="dpall no">!</span><div>' +
          '<b>Nessun dato su questo telefono</b>' +
          '<p>L\'app è vuota: i codici non stanno qui dentro. Apri il Drive, prendi il file ' +
          '<b>dati-progetto-sicurezza.json</b> e importalo. Resta solo su questo telefono e vale anche senza connessione.</p>' +
        '</div></div>' +
        '<div class="dbtn">' +
          '<label class="dbt p">Importa il file<input type="file" id="dfile" accept=".json,application/json" hidden></label>' +
          '<label class="dbt s">Serrature da ferro<input type="file" id="sfile" accept=".json,application/json" hidden></label>' +
        '</div>' +
      '</div>';
  }

  /* senza dati i due moduli restano spenti */
  document.querySelectorAll('.mod[href]').forEach(a => {
    const spento = !d;
    a.classList.toggle("soon", spento);
    a.style.pointerEvents = spento ? "none" : "";
  });

  const f = document.getElementById("dfile");
  if(f) f.addEventListener("change", leggiFile);

  const s = document.getElementById("sfile");
  if(s) s.addEventListener("change", leggiSerratureFile);

  const t = document.getElementById("dtogli");
  if(t) t.addEventListener("click", () => {
    if(!confermaTogli){ confermaTogli = true; disegna(); setTimeout(() => { confermaTogli = false; disegna(); }, 5000); return; }
    window.AF.togli();
    confermaTogli = false;
    disegna();
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
    /* ricarica così i moduli trovano i dati nuovi */
    avviso("Dati importati: " + d.cilindri.length + " cilindri.", true);
    setTimeout(() => location.replace("index.html"), 900);
  };
  r.readAsText(file);
}

function leggiSerratureFile(e){
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if(!file) return;
  const r = new FileReader();
  r.onerror = () => avviso("Non sono riuscito a leggere il file.");
  r.onload = () => {
    let d;
    try{ d = JSON.parse(r.result); }
    catch(err){ avviso("Questo non è il file delle serrature: non si riesce a leggerlo."); return; }
    if(!Array.isArray(d) || !d.length){ avviso("Il file delle serrature non contiene articoli."); return; }
    const pulito = d.filter(x => x && x.codice && x.descrizione);
    if(!pulito.length){ avviso("Nel file non ci sono codici validi."); return; }
    try{ localStorage.setItem("af_serrature_ferro", JSON.stringify(pulito)); }
    catch(err){ avviso("Memoria del telefono piena: non sono riuscito a salvare."); return; }
    avviso("Serrature da ferro importate: " + pulito.length + " codici.", true);
    disegna();
  };
  r.readAsText(file);
}

disegna();
})();