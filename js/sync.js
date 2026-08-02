// Tenta sincronizar a fila local sempre que: a página carrega,
// a conexão volta (evento 'online'), ou a cada 20s como reforço.

let sincronizando = false;

async function sincronizarFila() {
  if (sincronizando) return;
  if (!navigator.onLine) { _atualizarFaixa(); return; }

  sincronizando = true;
  try {
    const fila = await listarFila();
    _atualizarFaixa(fila.length);

    for (const item of fila) {
      try {
        const resp = await chamarAPI(item.action, item.payload);
        if (resp.ok) {
          await removerDaFila(item.uuid);
        }
      } catch (e) {
        // sem sinal ou erro de rede: para o loop, tenta de novo depois
        break;
      }
    }
  } finally {
    sincronizando = false;
    const restante = await listarFila();
    _atualizarFaixa(restante.length);
  }
}

function _atualizarFaixa(pendentes) {
  const faixa = document.getElementById('faixaSync');
  if (!faixa) return;

  if (!navigator.onLine) {
    faixa.textContent = pendentes ? `Sem sinal — ${pendentes} registro(s) aguardando envio` : 'Sem sinal — os toques continuam sendo salvos no aparelho';
    faixa.className = 'faixa-sync visivel offline';
  } else if (pendentes > 0) {
    faixa.textContent = `Sincronizando ${pendentes} registro(s)...`;
    faixa.className = 'faixa-sync visivel';
  } else {
    faixa.className = 'faixa-sync';
  }
}

window.addEventListener('online', sincronizarFila);
window.addEventListener('offline', () => _atualizarFaixa());
setInterval(sincronizarFila, 20000);
document.addEventListener('DOMContentLoaded', sincronizarFila);
