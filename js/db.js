// Fila local de eventos e fotos pendentes de sincronização.
// Cada item guarda: uuid, action, payload, tentativas, criadoEm.

const DB_NOME = 'rota_simples_db';
const DB_VERSAO = 1;

function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOME, DB_VERSAO);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('filaEventos')) {
        db.createObjectStore('filaEventos', { keyPath: 'uuid' });
      }
      if (!db.objectStoreNames.contains('cacheRota')) {
        db.createObjectStore('cacheRota', { keyPath: 'idRota' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function enfileirarEvento(item) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('filaEventos', 'readwrite');
    tx.objectStore('filaEventos').put({ ...item, tentativas: 0, criadoEm: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function listarFila() {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('filaEventos', 'readonly');
    const req = tx.objectStore('filaEventos').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function removerDaFila(uuid) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('filaEventos', 'readwrite');
    tx.objectStore('filaEventos').delete(uuid);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function salvarCacheRota(idRota, dados) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cacheRota', 'readwrite');
    tx.objectStore('cacheRota').put({ idRota, dados, salvoEm: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function lerCacheRota(idRota) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cacheRota', 'readonly');
    const req = tx.objectStore('cacheRota').get(idRota);
    req.onsuccess = () => resolve(req.result ? req.result.dados : null);
    req.onerror = () => reject(req.error);
  });
}

function gerarUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
