/* Ma veilleuse : le service worker.
   C'est un petit programme que le navigateur garde sur le téléphone. Il met l'appli en réserve pour qu'elle s'ouvre sans connexion.
   - La coquille (page, styles, script, police, icônes) : on la demande au réseau d'abord, pour avoir toujours la dernière version ;
     sans réseau, on sert la copie en réserve.
   - Les photos des décors : on sert la réserve d'abord, et on garde chaque photo la première fois qu'elle est demandée.
   Changer VERSION force la mise à jour de la réserve à la prochaine ouverture. */
var VERSION = "veilleuse-20261115-0134";
var COQUILLE = VERSION + "-coquille";
var DECORS = "veilleuse-decors-v1";
var FICHIERS = [
  "./", "index.html", "manifest.webmanifest",
  "css/polices.css", "css/app.css", "css/verre.css", "js/app.js", "polices/lexend.woff2",
  "icones/icone-192.png", "icones/icone-512.png", "icones/maskable-192.png", "icones/maskable-512.png", "icones/apple-touch-icon.png",
  "decors/test.avif"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(COQUILLE).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== COQUILLE && k !== DECORS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* Les décors : la réserve d'abord. */
  if (url.pathname.indexOf("/decors/") >= 0) {
    e.respondWith(caches.open(DECORS).then(function (c) {
      return c.match(req).then(function (r) {
        return r || fetch(req).then(function (rep) { if (rep && rep.ok) c.put(req, rep.clone()); return rep; });
      });
    }));
    return;
  }

  /* Le reste : le réseau d'abord, la réserve ensuite. Une page demandée hors ligne reçoit index.html. */
  e.respondWith(fetch(req).then(function (rep) {
    if (rep && rep.ok && (req.mode === "navigate" || url.pathname.match(/\.(css|js|woff2|png|webmanifest)$/))) {
      var copie = rep.clone(); caches.open(COQUILLE).then(function (c) { c.put(req, copie); });
    }
    return rep;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || (req.mode === "navigate" ? caches.match("index.html") : undefined); });
  }));
});
