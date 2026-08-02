const CACHE_NOME = 'rota-simples-v2';
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

// Estratégia: REDE PRIMEIRO. Sempre tenta buscar a versão mais nova
// no GitHub Pages; só usa a cópia salva se estiver sem sinal. Isso evita
// o problema de "atualizei o arquivo mas o celular continua mostrando
// a versão antiga" — o app só usa o cache como plano B, nunca como
// primeira opção.
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    fetch(evento.request)
      .then((respostaRede) => {
        const copia = respostaRede.clone();
        caches.open(CACHE_NOME).then((cache) => cache.put(evento.request, copia));
        return respostaRede;
      })
      .catch(() => caches.match(evento.request))
  );
});
