/* ULTRA CLEAR — RECEIPT · offline shell · v1.9
   Upload this file into the SAME folder as the receipt page (index.html).
   It keeps a copy of the app on the device so it opens with no signal.
   Strategy: show the saved copy instantly, fetch a fresh one in the background.
   An update you upload therefore appears on the SECOND open, not the first. */
const CACHE = 'uc-receipt-v1-9-4';
const SHELL = ['./', 'manifest.webmanifest', 'logo.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
/* each file on its own, so a missing optional file (e.g. logo.png) cannot stop the app being saved */
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null))))); });
/* drop older copies of the app, so a phone never keeps serving a previous version's cache */
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.indexOf('uc-receipt-') === 0 && k !== CACHE).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;   // never touch calls to the Google Sheet
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await fresh) || (await c.match('./')) || new Response('Offline — open the app once with internet first.', { status: 503 });
  }));
});
