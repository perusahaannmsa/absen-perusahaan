// Service Worker for Absen Harian NMSA (PWA)
const CACHE_NAME = "nmsa-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/logo-nmsa.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Cache addAll notice:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Let API calls and external services pass through to network
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.origin !== self.origin) {
    return;
  }

  // Network-first with cache fallback for static navigation/assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});
