var cacheName = 'v1';
var cacheFiles = [
    './',
    './public/index.html',
    './public/src/app.js',
    './public/src/styles.css',
    './index.js',
    './src/trine192.png'
]

self.addEventListener('install', e => {
    console.log("Install!")
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log("ServiceWorker is caching cacheFiles");
            return cache.addAll(cacheFiles)
        })
    )
})

self.addEventListener('activate', (e) => {
    console.log("Service Worker activated")
})

self.addEventListener('fetch', (e) => {
    console.log("Service Worker Fetching", e.request.url)
})


