const CACHE_NOME = 'rota-simples-v1';
const ARQUIVOS_SHELL = [
  './motorista.html',
  './css/style.css',
  './js/api.js',
  './js/db.js',
  './js/sync.js',
  './manifest.json'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NOME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Estratégia: cache primeiro pro "shell" do app (HTML/CSS/JS).
// Chamadas de API (POST pro Apps Script) sempre vão direto pra rede -
// não fazem sentido em cache, e se falharem é a fila do IndexedDB que assume.
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    caches.match(evento.request).then((respostaCache) => {
      return respostaCache || fetch(evento.request).catch(() => respostaCache);
    })
  );
});
