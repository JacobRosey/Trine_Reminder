self.addEventListener('install', e => {
    console.log("Install!")
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["./", "./src/trine192.png"])
        })
    )
})

