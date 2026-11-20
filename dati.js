/* ===== Progetto Sicurezza AF — i dati =====
   L'app non contiene nessun codice Franzini: i dati li importi tu dal file
   che tieni sul tuo Drive, e restano nella memoria di questo telefono.
   Questo file va caricato PRIMA dei moduli. */
"use strict";

const AF_CHIAVE = "af_dati_v1";

window.AF = {
  /* legge i dati salvati in questo telefono */
  leggi(){
    try{
      const t = localStorage.getItem(AF_CHIAVE);
      return t ? JSON.parse(t) : null;
    }catch(e){ return null; }
  },
  /* salva il contenuto del file importato */
  salva(d){
    localStorage.setItem(AF_CHIAVE, JSON.stringify(d));
  },
  togli(){
    try{ localStorage.removeItem(AF_CHIAVE); }catch(e){}
  },
  /* controlla che il file sia quello giusto prima di accettarlo */
  verifica(d){
    if(!d || typeof d !== "object") return "Il file non è leggibile.";
    if(!Array.isArray(d.cilindri)) return "Nel file manca l'elenco dei cilindri.";
    if(!d.catalogo || typeof d.catalogo !== "object") return "Nel file manca il catalogo dei maniglioni.";
    if(!d.regole || typeof d.regole !== "object") return "Nel file mancano le regole dei maniglioni.";
    if(!d.cilindri.length) return "L'elenco dei cilindri è vuoto.";
    const c = d.cilindri[0];
    if(!c || !c.int || !c.serie) return "L'elenco dei cilindri non ha il formato giusto.";
    return null;
  }
};

/* mette i dati a disposizione dei moduli, con gli stessi nomi di prima */
(function(){
  const d = window.AF.leggi();
  window.AF_DATI    = d;
  window.AF_HA_DATI = !!d;
  window.CILINDRI   = (d && d.cilindri) || [];
  window.CATALOGO   = (d && d.catalogo) || {};
  window.REGOLE     = (d && d.regole)   || {};
  window.DATA_GIAC  = (d && d.data)     || "";

  /* senza dati i moduli non possono funzionare: si torna alla pagina iniziale */
  const dentroModulo = /\/(cilindri|maniglioni)\//.test(location.pathname);
  if(!d && dentroModulo) location.replace("../index.html?serve=1");
})();
