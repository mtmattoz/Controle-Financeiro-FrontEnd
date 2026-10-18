import { formatarData } from './format';

/**
 * Exportação feita no navegador, a partir dos dados reais já carregados.
 * Não existe endpoint de exportação no backend.
 */
export function exportarMovimentacoesCsv(itens, nomeArquivo) {
  const escapar = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;
  const linhas = [
    ['Data', 'Origem', 'Tipo', 'Descrição', 'Categoria', 'Valor'],
    ...itens.map((m) => [
      formatarData(m.data),
      m.origem === 'receita' ? 'Receita' : 'Transação',
      m.tipo === 'ENTRADA' ? 'Entrada' : 'Saída',
      m.descricao,
      m.categoria?.nome ?? '',
      (m.tipo === 'ENTRADA' ? m.valor : -m.valor).toFixed(2).replace('.', ','),
    ]),
  ];
  // ";" e BOM para o Excel em português abrir com acentos e colunas corretas.
  const conteudo = '﻿' + linhas.map((l) => l.map(escapar).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
