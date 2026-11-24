/* ===== Serrature da ferro — la stessa vista dei maniglioni =====
   Passi nel menu, disegno in alto che si aggiorna, lista delle serrature scelte.
   Non tocca la logica delle domande: si aggancia dopo ogni disegno della pagina. */
"use strict";
(function(){
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const scelti = [];

/* ---------- testo di ogni passo nel menu ---------- */
const VALORE = {
  impiego:{cancelli:"Cancello",serrande:"Serranda",fascia:"Fascia",montanti:"Montante",
           tagliafuoco:"Tagliafuoco",casseforti:"Cassaforte",altro:"Altro"},
  tipo:{infilare:"Da infilare",applicare:"Da applicare",casseforti:"Cassaforte"},
  lato:{dx:"Destra",sx:"Sinistra",rev:"Reversibile"}
};
function valore(id){
  const v = S[id];
  if(v === undefined || v === "ns" || v === "") return "";
  if(VALORE[id] && VALORE[id][v]) return VALORE[id][v];
  if(id === "mandate") return v + (v === "1" ? " mandata" : " mandate");
  if(id === "entrata" || id === "interasse" || id === "frontale") return v + " mm";
  return String(v);
}

/* ---------- menu dei passi ---------- */
function nav(){
  const n = $("nav"); if(!n) return;
  n.innerHTML = STEPS.map((s, i) => {
    const fatto = i < step, ora = i === step;
    const v = s.id === "risultati" ? "" : valore(s.id);
    return '<div class="step' + (ora ? " on" : "") + (fatto ? " done" : "") + '" data-vai="' + i + '">'
      + '<span class="ic">' + (fatto ? "✓" : (i + 1)) + '</span>'
      + '<span class="nm">' + esc(s.nome) + '</span>'
      + (v ? '<span class="v">' + esc(v) + '</span>' : '')
      + '</div>';
  }).join("");
}

/* ---------- briciole e piede ---------- */
function testata(){
  const s = STEPS[step];
  if($("crumb")) $("crumb").innerHTML = 'Serrature da ferro · <b>' + esc(s.nome) + '</b>';
  if($("passo")) $("passo").textContent = "Passo " + (step + 1) + " di " + STEPS.length;
}

/* ---------- disegno tecnico della serratura ---------- */
function quota(x1, y1, x2, y2, testo, acceso){
  const c = acceso ? "#ff9500" : "#c7c7cc";
  const t = acceso ? "#b36b00" : "#8e8e93";
  const oriz = y1 === y2;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return '<g>'
    + '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + (acceso ? 2 : 1.3) + '"/>'
    + '<line x1="' + x1 + '" y1="' + (y1 - (oriz ? 5 : 0)) + '" x2="' + x1 + '" y2="' + (y1 + (oriz ? 5 : 0)) + '" stroke="' + c + '" stroke-width="1.3"/>'
    + '<line x1="' + (x1 - (oriz ? 0 : 5)) + '" y1="' + y1 + '" x2="' + (x1 + (oriz ? 0 : 5)) + '" y2="' + y1 + '" stroke="' + c + '" stroke-width="1.3"/>'
    + '<line x1="' + x2 + '" y1="' + (y2 - (oriz ? 5 : 0)) + '" x2="' + x2 + '" y2="' + (y2 + (oriz ? 5 : 0)) + '" stroke="' + c + '" stroke-width="1.3"/>'
    + '<line x1="' + (x2 - (oriz ? 0 : 5)) + '" y1="' + y2 + '" x2="' + (x2 + (oriz ? 0 : 5)) + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="1.3"/>'
    + '<text x="' + (oriz ? mx : mx + 8) + '" y="' + (oriz ? my - 7 : my) + '" fill="' + t + '" font-size="13" font-weight="700"'
    + ' text-anchor="' + (oriz ? "middle" : "start") + '" dominant-baseline="' + (oriz ? "auto" : "middle") + '">' + esc(testo) + '</text>'
    + '</g>';
}

function disegno(){
  const d = $("draw"); if(!d) return;
  const id = STEPS[step].id;
  const applicare = S.tipo === "applicare";

  const FX = 70, FW = 16;            // frontale
  const BX = FX + FW, BW = 170;      // corpo
  const BY = 95, BH = 150;
  const CY = 200, QY = 140;          // centro chiave e quadro
  const CX = BX + 95;

  const mE = valore("entrata")   || "entrata";
  const mI = valore("interasse") || "interasse";
  const mF = valore("frontale")  || "frontale";

  d.innerHTML =
    '<rect x="0" y="0" width="420" height="340" fill="none"/>'
    /* porta */
    + '<rect x="' + (FX - 44) + '" y="60" width="44" height="220" fill="#eceff3" stroke="#d6dae0" stroke-width="1.5"/>'
    /* frontale */
    + '<rect x="' + FX + '" y="62" width="' + FW + '" height="216" rx="2" fill="#cfd4da" stroke="#9aa1a9" stroke-width="1.6"/>'
    /* corpo serratura */
    + '<rect x="' + BX + '" y="' + BY + '" width="' + BW + '" height="' + BH + '" rx="4" '
      + 'fill="' + (applicare ? "#e8e8ed" : "#f7f7f9") + '" stroke="#9aa1a9" stroke-width="1.8"/>'
    /* scrocco e catenaccio */
    + '<rect x="' + (FX - 12) + '" y="118" width="14" height="22" rx="3" fill="#b9bfc6" stroke="#8d949c" stroke-width="1.3"/>'
    + '<rect x="' + (FX - 16) + '" y="190" width="18" height="26" rx="2" fill="#b9bfc6" stroke="#8d949c" stroke-width="1.3"/>'
    /* foro cilindro */
    + '<circle cx="' + CX + '" cy="' + CY + '" r="15" fill="#fff" stroke="#6e7780" stroke-width="2"/>'
    + '<path d="M' + (CX - 5) + ' ' + (CY + 10) + 'h10l-3 12h-4z" fill="#6e7780"/>'
    /* quadro maniglia */
    + '<rect x="' + (CX - 10) + '" y="' + (QY - 10) + '" width="20" height="20" rx="3" fill="#fff" stroke="#6e7780" stroke-width="2"/>'
    /* quote */
    + quota(FX, 300, CX, 300, mE, id === "entrata")
    + quota(CX + 118, QY, CX + 118, CY, mI, id === "interasse")
    + quota(FX, 46, FX + FW, 46, mF, id === "frontale")
    /* etichette */
    + '<text x="' + (FX - 22) + '" y="300" fill="#8e8e93" font-size="11" text-anchor="middle">porta</text>';

  const cap = $("herocap");
  if(cap){
    const t = {
      impiego:"Dove va montata decide la famiglia di serrature.",
      tipo:"Da infilare sta nello spessore della porta, da applicare resta in vista.",
      mandate:"Quanti giri fa la chiave per chiudere.",
      lato:"Il lato visto da fuori, con la porta chiusa.",
      forma:"La forma del foro: europeo, ovale, tondo o patent.",
      entrata:"Dal bordo del frontale al centro del foro chiave.",
      interasse:"Dal centro del quadro maniglia al centro del foro chiave.",
      frontale:"La larghezza della piastra sul bordo della porta.",
      risultati:"Tocca una riga per la scheda, il + la mette nella lista."
    }[id] || "";
    cap.textContent = t;
  }
}

/* ---------- lista delle serrature scelte ---------- */
function lista(){
  const l = $("lines"); if(!l) return;
  if(!scelti.length){
    l.innerHTML = '<div class="vuoto">Nessuna serratura scelta.<br>Dai risultati, tocca <b>+</b> per aggiungerla.</div>';
    return;
  }
  l.innerHTML = scelti.map(x =>
    '<div class="ln"><b>' + esc(x.codice) + '</b><span>' + esc(x.descrizione || "") + '</span>'
    + '<button class="tog" data-via="' + esc(x.codice) + '" title="Togli">×</button></div>').join("");
}

function piuButtons(){
  document.querySelectorAll("#page .res").forEach(r => {
    if(r.querySelector(".addb")) return;
    const cod = r.dataset.code;
    const dentro = scelti.some(x => x.codice === cod);
    const b = document.createElement("button");
    b.className = "addb" + (dentro ? " on" : "");
    b.type = "button";
    b.dataset.add = cod;
    b.textContent = dentro ? "✓" : "+";
    r.appendChild(b);
  });
}

/* il + non deve aprire anche la scheda */
document.addEventListener("click", e => {
  const b = e.target.closest(".addb");
  if(b){
    e.stopPropagation(); e.preventDefault();
    const cod = b.dataset.add;
    const i = scelti.findIndex(x => x.codice === cod);
    if(i >= 0) scelti.splice(i, 1);
    else {
      const art = items().find(x => x.codice === cod);
      if(art) scelti.push(art);
    }
    lista();
    document.querySelectorAll("#page .res .addb").forEach(n => n.remove());
    piuButtons();
    return;
  }
  const via = e.target.closest(".tog");
  if(via){
    e.stopPropagation();
    const i = scelti.findIndex(x => x.codice === via.dataset.via);
    if(i >= 0) scelti.splice(i, 1);
    lista();
    document.querySelectorAll("#page .res .addb").forEach(n => n.remove());
    piuButtons();
    return;
  }
  const passo = e.target.closest("[data-vai]");
  if(passo){ go(parseInt(passo.dataset.vai, 10)); return; }
}, true);

/* ---------- pulsanti della lista ---------- */
if($("clear")) $("clear").addEventListener("click", () => {
  scelti.length = 0; lista();
  document.querySelectorAll("#page .res .addb").forEach(n => n.remove());
  piuButtons();
});
if($("copy")) $("copy").addEventListener("click", () => {
  if(!scelti.length) return;
  const t = scelti.map(x => x.codice + "  " + (x.descrizione || "")).join("\n");
  const fatto = () => {
    const d = document.createElement("div");
    d.className = "toast"; d.textContent = "Codici copiati";
    document.body.appendChild(d); setTimeout(() => d.remove(), 2200);
  };
  if(navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(t).then(fatto).catch(() => {});
});

/* ---------- si riaggancia dopo ogni disegno della pagina ---------- */
function aggiorna(){ nav(); testata(); disegno(); piuButtons(); }
const page = $("page");
if(page) new MutationObserver(aggiorna).observe(page, {childList:true});
lista();
aggiorna();
})();
