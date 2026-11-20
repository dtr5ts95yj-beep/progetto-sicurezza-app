# Progetto Sicurezza AF — app per telefono

Configuratore interno di Franzini Annibale: maniglioni antipanico e cilindri.
App web installabile sul telefono (iPhone e Android), senza passare dagli store.

## Qui dentro non ci sono dati aziendali

Questo repository contiene **solo il programma**: le domande, la logica, i disegni
tecnici e le schede delle serie. Nessun codice articolo, nessun codice fornitore,
nessun prezzo.

I dati (`dati-progetto-sicurezza.json`) restano sul Drive di chi usa l'app e si
importano dalla pagina iniziale. Vengono salvati nella memoria del telefono e non
escono da lì. Senza dati i moduli restano spenti.

## Installazione sul telefono

Aprire l'indirizzo delle Pages nel browser, poi:

- **iPhone**: Safari → Condividi → Aggiungi a schermata Home
- **Android**: Chrome → tre puntini → Installa app

## Com'è fatta

| File | A cosa serve |
|---|---|
| `index.html`, `home.css` | pagina iniziale, moduli e riquadro dei dati |
| `dati.js`, `dati-home.js` | importazione e conservazione dei dati sul telefono |
| `mobile.css`, `mobile.js` | adattamento allo schermo del telefono |
| `cilindri/` | modulo cilindri: tipo, misura, cosa c'è in assortimento |
| `maniglioni/` | configuratore maniglioni antipanico |
| `manifest.json`, `sw.js`, `ico/` | installazione sulla schermata Home e uso senza rete |

La versione per PC, con il programma Python e la generazione dei PDF, sta nel
repository privato `progetto-sicurezza`.
