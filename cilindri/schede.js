"use strict";
/* Schede dei cilindri: caratteristiche delle serie (ricerca online sui cataloghi dei produttori,
   novembre 2026) + descrizione da spiegare al cliente, costruita dai dati del singolo articolo. */

const SERIE = {
  "CISA Asix": {
    marca: "CISA", liv: 2, livTxt: "Sicurezza di base",
    semplice: "È il cilindro CISA di base, a 6 perni. Va bene per accessi secondari: porte di servizio, cantine, box, uffici e negozi. Non è pensato per la porta blindata di casa.",
    dove: "Accessi secondari di negozi, case e condomini, dove serve una sicurezza di base.",
    sic: ["Cifratura a 6 perni, oltre 30.000 chiavi diverse possibili",
          "Primo perno e controperno in acciaio cementato: resiste al trapano",
          "Spina di protezione nel corpo del cilindro",
          "Controperni a fungo: rendono più difficile il grimaldello (picking)",
          "Testato fino a 100.000 cicli di apertura"],
    chiave: ["Chiave piatta reversibile (si infila nei due versi), in ottone nichelato",
             "Collo lungo, compatibile con la borchia di protezione (defender)",
             "Numero di codice stampato sulla testa della chiave",
             "Duplicabile liberamente da qualsiasi duplicatore"],
    dot: "3 chiavi e vite di fissaggio.",
    norma: "EN 1303",
    font: "CISA · schede rivenditori"
  },
  "CISA Asix P8": {
    marca: "CISA", liv: 3, livTxt: "Sicurezza buona · anti-bumping",
    semplice: "È il gradino sopra l'Asix: 8 perni su due file invece di 6. Protetto per brevetto contro il bumping (la tecnica che apre il cilindro a colpi di chiave battuta), contro il trapano e contro l'impronta in cera. È il cilindro giusto quando il cliente chiede qualcosa di serio sulla porta di casa.",
    dove: "Porte di casa e porte blindate, edifici pubblici e commerciali. Ottimo dove serve una chiave maestra.",
    sic: ["Cifratura a 8 perni: 6 attivi e 2 passivi, su due file",
          "Oltre 260.000 combinazioni di chiave diverse",
          "Protezione certificata contro il bumping con il brevetto BKP (Bump Key Power)",
          "Protezione contro il trapano e contro l'impronta in cera",
          "Perni, controperni e pastiglie laterali in acciaio carbonitrurato",
          "Chiave maestra fino a 37.000 cilindri con una sola chiave"],
    chiave: ["Chiave piatta reversibile in ottone nichelato",
             "Collo da 17 mm, compatibile con la borchia di protezione",
             "Testa con impugnatura ergonomica in plastica removibile",
             "Personal Card in dotazione: serve per i duplicati"],
    dot: "3 chiavi, 3 cover in nylon, Personal Card e vite di fissaggio. Nella versione PRO: 5 chiavi più 1 di cantiere.",
    norma: "EN 1303:2015",
    font: "CISA · schede rivenditori"
  },
  "CISA C2000": {
    marca: "CISA", liv: 1, livTxt: "Sicurezza base",
    semplice: "È il cilindro CISA più economico, a 5 perni (4 o 3 nelle misure corte). Va bene dove la sicurezza non è il punto: porte interne, ripostigli, cancelli, serrature da applicare su porte in legno.",
    dove: "Accessi di secondaria importanza di abitazioni, uffici e negozi.",
    sic: ["Cifratura a 5 perni (4 o 3 nelle misure ridotte), oltre 30.000 combinazioni",
          "Primo perno e controperno in acciaio cementato: resistenza al trapano",
          "Controperni a fungo antigrimaldello",
          "Corpo e cilindretti in ottone, molle in bronzo fosforoso"],
    chiave: ["Chiave paracentrica in ottone nichelato",
             "Compatibile con la borchia di protezione",
             "Numero di codice sulla testa",
             "Duplicabile liberamente"],
    dot: "3 chiavi e vite di fissaggio.",
    norma: "EN 1303",
    font: "CISA · schede rivenditori"
  },
  "Cisa": {
    marca: "CISA", liv: 1, livTxt: "Sicurezza base",
    semplice: "Cilindri CISA di linea base, a 5 perni, della stessa famiglia del C2000. Buoni per accessi secondari e per sostituire un cilindro vecchio senza spendere.",
    dove: "Accessi secondari, porte interne, serrature da applicare.",
    sic: ["Cifratura a 5 perni", "Primo perno e controperno in acciaio cementato", "Corpo e cilindretti in ottone"],
    chiave: ["Chiave piatta o paracentrica in ottone nichelato", "Duplicabile liberamente"],
    dot: "3 chiavi e vite di fissaggio.",
    norma: "EN 1303",
    font: "CISA · schede rivenditori"
  },
  "ISEO R6": {
    marca: "ISEO", liv: 2, livTxt: "Sicurezza di base",
    semplice: "È l'ISEO di base a 6 perni, con chiave reversibile. Equivale all'Asix di CISA: buono per accessi secondari, non per la blindata. Si può montare sulle porte tagliafuoco.",
    dove: "Accessi secondari di abitazioni ed edifici commerciali. Idoneo alle porte tagliafuoco.",
    sic: ["Cifratura a 6 perni in acciaio inox",
          "2 controperni a fungo per ogni cilindretto: resistenza al grimaldello (picking)",
          "Spina in acciaio temprato nel corpo: resistenza al trapano",
          "Corpo e cilindretto in ottone, molle in acciaio inox",
          "Camma di bloccaggio in acciaio sinterizzato"],
    chiave: ["Chiave reversibile (si infila nei due versi) in ottone nichelato",
             "Collo da 16 mm",
             "Code Card in dotazione per ordinare i duplicati"],
    dot: "3 chiavi, Code Card e vite di fissaggio.",
    norma: "EN 1303:2015",
    font: "ISEO · iseo.com e schede rivenditori"
  },
  "ISEO R6 Plus": {
    marca: "ISEO", liv: 2, livTxt: "Sicurezza di base · chiave di cantiere",
    semplice: "È l'R6 con in più la chiave di cantiere: durante i lavori gli operai usano la chiave di cantiere, poi il proprietario infila la prima chiave definitiva e quella di cantiere smette di funzionare. Si usa sulle case nuove e nelle ristrutturazioni.",
    dove: "Case in costruzione o in ristrutturazione, condomini nuovi, accessi secondari.",
    sic: ["Cifratura a 6 perni in acciaio inox",
          "Controperni a fungo antipicking in ottone",
          "Spine antitrapano nel corpo",
          "Controperni antigioco e molle in bronzo fosforoso",
          "Funzione chiave di cantiere: la prima chiave definitiva annulla quella di cantiere"],
    chiave: ["Chiave reversibile in ottone nichelato con impugnatura in gomma",
             "5 chiavi definitive + 1 chiave di cantiere",
             "Property card numerata: serve per chiedere i duplicati"],
    dot: "5 chiavi + 1 di cantiere, tessera e vite di fissaggio.",
    norma: "EN 1303:2015",
    font: "ISEO · schede rivenditori"
  },
  "ISEO R9": {
    marca: "ISEO", liv: 4, livTxt: "Alta sicurezza · chiave protetta",
    semplice: "È il cilindro di punta ISEO: due file di perni e chiave protetta da brevetto, che il cliente non può far duplicare in giro senza la tessera. È quello da proporre sulla porta blindata di casa o dove si vuole il controllo delle copie.",
    dove: "Porte blindate, abitazioni e attività dove serve il massimo, e impianti a chiave maestra su più livelli.",
    sic: ["Due file di perni: 6 perni inferiori più fino a 6 perni passivi laterali",
          "Protezione antitrapano: spina in acciaio temprato nello statore e 2 spine inox nel rotore",
          "2 controperni antipicking per ogni rotore",
          "Resistenza dichiarata al bumping",
          "Adatto a impianti a chiave maestra su più livelli"],
    chiave: ["Chiave reversibile in alpacca, a collo lungo",
             "Profilo protetto da brevetto e marchio: i duplicati non autorizzati non si fanno",
             "Duplicato solo nei centri abilitati presentando la tessera di proprietà"],
    dot: "Chiavi e tessera di proprietà.",
    norma: "EN 1303:2015",
    font: "ISEO · iseo.com"
  },
  "ISEO F5": {
    marca: "ISEO", liv: 1, livTxt: "Sicurezza base",
    semplice: "È l'ISEO più semplice, a 5 perni, con la chiave verticale punzonata (quella classica, non reversibile: va infilata dal verso giusto). Economico, per accessi che non richiedono protezione alta.",
    dove: "Porte interne ed esterne che non richiedono le massime protezioni; usato anche sui maniglioni antipanico.",
    sic: ["Cifratura a 5 perni, circa 30.000 combinazioni",
          "2 controperni a fungo per ogni cilindretto contro il grimaldello",
          "Protezione di base contro il trapano",
          "Corpo e cilindretto in ottone, molle in acciaio inox"],
    chiave: ["Chiave verticale standard punzonata in ottone nichelato",
             "Non reversibile: va infilata dal verso giusto",
             "Numero di codice sulla medaglia della chiave"],
    dot: "3 chiavi (5 in alcune versioni) e vite di fissaggio.",
    norma: "EN 1303:2015",
    font: "ISEO · iseo.com e schede rivenditori"
  },
  "Iseo": {
    marca: "ISEO", liv: 2, livTxt: "Cilindro esterno a pompa",
    semplice: "È il cilindro esterno a pompa: non è un cilindro europeo, si monta sulle serrature a pompa ISEO delle porte in legno. La chiave è quella grossa a pompa.",
    dove: "Serrature ISEO delle serie 901, 903, 910, 911, 913 e 915.",
    sic: ["Corpo in zama nichelato",
          "Spina antitrapano",
          "Cannotto antistrappo in acciaio carbonitrurato e verniciato"],
    chiave: ["Chiave a pompa", "Cifratura a chiavi diverse (KD)"],
    dot: "3 chiavi, cannotto antistrappo e viti di fissaggio.",
    norma: "—",
    font: "ISEO · schede rivenditori"
  },
  "Omec 140": {
    marca: "OMEC", liv: 2, livTxt: "Cilindro ovale",
    semplice: "È il cilindro ovale in alluminio per i serramenti in ferro e alluminio: quello delle serrature da montante. La chiave gira di 360°, quindi fa più mandate.",
    dove: "Serrature da infilare per montanti di serramenti in alluminio e ferro.",
    sic: ["Corpo in alluminio ad alta resistenza, leggero e resistente alla corrosione",
          "5 perni e controperni in acciaio inox, resistenti al grimaldello",
          "Barilotti in ottone nichelato con guida-chiave",
          "Molle in acciaio inox, camma verticale in acciaio autolubrificante"],
    chiave: ["Chiave in ottone nichelato", "Rotazione della chiave di 360°", "Su richiesta: impianti a chiave uguale (KA) o chiave maestra"],
    dot: "3 chiavi.",
    norma: "UNI EN 1303:2015",
    font: "OMEC · omec.info e schede rivenditori"
  },
  "Omec": {
    marca: "OMEC", liv: 2, livTxt: "Cilindro ovale con pomolo",
    semplice: "Cilindro ovale OMEC con il pomolo sul lato interno: da dentro si apre girando il pomolo, senza chiave. Per i serramenti in alluminio.",
    dove: "Serrature da montante di serramenti in alluminio e ferro, dove da dentro si vuole aprire senza chiave.",
    sic: ["Corpo in alluminio ad alta resistenza", "Perni e controperni in acciaio inox", "Barilotti in ottone nichelato con guida-chiave"],
    chiave: ["Chiave in ottone nichelato", "Pomolo sul lato interno"],
    dot: "3 chiavi.",
    norma: "UNI EN 1303:2015",
    font: "OMEC · schede rivenditori"
  },
  "Welka": {
    marca: "WELKA", liv: 1, livTxt: "Cilindro ridotto",
    semplice: "Sono cilindri di diametro ridotto, più piccoli dell'europeo normale. Si usano dove non c'è spazio: sportelli, armadi metallici, cassette, serramenti sottili. KA vuol dire chiave uguale, cioè più cilindri che si aprono con la stessa chiave.",
    dove: "Sportelli, armadi, cassette e serramenti dove l'europeo normale non entra.",
    sic: ["Profilo ridotto", "Distanza fissa di 10 mm tra i due lati"],
    chiave: ["Cifratura a chiave uguale (KA): più cilindri con la stessa chiave"],
    dot: "Chiavi secondo la versione.",
    norma: "—",
    font: "Welka · catalogo"
  },
  "Viro": {
    marca: "VIRO", liv: 1, livTxt: "Sicurezza base",
    semplice: "Mezzo cilindro VIRO da infilare, a 4 perni. Si usa dove serve la chiave da un lato solo: basculanti del box, cancelli, quadri.",
    dove: "Basculanti, cancelli, serrature che vogliono la chiave da un lato solo.",
    sic: ["Cifratura a 4 perni"],
    chiave: ["Chiave piatta"],
    dot: "Chiavi secondo la versione.",
    norma: "—",
    font: "VIRO · catalogo"
  },
  "Prefer": {
    marca: "PREFER", liv: 1, livTxt: "Mezzo cilindro",
    semplice: "Mezzo cilindro PREFER sagomato, per le serrature dei serramenti in alluminio PREFER.",
    dove: "Serrature PREFER per serramenti in alluminio.",
    sic: ["Corpo in ottone"],
    chiave: ["Chiave piatta"],
    dot: "Chiavi secondo la versione.",
    norma: "—",
    font: "PREFER · catalogo"
  },
};
SERIE['CISA C2000'].diff = '5 perni · il più economico'; SERIE['CISA C2000'].diff2 = 'Chiave duplicabile ovunque, nessuna protezione particolare.';
SERIE['Cisa'].diff = '5 perni · linea base'; SERIE['Cisa'].diff2 = 'Chiave duplicabile ovunque, nessuna protezione particolare.';
SERIE['ISEO F5'].diff = '5 perni · chiave verticale'; SERIE['ISEO F5'].diff2 = 'La chiave non è reversibile: va infilata dal verso giusto. Duplicabile ovunque.';
SERIE['CISA Asix'].diff = '6 perni · antitrapano'; SERIE['CISA Asix'].diff2 = 'Chiave reversibile, duplicabile ovunque. Un gradino sopra il C2000.';
SERIE['ISEO R6'].diff = '6 perni · antitrapano e antipicking'; SERIE['ISEO R6'].diff2 = 'Chiave reversibile, con Code Card per i duplicati. Va anche su porte tagliafuoco.';
SERIE['ISEO R6 Plus'].diff = '6 perni · con chiave di cantiere'; SERIE['ISEO R6 Plus'].diff2 = "Come l'R6, ma con 5 chiavi più 1 di cantiere: per le case nuove e le ristrutturazioni.";
SERIE['CISA Asix P8'].diff = '8 perni · protetto dal bumping'; SERIE['CISA Asix P8'].diff2 = 'È il salto di qualità: due file di perni e brevetto anti-bumping. Per la porta di casa.';
SERIE['ISEO R9'].diff = '9 perni su due file · chiave brevettata'; SERIE['ISEO R9'].diff2 = 'Le copie si fanno solo nei centri abilitati con la tessera. Il massimo della gamma.';
SERIE['Omec 140'].diff = 'Ovale · 5 perni inox'; SERIE['Omec 140'].diff2 = 'Corpo in alluminio, la chiave gira di 360°. Per i serramenti in alluminio.';
SERIE['Omec'].diff = 'Ovale con pomolo · alluminio'; SERIE['Omec'].diff2 = 'Da dentro si apre col pomolo, senza chiave.';
SERIE['Iseo'].diff = 'A pompa · antistrappo'; SERIE['Iseo'].diff2 = 'Non è un europeo: va sulle serrature a pompa ISEO.';
SERIE['Welka'].diff = 'Ridotto · chiave uguale'; SERIE['Welka'].diff2 = "Più piccolo dell'europeo, per sportelli e armadi.";
SERIE['Viro'].diff = '4 perni · mezzo cilindro'; SERIE['Viro'].diff2 = 'Chiave da un lato solo, per basculanti e cancelli.';
SERIE['Prefer'].diff = 'Mezzo cilindro per alluminio'; SERIE['Prefer'].diff2 = 'Per le serrature PREFER dei serramenti in alluminio.';
SERIE["PREFER · ISEO R6"] = SERIE["ISEO R6"];

