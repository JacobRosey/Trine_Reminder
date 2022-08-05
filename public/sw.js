var cacheName = 'v4';
var cacheFiles = [
    './',
    '/index.html',
    '/src/styles.css',
    '/src/trine192.png'
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
    
    e.waitUntil(

        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.map((thisCacheName => {
                if(thisCacheName !== cacheName){
                    console.log("Service Worker is removing cached files from ", thisCacheName)
                    return caches.delete(thisCacheName)
                }
            })))
        })
    )
})

self.addEventListener('fetch', (e) => {
    console.log("Service Worker Fetching", e.request.url)

})


