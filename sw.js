const CACHE_NAME = "koora4k_v3";
const STATIC_ASSETS = [
  "/",
  "/css/style.css",
  "/data/defaultData.js",
  "/js/app.js",
  "/assets/favicon.svg",
  "/assets/logo-emblem.jpg",
  "/assets/logo.svg"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Let the browser handle network requests directly with Edge CDN
  return;
});
