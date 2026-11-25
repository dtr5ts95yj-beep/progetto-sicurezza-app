/* ===== Progetto Sicurezza AF — i dati =====
   L'app non contiene nessun codice Franzini: importi tu il file che tieni sul Drive
   e resta nella memoria di questo telefono. Va caricato PRIMA dei moduli. */
"use strict";

const AF_CHIAVE = "af_dati_v2";
const AF_VECCHIA = "af_dati_v1";          // formato dei due file separati

window.AF = {
  leggi(){
    try{
      const t = localStorage.getItem(AF_CHIAVE);
      return t ? JSON.parse(t) : null;
    }catch(e){ return null; }
  },
  salva(d){ localStorage.setItem(AF_CHIAVE, JSON.stringify(d)); },
  togli(){
    try{ localStorage.removeItem(AF_CHIAVE); localStorage.removeItem(AF_VECCHIA);
         localStorage.removeItem("af_serrature_ferro"); }catch(e){}
  },
  /* controlla il file prima di accettarlo */
  verifica(d){
    if(!d || typeof d !== "object") return "Il file non è leggibile.";
    if(!Array.isArray(d.articoli)) return "Nel file manca l'elenco degli articoli.";
    if(!d.articoli.length) return "L'elenco degli articoli è vuoto.";
    const a = d.articoli[0];
    if(!a || !a.cod || !a.fam) return "L'elenco degli articoli non ha il formato giusto.";
    if(!d.catalogo || !d.regole) return "Nel file mancano le regole dei maniglioni.";
    return null;
  },
  /* quante voci per famiglia */
  conta(d){
    const c = {};
    (d && d.articoli || []).forEach(x => { c[x.fam] = (c[x.fam] || 0) + 1; });
    return c;
  }
};

/* ---------- mette i dati a disposizione dei moduli ---------- */
(function(){
  const d = window.AF.leggi();
  window.AF_DATI    = d;
  window.AF_HA_DATI = !!d;

  const art = (d && d.articoli) || [];
  window.ARTICOLI  = art;
  window.SERRATURE = art.filter(x => x.fam === "serrature" || x.fam === "accessori").map(x => ({
    codice: x.cod, forn: x.forn || "", descrizione: x.desc || "", marca: x.marca || "",
    impiego: x.impiego || "altro", tipo: x.tipo || "ns",
    mandate: x.mandate != null ? String(x.mandate) : "ns",
    lato: x.lato || "ns", forma: x.forma || "ns",
    entrata: x.entrata != null ? String(x.entrata) : "",
    interasse: x.interasse != null ? String(x.interasse) : "",
    frontale: x.frontale != null ? String(x.frontale) : "",
    lung: x.lung || null, punti: x.punti || null, fam: x.fam, fonte: x.fonte || ""
  }));

  /* i cilindri con i nomi di campo che il modulo usa da sempre */
  window.CILINDRI = art.filter(x => x.fam === "cilindri").map(x => ({
    int: x.cod, forn: x.forn || "", marca: x.marca || "", desc: x.desc || "",
    serie: x.serie || x.marca || "", prof: x.prof || "", tipo: x.tipo || "doppio",
    a: x.a, b: x.b, fin: x.fin || "", perni: x.perni || null,
    chiavi: x.chiavi || null, camma: x.camma || "", stato: x.stato || ""
  }));

  window.CATALOGO  = (d && d.catalogo) || {};
  window.REGOLE    = (d && d.regole)   || {};
  window.DATA_GIAC = (d && d.data)     || "";

  /* senza dati i moduli non possono funzionare */
  const dentroModulo = /\/(cilindri|maniglioni|serrature-da-ferro)\//.test(location.pathname);
  if(!d && dentroModulo) location.replace("../index.html?serve=1");
})();
