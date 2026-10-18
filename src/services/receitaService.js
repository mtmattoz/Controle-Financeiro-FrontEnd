import api, { getSemDuplicar, garantirLista, garantirObjeto, id, paraNumero } from './api';
import { paraDataISO } from '../utils/format';

/**
 * ReceitaController — @RequestMapping("/receita")
 * Entidade Receita (JSON): { id, descricao, valor, data, criadoEm }
 * Diferente de Transacao: receita NÃO tem categoria nem tipo.
 * Não existe rota de edição nem de consulta individual.
 */

export function normalizarReceita(r) {
  return {
    id: r.id,
    origem: 'receita',
    descricao: String(r.descricao ?? ''),
    valor: paraNumero(r.valor),
    tipo: 'ENTRADA',
    data: paraDataISO(r.data),
    categoria: null,
    criadoEm: r.criadoEm ?? null,
  };
}

/** GET /receita/usuario/{usuarioId} → Receita[] */
export async function listar(usuarioId) {
  const data = await getSemDuplicar(`/receita/usuario/${id(usuarioId)}`);
  return garantirLista(data, 'receitas').map(normalizarReceita);
}

/**
 * POST /receita/cadastrar/{usuarioId}
 * Corpo: { descricao, valor, data }  (descrição até 100, valor > 0, data obrigatória)
 * Resposta 200: Receita
 */
export async function cadastrar(usuarioId, { descricao, valor, data }) {
  const corpo = { descricao: descricao.trim(), valor: Number(valor), data };
  const { data: resposta } = await api.post(`/receita/cadastrar/${id(usuarioId)}`, corpo);
  return normalizarReceita(garantirObjeto(resposta, 'receita', ['id']));
}

/** DELETE /receita/{id}/usuario/{usuarioId} → 204 */
export async function excluir(receitaId, usuarioId) {
  await api.delete(`/receita/${id(receitaId)}/usuario/${id(usuarioId)}`);
}
