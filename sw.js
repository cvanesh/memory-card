const CACHE_NAME = 'cosmic-match-v1';
const ASSETS = [
    '/memory-card/',
    '/memory-card/index.html',
    '/memory-card/css/style.css',
    '/memory-card/js/app.js',
    '/memory-card/js/game.js',
    '/memory-card/manifest.json',
    '/memory-card/assets/icons/icon-192.png',
    '/memory-card/assets/icons/icon-512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets');
                return cache.addAll(ASSETS);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request)
                    .then(fetchResponse => {
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, fetchResponse.clone());
                            return fetchResponse;
                        });
                    });
            })
            .catch(() => {
                // Return fallback for image requests
                if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
                    return caches.match('/assets/icons/icon-192.png');
                }
                return caches.match('/index.html');
            })
    );
});