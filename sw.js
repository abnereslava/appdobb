const CACHE_NAME = 'bebe-shell-v1';

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
  '/img/mamadeira.png',
  '/img/brinquedo.png',
  '/img/ursinhobem.png',
  '/img/ursinhodoente.png',
  '/img/curativo.png',
  '/img/cirurgia.png',
  '/img/hospital.png',
  '/img/calendario.png',
  '/img/agenda.png',
  '/img/remedios.png',
  '/img/termometro.png',
  '/img/relogio.png',
  '/img/caderneta.png',
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

self.addEventListener('fetch', event => {
  // Não interceptar requisições ao Firebase/Google — apenas arquivos estáticos
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
