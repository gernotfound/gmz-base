const CACHE_NAME = 'non-ho-mai-v1.5';

// Lista dei file essenziali locali da salvare subito per l'uso offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './data_hot.js',
    './data_love.js',
    './data_situazioni.js',
    './data_imbarazzo.js',
    './data_social.js',
    './data_confini.js',
    './manifest.json'
];

// Fase di Installazione: salva i file locali nella cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache creata con successo: ' + CACHE_NAME);
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    // Forza l'installazione del nuovo service worker senza aspettare
    self.skipWaiting();
});

// Fase di Attivazione: elimina rigorosamente le vecchie versioni della cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminazione vecchia cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Prende immediatamente il controllo della pagina e delle richieste di rete
    self.clients.claim();
});

// Fase di Fetch: intercetta le richieste di rete (Cache-First strategy + Dynamic Caching CDN)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // 1. Se il file (locale o CDN) è già nella cache, usalo istantaneamente
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // 2. Se non è in cache, vallo a prendere su internet
                return fetch(event.request).then(networkResponse => {
                    
                    // Controllo validità della risposta.
                    // Accettiamo type 'basic' (file nostri) e type 'opaque' (file esterni CDN senza CORS, es. Google Fonts)
                    if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
                        return networkResponse;
                    }

                    // Clona la risposta perché lo stream può essere consumato una sola volta
                    const responseToCache = networkResponse.clone();
                    
                    // Salva la risorsa (es. Tailwind o un Font) in cache dinamicamente per il futuro
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // Filtro di sicurezza per evitare di cacciare richieste non supportate (es. estensioni chrome)
                            if (event.request.url.startsWith('http')) {
                                cache.put(event.request, responseToCache);
                            }
                        });

                    return networkResponse;
                }).catch(() => {
                    // 3. Fallback nel caso in cui siamo offline e il file non è in cache.
                    console.log('Sei offline e la risorsa non è in cache:', event.request.url);
                });
            })
    );
});