const LIV_TXT = {1:"Base", 2:"Media", 3:"Buona", 4:"Alta"};

const TIPO_SPIEGA = {
  doppio: "Chiave da tutti e due i lati. Se resta una chiave infilata dentro, da fuori non si apre.",
  friz:  "Frizionato: si apre da fuori anche se dall'altro lato è rimasta la chiave inserita. Utile dove entra più di una persona.",
  pred:  "Ha il codolo sul lato interno: il pomolo si monta a parte, oppure è già montato. Da dentro si apre senza chiave, comodo per uscire in fretta.",
  pomolo:"Pomolo sul lato interno: da dentro si apre girando il pomolo, senza chiave. Attenzione: se c'è un vetro vicino alla serratura, da fuori si può raggiungere il pomolo.",
  mezzo: "Chiave da un lato solo. Si usa su basculanti, cancelli, quadri elettrici e dove dall'altro lato non serve aprire.",
  pompa: "Cilindro esterno a pompa: si monta sulle serrature a pompa, non sulle serrature a profilo europeo.",
};
const PROF_SPIEGA = {
  europeo: "Profilo europeo (sagomato), il più diffuso: si monta su quasi tutte le serrature da infilare moderne.",
  ovale:   "Profilo ovale: è quello delle serrature da montante dei serramenti in ferro e alluminio. Non è intercambiabile con l'europeo.",
  tondo:   "Cilindro tondo da applicare: si monta sulle serrature applicate alla porta, tipiche delle porte in legno e dei portoni.",
  pompa:   "Cilindro esterno a pompa, per le serrature a pompa.",
  altro:   "Formato particolare: controlla la descrizione e il disegno prima di ordinarlo.",
};

