// Service worker: lưu sẵn giao diện app (trang + icon) để mở nhanh, cài được như app.
// Dữ liệu vẫn đọc/ghi Google Sheet qua Apps Script (POST tới /exec) — không lưu ở đây.
const BAN = 'kiemton-v2'; // v2: giao diện chạy thẳng trên GitHub Pages
const VO = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(BAN).then(c => c.addAll(VO))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== BAN).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Giao diện: ưu tiên mạng (nhận bản mới), mạng chậm >3 giây hoặc mất mạng thì dùng bản đã lưu
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const mang = fetch(e.request).then(r => { const c = r.clone(); caches.open(BAN).then(x => x.put(e.request, c)); return r; });
  const cho = new Promise(ok => setTimeout(ok, 3000)).then(() => caches.match(e.request));
  e.respondWith(Promise.race([mang, cho]).then(r => r || mang).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
