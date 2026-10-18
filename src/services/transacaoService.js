import api, { getSemDuplicar, garantirLista, garantirObjeto, id, paraNumero } from './api';
import { normalizarCategoria } from './categoriaService';
import { paraDataISO } from '../utils/format';

/**
 * TransacaoController — @RequestMapping("/transacao")
 * Entidade Transacao (JSON): { id, descricao, valor, tipo, data, categoria: { id, nome, criadoEm }, criadoEm }
 * "tipo" só aceita "ENTRADA" ou "SAIDA" (@Pattern). Não existe rota de edição nem de consulta individual.
 */

export const TIPOS = ['ENTRADA', 'SAIDA'];

export function normalizarTransacao(t) {
  return {
    id: t.id,
    origem: 'transacao',
    descricao: String(t.descricao ?? ''),
    valor: paraNumero(t.valor),
    tipo: t.tipo === 'ENTRADA' ? 'ENTRADA' : 'SAIDA',
    data: paraDataISO(t.data),
    categoria: t.categoria ? normalizarCategoria(t.categoria) : null,
    criadoEm: t.criadoEm ?? null,
  };
}

const normalizarLista = (data) => garantirLista(data, 'transações').map(normalizarTransacao);

/** GET /transacao/usuario/{usuarioId} → Transacao[] */
export async function listar(usuarioId) {
  return normalizarLista(await getSemDuplicar(`/transacao/usuario/${id(usuarioId)}`));
}

/** GET /transacao/usuario/{usuarioId}/categoria/{categoriaId} → Transacao[] */
export async function listarPorCategoria(usuarioId, categoriaId) {
  return normalizarLista(await getSemDuplicar(`/transacao/usuario/${id(usuarioId)}/categoria/${id(categoriaId)}`));
}

/** GET /transacao/usuario/{usuarioId}/tipo/{tipo} → Transacao[]  (tipo: ENTRADA | SAIDA) */
export async function listarPorTipo(usuarioId, tipo) {
  if (!TIPOS.includes(tipo)) throw new Error('Tipo inválido.');
  return normalizarLista(await getSemDuplicar(`/transacao/usuario/${id(usuarioId)}/tipo/${id(tipo)}`));
}

/**
 * POST /transacao/cadastrar/{usuarioId}/{categoriaId}
 * Corpo: { descricao, valor, tipo, data }
 *   - descricao: obrigatória (até 150)
 *   - valor: obrigatório, > 0
 *   - tipo: "ENTRADA" | "SAIDA"
 *   - data: "AAAA-MM-DD"
 * Usuário e categoria são associados pelos parâmetros da URL (não pelo corpo).
 * Resposta 200: Transacao
 */
export async function cadastrar(usuarioId, categoriaId, { descricao, valor, tipo, data }) {
  const corpo = { descricao: descricao.trim(), valor: Number(valor), tipo, data };
  const { data: resposta } = await api.post(
    `/transacao/cadastrar/${id(usuarioId)}/${id(categoriaId)}`,
    corpo,
  );
  return normalizarTransacao(garantirObjeto(resposta, 'transação', ['id']));
}

/**
 * DELETE /transacao/{id}/usuario/{usuarioId}
 * Resposta 204. Erros: 403 (outro usuário) · 500 (não encontrada).
 */
export async function excluir(transacaoId, usuarioId) {
  await api.delete(`/transacao/${id(transacaoId)}/usuario/${id(usuarioId)}`);
}
