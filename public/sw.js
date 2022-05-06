var cacheName = 'v1';
var cacheFiles = [
    './',
    './index.html',
    './src/app.js',
    './src/styles.css',
    './index.js',
    '/src/trine192.png'
]

self.addEventListener('install', e => {
    console.log("Install!")
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log("ServiceWorker is caching cacheFiles")
            return cache.addAll(cacheFiles)
        })
    )
})


