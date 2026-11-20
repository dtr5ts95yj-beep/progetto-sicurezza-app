/* ===== Progetto Sicurezza AF — comandi per il telefono =====
   Aggiunge il menu a scomparsa, la ricerca a scomparsa e il foglio dal basso.
   Su PC non cambia niente: i pulsanti restano nascosti dal CSS. */
(function(){
"use strict";
const q = s => document.querySelector(s);
const app = q(".app"); if(!app) return;

const side    = q(".side"),
      insp    = q(".insp"),
      topbar  = q(".topbar"),
      corpo   = q(".body"),
      content = q(".content"),
      foot     = q(".foot"),
      lines   = document.getElementById("lines");

/* ---------- oscuramento dietro al menu e al foglio ---------- */
const dim = document.createElement("div");
dim.className = "m-dim";
document.body.appendChild(dim);

function apri(el){ if(!el) return; el.classList.add("open"); dim.classList.add("on"); }
function chiudi(){
  if(side) side.classList.remove("open");
  if(insp) insp.classList.remove("open");
  dim.classList.remove("on");
}
dim.addEventListener("click", chiudi);
document.addEventListener("keydown", e => { if(e.key === "Escape") chiudi(); });

/* ---------- pulsanti della barra in alto ---------- */
const ICO = {
  menu:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  lente:  '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg>',
  disOn:  '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 15l4.5-4 3.5 3 4-5 5 6"/></svg>',
  disOff: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M4.5 19.5l15-15"/></svg>'
};
function bottone(cls, html, fn){
  const b = document.createElement("button");
  b.className = "m-ic " + cls;
  b.type = "button";
  b.innerHTML = html;
  b.addEventListener("click", fn);
  return b;
}

if(topbar){
  /* menu dei passi */
  if(side){
    topbar.insertBefore(bottone("m-menu", ICO.menu, () => apri(side)), topbar.firstChild);
    side.addEventListener("click", e => {
      if(e.target.closest("[data-step],[data-vai],.step,.nav,.back")) setTimeout(chiudi, 90);
    });
  }

  /* mostra o nasconde il disegno, per avere più spazio */
  if(corpo && q(".hero")){
    const bd = bottone("m-dis", ICO.disOn, () => {
      const off = corpo.classList.toggle("m-nohero");
      bd.innerHTML = off ? ICO.disOff : ICO.disOn;
      try{ localStorage.setItem("af_nodisegno", off ? "1" : "0"); }catch(e){}
    });
    topbar.appendChild(bd);
    try{
      if(localStorage.getItem("af_nodisegno") === "1"){ corpo.classList.add("m-nohero"); bd.innerHTML = ICO.disOff; }
    }catch(e){}
  }

  /* ricerca a scomparsa */
  const campo = document.getElementById("search");
  if(campo){
    topbar.appendChild(bottone("m-lup", ICO.lente, () => {
      const acceso = topbar.classList.toggle("sx");
      if(acceso){ setTimeout(() => campo.focus(), 70); }
      else if(campo.value){
        campo.value = "";
        campo.dispatchEvent(new Event("input", {bubbles:true}));
      }
    }));
    campo.addEventListener("keydown", e => { if(e.key === "Enter") campo.blur(); });
  }
}

/* ---------- barretta che apre il foglio dal basso ---------- */
if(insp && content && foot){
  const titolo = (insp.querySelector("h2") || {}).textContent || "Scelti";

  const barra = document.createElement("button");
  barra.className = "m-sel";
  barra.type = "button";
  barra.innerHTML = '<span class="n z">0</span><span class="tx2">' + titolo + '</span><span class="go2">Apri ›</span>';
  barra.addEventListener("click", () => apri(insp));
  content.insertBefore(barra, foot);

  const chiudiFoglio = document.createElement("button");
  chiudiFoglio.className = "m-x";
  chiudiFoglio.type = "button";
  chiudiFoglio.innerHTML = "×";
  chiudiFoglio.addEventListener("click", chiudi);
  insp.insertBefore(chiudiFoglio, insp.firstChild);

  const pallino = barra.querySelector(".n");
  function aggiorna(){
    const n = lines ? lines.querySelectorAll(".ln").length : 0;
    pallino.textContent = n;
    pallino.classList.toggle("z", n === 0);
  }
  if(lines) new MutationObserver(aggiorna).observe(lines, {childList:true, subtree:true});
  aggiorna();

  /* chiudendo il foglio dopo aver stampato o copiato si torna al lavoro */
  ["copy","print","clear"].forEach(id => {
    const b = document.getElementById(id);
    if(b) b.addEventListener("click", () => setTimeout(chiudi, 650));
  });

  /* se la stampa è bloccata (dentro l'app di Claude) lo diciamo invece di non fare niente */
  const stampa = document.getElementById("print");
  if(stampa){
    let partita = false;
    window.addEventListener("beforeprint", () => { partita = true; });
    stampa.addEventListener("click", () => {
      partita = false;
      setTimeout(() => {
        if(partita) return;
        const d = document.createElement("div");
        d.className = "toast";
        d.style.maxWidth = "86vw";
        d.style.lineHeight = "1.4";
        d.textContent = "La stampa qui è bloccata. Apri l'app dall'icona sulla schermata Home, oppure usa il menu del browser → Stampa.";
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 5200);
      }, 1400);
    });
  }

  /* trascinando il foglio verso il basso si chiude */
  let y0 = null;
  insp.addEventListener("touchstart", e => {
    y0 = (insp.scrollTop <= 0 && e.target.closest(".lines") === null) ? e.touches[0].clientY : null;
  }, {passive:true});
  insp.addEventListener("touchmove", e => {
    if(y0 === null) return;
    const d = e.touches[0].clientY - y0;
    if(d > 70){ chiudi(); y0 = null; }
  }, {passive:true});
}
})();
