// Uygulama kabuğunu önbellekte tutar (hızlı açılış); veri her zaman ağdan gelir.
const KABUK = 'rehberlik-v1';
const DOSYALAR = ['./', 'index.html', 'manifest.webmanifest', 'ikon-192.png', 'ikon-512.png', 'ikon-180.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(KABUK).then(function (c) { return c.addAll(DOSYALAR); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (adlar) {
    return Promise.all(adlar.filter(function (a) { return a !== KABUK; }).map(function (a) { return caches.delete(a); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // Apps Script verisi: dokunma
  // Önce ağ (güncelleme hemen gelsin), ağ yoksa önbellek
  e.respondWith(fetch(e.request).then(function (r) {
    const kopya = r.clone();
    caches.open(KABUK).then(function (c) { c.put(e.request, kopya); });
    return r;
  }).catch(function () { return caches.match(e.request); }));
});
