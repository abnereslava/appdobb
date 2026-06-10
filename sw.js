const CACHE_NAME = 'bebe-shell-v11';

// SDK do Firebase servido pelo CDN do Google. Precisa ficar em cache para o
// app conseguir abrir offline (sem ele, os imports ESM falham e o app trava
// na tela de carregamento).
const FIREBASE_CDN = 'https://www.gstatic.com/firebasejs/';

const SHELL_FILES = [
  './',
  './index.html',
  './admin.html',
  './style.css',
  './app.js',
  './admin.js',
  './auth.js',
  './firebase-config.js',
  './firestore-api.js',
  './manifest.json',
  './img/logo.png',
  './img/logo-180.png',
  './img/logo-192.png',
  './img/logo-512.png',
  './img/mamadeira.png',
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
  if (event.request.method !== 'GET') return;

  const reqUrl = event.request.url;

  // SDK do Firebase (CDN gstatic): cache-first. Cada chunk ESM é guardado na
  // primeira vez que carrega (online), permitindo abrir o app depois offline.
  if (reqUrl.startsWith(FIREBASE_CDN)) {
    event.respondWith(
      caches.match(event.request).then(cacheado => {
        if (cacheado) return cacheado;
        return fetch(event.request).then(resp => {
          if (resp && resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return resp;
        });
      })
    );
    return;
  }

  // Demais origens externas (Google Fonts, API do Firestore): deixa passar.
  const url = new URL(reqUrl);
  if (url.origin !== location.origin) return;

  // Mesma origem: network-first; cai no cache quando offline.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cacheado = await caches.match(event.request);
        if (cacheado) return cacheado;
        // Navegação offline sem correspondência exata → serve o app shell.
        if (event.request.mode === 'navigate') {
          return (await caches.match('./index.html')) || (await caches.match('./'));
        }
        return Response.error();
      })
  );
});
