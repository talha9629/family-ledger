const CACHE_NAME = "talha-finance-v2";
const OFFLINE_URL = "/";

// Core assets that MUST be cached for offline functionality
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install - cache core assets immediately
self.addEventListener("install", (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.error('[Service Worker] Failed to cache:', error);
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener("activate", (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch - Cache-first strategy with network fallback
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension, blob, and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip API calls to Claude storage (if you're using window.storage)
  if (event.request.url.includes('/api/') || event.request.url.includes('storage')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If found in cache, return it
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', event.request.url);
        return cachedResponse;
      }

      // Not in cache, try to fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            // Clone the response as it can only be consumed once
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME).then((cache) => {
              // Cache the new resource
              cache.put(event.request, responseToCache);
              console.log('[Service Worker] Cached new resource:', event.request.url);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed AND not in cache
          console.log('[Service Worker] Offline - serving cached offline page');
          
          // For navigation requests, return the offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          
          // For other requests, return a generic offline response
          return new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
