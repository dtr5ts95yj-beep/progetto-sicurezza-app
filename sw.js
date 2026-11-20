/* Progetto Sicurezza AF — tiene l'app in memoria così funziona anche senza rete. */
const CACHE = "af-sicurezza-v1";
const FILE = [
  "./", "./index.html", "./home.css", "./mobile.css", "./mobile.js", "./manifest.json",
  "./dati.js", "./dati-home.js",
  "./ico/icona-192.png", "./ico/icona-512.png", "./ico/apple-touch-icon.png",
  "./cilindri/index.html", "./cilindri/style.css", "./cilindri/cilindri.css",
  "./cilindri/schede.css", "./cilindri/code128.js",
  "./cilindri/cilindri.js", "./cilindri/schede.js",
  "./maniglioni/index.html", "./maniglioni/style.css",
  "./maniglioni/code128.js", "./maniglioni/app.js", "./maniglioni/gestione.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILE.map(f => c.add(f).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if(r.method !== "GET" || !r.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(r).then(hit => {
      if(hit){
        fetch(r).then(res => { if(res && res.ok) caches.open(CACHE).then(c => c.put(r, res)); }).catch(() => {});
        return hit;
      }
      return fetch(r).then(res => {
        if(res && res.ok){ const copia = res.clone(); caches.open(CACHE).then(c => c.put(r, copia)); }
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
