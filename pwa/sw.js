// The build replaces the version with a content hash of the complete app.
const CACHE = 'pirate-fruit-@@VERSION@@';
const FILES = @@FILES@@;
self.addEventListener('install', event => {
  // A failed precache prevents this worker replacing the working offline version.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('pirate-fruit-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
// No skipWaiting: a new version waits until all game windows close, avoiding
// an unexpected reload or mixed assets in the middle of a voyage.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const isHome = url.pathname === '/' || url.pathname === '/index.html';
  const key = isHome ? '/index.html' : url.pathname;
  if (!FILES.includes(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(key) || fetch(event.request);
  })());
});
