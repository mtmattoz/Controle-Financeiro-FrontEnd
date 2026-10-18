import { getSemDuplicar, garantirLista, garantirObjeto, id, paraNumero } from './api';
import { normalizarTransacao } from './transacaoService';

/**
 * RelatorioController — @RequestMapping("/relatorio")
 *
 * Significado real dos campos (conferido no RelatorioService):
 *  - entradas = soma de TODAS as receitas + transações do tipo ENTRADA (todo o período)
 *  - saidas   = soma das transações do tipo SAIDA (todo o período)
 *  - saldo    = entradas − saidas
 *  - /mes      → somente transações (receitas NÃO entram nessa lista)
 *  - /categorias → soma das transações SAIDA agrupadas pelo nome da categoria (todo o período)
 */

/** GET /relatorio/usuario/{usuarioId} → { entradas, saidas, saldo } */
export async function resumo(usuarioId) {
  const data = await getSemDuplicar(`/relatorio/usuario/${id(usuarioId)}`);
  garantirObjeto(data, 'resumo financeiro');
  return {
    entradas: paraNumero(data.entradas),
    saidas: paraNumero(data.saidas),
    saldo: paraNumero(data.saldo),
  };
}

/** GET /relatorio/usuario/{usuarioId}/mes?mes={1-12}&ano={aaaa} → Transacao[] */
export async function transacoesDoMes(usuarioId, mes, ano) {
  const data = await getSemDuplicar(`/relatorio/usuario/${id(usuarioId)}/mes`, { params: { mes, ano } });
  return garantirLista(data, 'transações do mês').map(normalizarTransacao);
}

/**
 * GET /relatorio/usuario/{usuarioId}/categorias → { "NomeCategoria": valor, ... }
 * Retorna [{ nome, valor }] ordenado do maior para o menor.
 */
export async function despesasPorCategoria(usuarioId) {
  const data = await getSemDuplicar(`/relatorio/usuario/${id(usuarioId)}/categorias`);
  garantirObjeto(data, 'despesas por categoria');
  return Object.entries(data)
    .map(([nome, valor]) => ({ nome, valor: paraNumero(valor) }))
    .filter((item) => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}
