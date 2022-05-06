var cacheName = 'v1';
var cacheFiles = [
    //One/some of these routes are wrong, fix pls
    './',
    '/index.html',
    '/src/app.js',
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

    e.respondWith(
        caches.match(e.request)
        .then((response => {
            if(response){
                console.log("Found in cache: ", e.request.url)
                return response
            } 
                var requestClone = e.request.clone()
                fetch(requestClone)
                .then((response => {
                    if(!response) {
                        console.log("No response")
                        return response;
                    } 

                    var responseClone = response.clone()
                    caches.open(cacheName)
                    .then((cache => {
                        cache.put(e.request, responseClone)
                        return response
                    }))
                }))
        })).catch((err)=> {
            console.log("Service worker encountered error: ", err)
        })
    )
})