const LIV_CL = {1:"lv1", 2:"lv2", 3:"lv3", 4:"lv4"};
function livChip(S){ return S ? '<span class="lv '+LIV_CL[S.liv]+'">'+LIV_TXT[S.liv]+'</span>' : ""; }
function diffTxt(c){ const S = SERIE[c.serie]; return S && S.diff ? S.diff : (c.perni ? c.perni+" perni" : ""); }

/* scheda breve: quello che serve davanti al cliente, con i dettagli a richiesta */
function scheda(c){
  const S = SERIE[c.serie] || null, mezzo = c.tipo === "mezzo";
  let h = '<div class="sh-h"><div><h2>'+esc(c.int)+'</h2><p>'+esc(c.serie)+(c.a ? ' · '+(mezzo ? c.a+" mm" : c.a+" / "+c.b+" mm") : '')+(c.fin ? ' · '+esc(c.fin) : '')+'</p></div>'+(S ? '<span class="lv '+LIV_CL[S.liv]+' big">'+LIV_TXT[S.liv]+'</span>' : '')+'</div>';
  if(S) h += '<p class="sh-big">'+esc(S.diff)+'</p><p class="sh-sub">'+esc(S.diff2 || "")+'</p>';
  // 3 punti chiave
  const forte = [];
  if(c.perni) forte.push("<b>"+c.perni+" perni</b>" + (c.perni >= 8 ? " su due file" : ""));
  if(S && S.liv >= 3) forte.push("<b>Protetto dal bumping</b>");
  if(S && (S.marca === "CISA" || S.marca === "ISEO") && S.liv <= 2) forte.push("<b>Antitrapano</b> di base");
  if(S && S.liv === 4) forte.push("<b>Chiave brevettata</b>: copie solo con la tessera");
  else if(c.chiavi) forte.push("<b>"+esc(c.chiavi)+"</b> in dotazione");
  if(TIPO_SPIEGA[c.tipo]) forte.push(TIPO_SPIEGA[c.tipo]);
  if(c.camma) forte.push("<b>Camma girata di 90°</b>: controlla quella del cliente prima di ordinare");
  h += '<ul class="sh-k">'+forte.slice(0, 4).map(x => '<li>'+x+'</li>').join("")+'</ul>';
  if(c.a && !mezzo) h += '<p class="sh-note">Misure '+c.a+' fuori e '+c.b+' dentro, dal centro della vite: '+(c.a+c.b)+' mm in tutto. Non deve sporgere più di 2-3 mm dalla porta.</p>';
  if(c.a && mezzo) h += '<p class="sh-note">'+c.a+' mm dal lato chiave, più 10 mm fissi: '+(c.a+10)+' mm in tutto.</p>';
  if(c.stato) h += '<p class="sh-note att">Articolo in esaurimento: controlla la disponibilità prima di prometterlo.</p>';
  // dettagli a richiesta
  if(S){
    h += '<details class="sh-d"><summary>Tutti i dettagli tecnici</summary>';
    h += '<div class="sh-s"><h3>Com\'è fatto</h3><p>'+esc(S.semplice)+'</p></div>';
    h += '<div class="sh-g"><div class="sh-s"><h3>Sicurezza</h3><ul>'+S.sic.map(x => '<li>'+esc(x)+'</li>').join("")+'</ul></div>'
       + '<div class="sh-s"><h3>La chiave</h3><ul>'+S.chiave.map(x => '<li>'+esc(x)+'</li>').join("")+'</ul></div></div>';
    h += '<div class="sh-s"><h3>Dove si usa</h3><p>'+esc(S.dove)+'</p></div>';
    h += '<div class="sh-s"><h3>In dotazione</h3><p>'+esc(S.dot)+(S.norma !== "—" ? " Conforme alla norma "+esc(S.norma)+"." : "")+'</p></div>';
    h += '<div class="sh-s"><h3>Codici</h3><p>Interno <b>'+esc(c.int)+'</b> · fornitore <b>'+esc(c.forn)+'</b><br>'+esc(c.desc)+'</p></div>';
    h += '<div class="sh-f">Caratteristiche della serie prese dai cataloghi del produttore ('+esc(S.font)+'). Verifica sulla scheda del produttore prima di un ordine importante.</div></details>';
  } else {
    h += '<div class="sh-f">Per questa serie non ho caratteristiche verificate. Dal gestionale: '+esc(c.desc)+' · fornitore '+esc(c.forn)+'.</div>';
  }
  return h;
}
function apriScheda(cod){
  const c = CILINDRI.find(x => x.int === cod); if(!c) return;
  let w = $("sheet");
  if(!w){ document.body.insertAdjacentHTML("beforeend", '<div class="sheet" id="sheet"><div class="sh-box"><button class="sh-x" id="sh-x">×</button><div class="sh-c" id="sh-c"></div><div class="sh-b"><button class="btn s" id="sh-copy">Copia il testo</button><button class="btn p" id="sh-add"></button></div></div></div>');
    w = $("sheet");
    $("sh-x").onclick = () => { w.style.display = "none"; };
    w.addEventListener("click", e => { if(e.target === w) w.style.display = "none"; });
    $("sh-copy").onclick = async () => { const t = $("sh-c").innerText; try{ if(window.pywebview && window.pywebview.api && window.pywebview.api.copia) await window.pywebview.api.copia(t); else if(SERVER) await apiPost("/api/copia", {testo:t}); else await navigator.clipboard.writeText(t); toast("Scheda copiata"); }catch(e){ toast("Copia non riuscita"); } };
  }
  $("sh-c").innerHTML = scheda(c);
  $("sh-c").scrollTop = 0;
  $("sh-add").textContent = S.scelti.includes(c.int) ? "Togli dalla lista" : "Aggiungi alla lista";
  $("sh-add").onclick = () => { act("add:"+c.int); $("sh-add").textContent = S.scelti.includes(c.int) ? "Togli dalla lista" : "Aggiungi alla lista"; };
  w.style.display = "flex";
}
document.addEventListener("click", e => { const n = e.target.closest("[data-info]"); if(n){ e.stopPropagation(); apriScheda(n.getAttribute("data-info")); } });
document.addEventListener("keydown", e => { if(e.key === "Escape" && $("sheet") && $("sheet").style.display !== "none") $("sheet").style.display = "none"; });
