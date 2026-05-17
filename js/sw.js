// ============================================
//   YASEERTECH - SERVICE WORKER (sw.js)
//   Enables offline support and app install
// ============================================

const CACHE_NAME = "yaseertech-v1";

const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/about.html",
    "/services.html",
    "/contact.html",
    "/login.html",
    "/css/style.css",
    "/css/erp.css",
    "/js/main.js",
    "/js/erp.js",
    "/manifest.json",
    "/images/logo.png",
    "/images/hero-bg.jpg",
    "/images/about-team.jpg",
    "/images/services-bg.jpg",
    "/images/person-1.jpg",
    "/images/person-2.jpg",
    "/images/person-3.jpg"
];

// ========================
// INSTALL — cache all assets
// ========================
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ========================
// ACTIVATE — clean old caches
// ========================
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ========================
// FETCH — serve from cache, fall back to network
// ========================
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                // Cache new requests dynamically
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clone);
                });
                return response;
            });
        }).catch(() => {
            // Offline fallback — show homepage
            return caches.match("/index.html");
        })
    );
});
