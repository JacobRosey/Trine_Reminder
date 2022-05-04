let myCache = `myCache`

self.addEventListener('install', e => {
    console.log("Install!")
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["/", "/src/trine192.png"])
        })
    )
})

self.addEventListener("fetch", (e) => {
    console.log(`intercepting fetch request for: ${e.request.url}`);

    /*e.respondWith(
        caches.match(e.request).then((cacheRes) => {
            return cacheRes || fetch(e.request)
            .then(fetchRes => {
                let type = fetchResponse.headers.get('content-type');
                if(type && type.match(/^image\//i)){
                    //save image to cache
                    console.log(`saved image file ${e.request.url}`);
                    return caches.open(myCache).then((cache) => {
                        cache.put(e.request, fetchResponse.clone())
                        return fetchRes;
                    })
                }
            })
        })
    )*/
})

