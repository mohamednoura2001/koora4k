const CACHE_NAME = "koora4k_v1";
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
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Never cache live APIs, streaming segments, or admin POST requests
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.endsWith(".m3u8") ||
    url.pathname.endsWith(".ts") ||
    e.request.method !== "GET"
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
