// PREENCHA com a URL do Web App publicado (Implantar > Nova implantação > Executar como você > Acesso: Qualquer pessoa)
const API_URL = 'https://script.google.com/macros/s/AKfycbw0jHQb7OgHLc1wqTsVaXmYBgGIIIg5nYgNqcNpNqsKHB09tokcJ-24gaFCR0OBb019/exec';

/**
 * Chama a API do Apps Script.
 * Usa Content-Type: text/plain de propósito: isso faz o navegador tratar
 * a requisição como "simple request" e NÃO disparar o preflight de CORS
 * (que o Apps Script não responde direito). O Apps Script lê o corpo cru
 * em e.postData.contents normalmente, então funciona nos dois lados.
 */
async function chamarAPI(action, payload) {
  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload: payload || {} })
  });
  if (!resposta.ok) throw new Error('Falha de rede: ' + resposta.status);
  return resposta.json();
}

function sessaoAtual() {
  const bruto = localStorage.getItem('rota_simples_sessao');
  return bruto ? JSON.parse(bruto) : null;
}

function salvarSessao(sessao) {
  localStorage.setItem('rota_simples_sessao', JSON.stringify(sessao));
}

function encerrarSessao() {
  localStorage.removeItem('rota_simples_sessao');
  location.href = 'index.html';
}

function exigirSessao(perfilEsperado) {
  const s = sessaoAtual();
  if (!s) { location.href = 'index.html'; return null; }
  if (perfilEsperado && s.perfil !== perfilEsperado && s.perfil !== 'MASTER') {
    location.href = 'index.html';
    return null;
  }
  return s;
}
