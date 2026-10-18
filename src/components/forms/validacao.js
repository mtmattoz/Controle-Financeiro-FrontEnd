/**
 * Validações espelhando as anotações das entidades do backend,
 * para o usuário ver o erro antes mesmo de enviar.
 */

export function validarValor(valor) {
  if (valor === '' || valor === null || valor === undefined) return 'Informe o valor.';
  const numero = Number(String(valor).replace(',', '.'));
  if (!Number.isFinite(numero)) return 'Valor inválido.';
  if (numero <= 0) return 'O valor deve ser maior que zero.';
  if (numero >= 1e10) return 'Valor muito alto.'; // precision 12, scale 2
  return null;
}

export const paraNumeroDoFormulario = (valor) => Math.round(Number(String(valor).replace(',', '.')) * 100) / 100;

export function validarDescricao(texto, maximo) {
  const limpo = String(texto ?? '').trim();
  if (!limpo) return 'Informe a descrição.';
  if (limpo.length > maximo) return `Use no máximo ${maximo} caracteres.`;
  return null;
}

export function validarData(data) {
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return 'Informe a data.';
  return null;
}

/** Transacao: descricao ≤150, valor >0, tipo ENTRADA|SAIDA, data, categoria obrigatória (vai na URL). */
export function validarTransacao(f) {
  const erros = {};
  const descricao = validarDescricao(f.descricao, 150);
  if (descricao) erros.descricao = descricao;
  const valor = validarValor(f.valor);
  if (valor) erros.valor = valor;
  if (f.tipo !== 'ENTRADA' && f.tipo !== 'SAIDA') erros.tipo = 'Escolha entrada ou saída.';
  const data = validarData(f.data);
  if (data) erros.data = data;
  if (!f.categoriaId) erros.categoriaId = 'Escolha uma categoria.';
  return erros;
}

/** Receita: descricao ≤100, valor >0, data. */
export function validarReceita(f) {
  const erros = {};
  const descricao = validarDescricao(f.descricao, 100);
  if (descricao) erros.descricao = descricao;
  const valor = validarValor(f.valor);
  if (valor) erros.valor = valor;
  const data = validarData(f.data);
  if (data) erros.data = data;
  return erros;
}

/** Junta erros de campo vindos do backend (400) com os nomes do formulário. */
export function errosDoServidor(erro) {
  return erro?.fieldErrors ? { ...erro.fieldErrors } : {};
}
