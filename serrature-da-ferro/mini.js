/* Disegnini e spiegazioni delle risposte, come nei maniglioni */
"use strict";
const SV = (c) => '<svg width="44" height="70" viewBox="0 0 44 70">' + c + '</svg>';
const PORTA = '<rect x="3" y="3" width="38" height="64" rx="2" fill="#fff" stroke="#9aa0a8" stroke-width="1.5"/>';
const G = "#6e7780", R = "#0a7aff";

window.MINI = {
  /* come si monta */
  "tipo:applicare": SV(PORTA
    + '<rect x="20" y="26" width="17" height="20" rx="2" fill="#dfe3e8" stroke="'+G+'" stroke-width="1.6"/>'
    + '<circle cx="28.5" cy="36" r="3" fill="none" stroke="'+G+'" stroke-width="1.6"/>'),
  "tipo:infilare": SV(PORTA
    + '<rect x="3" y="26" width="7" height="20" rx="1" fill="#cfd4da" stroke="'+G+'" stroke-width="1.4"/>'
    + '<rect x="10" y="28" width="15" height="16" rx="1.5" fill="none" stroke="'+G+'" stroke-width="1.4" stroke-dasharray="3 2"/>'
    + '<circle cx="17.5" cy="36" r="2.6" fill="none" stroke="'+G+'" stroke-width="1.4"/>'),

  /* dove va montata */
  "impiego:fascia": SV('<rect x="3" y="8" width="38" height="54" rx="2" fill="#f2f4f6" stroke="#9aa0a8" stroke-width="1.5"/>'
    + '<rect x="3" y="30" width="38" height="10" fill="#dfe3e8" stroke="'+G+'" stroke-width="1.4"/>'
    + '<circle cx="22" cy="35" r="2.8" fill="'+R+'"/>'),
  "impiego:montanti": SV('<rect x="14" y="3" width="16" height="64" rx="2" fill="#f2f4f6" stroke="#9aa0a8" stroke-width="1.5"/>'
    + '<rect x="16" y="28" width="12" height="16" rx="1.5" fill="#dfe3e8" stroke="'+G+'" stroke-width="1.4"/>'
    + '<circle cx="22" cy="36" r="2.6" fill="'+R+'"/>'),
  "impiego:legno": SV(PORTA
    + '<rect x="9" y="10" width="26" height="22" rx="1.5" fill="none" stroke="#c6ccd3" stroke-width="1.4"/>'
    + '<rect x="9" y="38" width="26" height="22" rx="1.5" fill="none" stroke="#c6ccd3" stroke-width="1.4"/>'
    + '<circle cx="35" cy="36" r="2.4" fill="'+R+'"/>'),
  "impiego:interne": SV(PORTA
    + '<rect x="28" y="33" width="9" height="3" rx="1.5" fill="'+G+'"/>'
    + '<circle cx="31" cy="41" r="2.2" fill="none" stroke="'+R+'" stroke-width="1.5"/>'),
  "impiego:blindate": SV('<rect x="3" y="3" width="38" height="64" rx="2" fill="#eceff2" stroke="'+G+'" stroke-width="2"/>'
    + '<rect x="3" y="18" width="9" height="5" fill="'+G+'"/><rect x="3" y="33" width="9" height="5" fill="'+G+'"/>'
    + '<rect x="3" y="48" width="9" height="5" fill="'+G+'"/>'
    + '<circle cx="30" cy="36" r="3" fill="none" stroke="'+R+'" stroke-width="1.7"/>'),
  "impiego:serrande": SV('<rect x="3" y="6" width="38" height="58" rx="2" fill="#f7f8f9" stroke="#9aa0a8" stroke-width="1.4"/>'
    + [12,19,26,33,40,47].map(y => '<line x1="6" y1="'+y+'" x2="38" y2="'+y+'" stroke="#c6ccd3" stroke-width="2"/>').join("")
    + '<rect x="16" y="52" width="12" height="9" rx="1.5" fill="#dfe3e8" stroke="'+G+'" stroke-width="1.4"/>'
    + '<circle cx="22" cy="56.5" r="2" fill="'+R+'"/>'),
  "impiego:cancelli": SV([8,16,24,32,40].map(x => '<line x1="'+x+'" y1="6" x2="'+x+'" y2="64" stroke="#9aa0a8" stroke-width="2.4"/>').join("")
    + '<line x1="3" y1="14" x2="41" y2="14" stroke="#9aa0a8" stroke-width="2.4"/>'
    + '<line x1="3" y1="56" x2="41" y2="56" stroke="#9aa0a8" stroke-width="2.4"/>'
    + '<rect x="16" y="30" width="13" height="12" rx="1.5" fill="#fff" stroke="'+G+'" stroke-width="1.5"/>'
    + '<circle cx="22.5" cy="36" r="2.2" fill="'+R+'"/>'),
  "impiego:tagliafuoco": SV(PORTA
    + '<rect x="9" y="12" width="26" height="9" rx="1.5" fill="#ffe9e8" stroke="#e0201b" stroke-width="1.3"/>'
    + '<rect x="9" y="34" width="22" height="4" rx="2" fill="#e0201b"/>'
    + '<circle cx="35" cy="45" r="2.3" fill="'+G+'"/>'),
  "impiego:scuretti": SV('<rect x="3" y="8" width="17" height="54" rx="2" fill="#f2f4f6" stroke="#9aa0a8" stroke-width="1.4"/>'
    + '<rect x="24" y="8" width="17" height="54" rx="2" fill="#f2f4f6" stroke="#9aa0a8" stroke-width="1.4"/>'
    + '<circle cx="22" cy="35" r="2.6" fill="'+R+'"/>'),
  "impiego:casseforti": SV('<rect x="5" y="12" width="34" height="46" rx="3" fill="#eceff2" stroke="'+G+'" stroke-width="2"/>'
    + '<circle cx="22" cy="35" r="8" fill="none" stroke="'+G+'" stroke-width="2"/>'
    + '<circle cx="22" cy="35" r="2.4" fill="'+R+'"/>'),
  "impiego:catenacci": SV('<rect x="6" y="28" width="20" height="14" rx="2" fill="#dfe3e8" stroke="'+G+'" stroke-width="1.5"/>'
    + '<rect x="26" y="32" width="14" height="6" rx="3" fill="'+G+'"/>'
    + '<circle cx="14" cy="35" r="2.4" fill="'+R+'"/>'),
  "impiego:elettriche": SV(PORTA
    + '<rect x="3" y="26" width="7" height="20" rx="1" fill="#cfd4da" stroke="'+G+'" stroke-width="1.4"/>'
    + '<path d="M26 22l-7 13h6l-4 12 10-15h-6z" fill="#ff9500"/>'),
  "impiego:lucchetti": SV('<rect x="10" y="32" width="24" height="20" rx="3" fill="#dfe3e8" stroke="'+G+'" stroke-width="1.6"/>'
    + '<path d="M16 32v-5a6 6 0 0 1 12 0v5" fill="none" stroke="'+G+'" stroke-width="2.4"/>'
    + '<circle cx="22" cy="41" r="2.4" fill="'+R+'"/>'),
  "impiego:altro": SV(PORTA + '<text x="22" y="42" font-size="20" font-weight="700" fill="#c6ccd3" text-anchor="middle">?</text>'),

  /* punti di chiusura */
  "punti:1": SV(PORTA + '<rect x="3" y="33" width="9" height="5" fill="'+R+'"/>'),
  "punti:2": SV(PORTA + '<rect x="3" y="24" width="9" height="5" fill="'+R+'"/><rect x="3" y="42" width="9" height="5" fill="'+R+'"/>'),
  "punti:3": SV(PORTA + '<rect x="3" y="18" width="9" height="5" fill="'+R+'"/><rect x="3" y="33" width="9" height="5" fill="'+R+'"/><rect x="3" y="48" width="9" height="5" fill="'+R+'"/>'),
  "punti:4": SV(PORTA + [14,26,38,50].map(y => '<rect x="3" y="'+y+'" width="9" height="5" fill="'+R+'"/>').join("")),
  "punti:5": SV(PORTA + [11,22,33,44,55].map(y => '<rect x="3" y="'+y+'" width="9" height="5" fill="'+R+'"/>').join(""))
};

