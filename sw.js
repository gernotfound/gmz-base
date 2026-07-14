// =========================================================================
// VERSIONE DELL'APPLICAZIONE
// =========================================================================
// Incrementa questo valore (es. '1.0.1', '1.0.2', etc.) ogni volta che
// modifichi il codice di un file per forzare l'aggiornamento sui telefoni.
const APP_VERSION = '1.1.0'; 
const CACHE_NAME = `gmz-base-${APP_VERSION}`;
// =========================================================================

// Lista delle risorse principali da salvare offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    
    // Risorse di "Non Ho Mai"
    './non-ho-mai/index.html',
    './non-ho-mai/style.css',
    './non-ho-mai/app.js',
    './non-ho-mai/data_hot.js',
    './non-ho-mai/data_love.js',
    './non-ho-mai/data_situazioni.js',
    './non-ho-mai/data_imbarazzo.js',
    './non-ho-mai/data_social.js',
    './non-ho-mai/data_confini.js',
    
    // Risorse di "Forza 4"
    './forza4/index.html',
    './forza4/style.css',
    './forza4/app.js'
];

// FASE DI INSTALLAZIONE: Salva i file in cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log(`[GMZ Service Worker] Cache creata per la versione: ${APP_VERSION}`);
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    // Non forziamo più skipWaiting() automaticamente all'installazione,
    // lasciamo che l'utente accetti l'aggiornamento dalla notifica a schermo.
});

// FASE DI ATTIVAZIONE: Rimuove le cache obsolete
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[GMZ Service Worker] Rimossa vecchia cache obsoleta:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// ASCOLTO DEL MESSAGGIO DI AGGIORNA: Forza il rimpiazzo quando richiesto dall'utente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// INTERCETTAZIONE RICHIESTE: Strategia Cache-First con recupero CDN
self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(() => {
                    console.log('[GMZ Service Worker] Risorsa offline non disponibile:', event.request.url);
                });
            })
    );
});