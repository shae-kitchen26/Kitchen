/* Кухня — офлайн-кэш. При обновлении файлов поменяй номер версии. */
const V = 'kuhnya-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const copy = r.clone();
          caches.open(V).then(c => c.put(e.request, copy));
        }
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