window.SPIEGA = {
  "tipo:applicare": "La scatola resta in vista sulla faccia della porta, avvitata sopra. Niente da scavare.",
  "tipo:infilare":  "La serratura va dentro lo spessore dell'anta, si vede solo il frontale sul bordo.",
  "impiego:fascia":      "Sulla fascia orizzontale di basculanti e portoni sezionali.",
  "impiego:montanti":    "Nel montante verticale di alluminio e ferro, con catenaccio basculante.",
  "impiego:legno":       "Portoncini e porte esterne in legno, da applicare o da infilare.",
  "impiego:interne":     "Le porte di casa, patent e bordo tondo, entrata 35 o 50.",
  "impiego:blindate":    "Porte blindate e alluminio, serrature multipunto tipo Multitop.",
  "impiego:serrande":    "Serrande avvolgibili e persiane, centrali e laterali.",
  "impiego:cancelli":    "Cancelli, cancelletti e inferriate.",
  "impiego:tagliafuoco": "Porte REI, abbinabili ai maniglioni antipanico.",
  "impiego:scuretti":    "Scuri e persiane in legno.",
  "impiego:casseforti":  "Serrature per casseforti e sportelli.",
  "impiego:catenacci":   "Catenacci, paletti e chiavistelli: chiudono senza cilindro.",
  "impiego:elettriche":  "Elettroserrature e incontri elettrici, apertura dal citofono.",
  "impiego:lucchetti":   "Lucchetti ad arco, per serrande, cancelli e catene.",
  "impiego:altro":       "Non classificata: ci finisce quello che la descrizione non dice.",
  "punti:1": "Un solo catenaccio: chiusura semplice.",
  "punti:2": "Due catenacci, oppure due mandate.",
  "punti:3": "Tre punti: catenaccio centrale e due deviatori.",
  "punti:4": "Quattro punti di chiusura.",
  "punti:5": "Cinque punti di chiusura."
};
