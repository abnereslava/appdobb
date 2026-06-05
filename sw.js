const CACHE_NAME = 'bebe-shell-v4';

const SHELL_FILES = [
  '/',
  '/index.html',
  '/admin.html',
  '/style.css',
  '/app.js',
  '/admin.js',
  '/auth.js',
  '/firebase-config.js',
  '/firestore-api.js',
  '/manifest.json',
  '/img/logo.png',
  '/img/logo-180.png',
  '/img/logo-192.png',
  '/img/logo-512.png',
  '/img/mamadeira.png',
  '/img/brinquedo.png',
  '/img/ursinhobem.png',
  '/img/termometro.png',
  '/img/curativo.png',
  '/img/cirurgia.png',
  '/img/calendario.png',
  '/img/agenda.png',
  '/img/alergia.png',
  '/img/vacina.png',
  '/img/outro.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network-first (web-first)
// Sempre tenta a rede primeiro; só usa o cache se offline ou erro de rede.
// Recursos de terceiros (Firebase, CDN) são ignorados.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignora requisições a origens externas (Firebase, Google Fonts, CDN)
  if (url.origin !== location.origin) return;

  // Ignora métodos não-GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Atualiza o cache com a resposta mais recente da rede
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: serve do cache
        return caches.match(event.request);
      })
  );
});
