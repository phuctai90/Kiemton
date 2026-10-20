// Service worker: lưu sẵn vỏ app (trang mở + icon) để mở nhanh và cài được như app.
// Dữ liệu vẫn đọc/ghi trực tiếp Google Sheet qua webapp, không lưu ở đây.
const BAN = 'kiemton-v1';
const VO = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(BAN).then(c => c.addAll(VO))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== BAN).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Vỏ app: ưu tiên mạng (để nhận bản mới), mất mạng thì dùng bản đã lưu
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(BAN).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
