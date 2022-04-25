self.addEventListener('install', e => {
    console.log("Install!")
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["https://trine-scraper.herokuapp.com/", "./src/trine192.png"])
        })
    )
})

