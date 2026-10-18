import api, { getSemDuplicar, garantirLista, garantirObjeto, id } from './api';

/**
 * CategoriaController — @RequestMapping("/categoria")
 * Entidade Categoria (JSON): { id, nome, criadoEm }  — "usuario" é @JsonIgnore.
 * Não existe rota de edição nem de consulta individual.
 */

export function normalizarCategoria(c) {
  return { id: c.id, nome: String(c.nome ?? ''), criadoEm: c.criadoEm ?? null };
}

/** GET /categoria/usuario/{usuarioId} → Categoria[] */
export async function listar(usuarioId) {
  const data = await getSemDuplicar(`/categoria/usuario/${id(usuarioId)}`);
  return garantirLista(data, 'categorias').map(normalizarCategoria);
}

/**
 * POST /categoria/cadastrar/{usuarioId}
 * Corpo: { nome }  (obrigatório, até 50 caracteres no banco)
 * Resposta 200: Categoria
 */
export async function cadastrar(usuarioId, nome) {
  const { data } = await api.post(`/categoria/cadastrar/${id(usuarioId)}`, { nome });
  return normalizarCategoria(garantirObjeto(data, 'categoria', ['id', 'nome']));
}

/**
 * DELETE /categoria/{id}/usuario/{usuarioId}
 * Resposta 204 sem corpo.
 * Erros: 403 se a categoria for de outro usuário · 500 se houver transações
 * vinculadas (violação de chave estrangeira não tratada no backend).
 */
export async function excluir(categoriaId, usuarioId) {
  await api.delete(`/categoria/${id(categoriaId)}/usuario/${id(usuarioId)}`);
}
