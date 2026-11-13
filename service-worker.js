const CACHE_NAME = 'weather-app-v2';
const APP_SHELL = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './app-icon-180.png',
    './app-icon-192.png',
    './app-icon-512.png',
    './app-icon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith('weather-app-') && cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const scopeUrl = new URL(self.registration.scope);
    const cachedPaths = new Set(APP_SHELL.map((asset) => new URL(asset, scopeUrl).pathname));

    if (request.method !== 'GET' || !cachedPaths.has(new URL(request.url).pathname)) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (!response.ok) {
                    return response;
                }

                const responseToCache = response.clone();
                return caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, responseToCache))
                    .then(() => response);
            })
            .catch(async () => {
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                if (request.mode === 'navigate') {
                    const appEntry = await caches.match(new URL('./index.html', scopeUrl).href);
                    if (appEntry) {
                        return appEntry;
                    }
                }

                return Response.error();
            })
    );
});
