// ============================================================
//   YASEERTECH SERVICE WORKER
//   Change CACHE_VERSION any time you update your website
//   to force ALL devices (phone, PWA, Firefox) to refresh
// ============================================================

const CACHE_VERSION = "yaseertech-v6";
const CACHE_FILES = [
  "/",
  "/index.html",
  "/about.html",
  "/services.html",
  "/contact.html",
  "/css/style.css",
  "/js/main.js",
  "/js/pwa.js",
  "/images/logo.png",
  "/manifest.json"
];

// ── INSTALL: cache all files ──
self.addEventListener("install", event => {
  // Force this service worker to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(CACHE_FILES))
  );
});

// ── ACTIVATE: delete ALL old caches ──
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});

// ── FETCH: network first, fall back to cache ──
// This ensures users always get the newest files when online
self.addEventListener("fetch", event => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip non-http requests (chrome-extension etc)
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Got fresh response from network — update cache
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — serve from cache (offline mode)
        return caches.match(event.request).then(cached => {
          return cached || new Response("You are offline. Please check your connection.", {
            status: 503,
            headers: { "Content-Type": "text/plain" }
          });
        });
      })
  );
});
