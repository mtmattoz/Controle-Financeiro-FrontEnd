import { formatarMesAnoCurto, partesData } from './format';

/**
 * Cálculos locais feitos SOMENTE sobre dados reais retornados pela API.
 *
 * Regra usada em todo o app, idêntica ao RelatorioService do backend:
 *   entradas = receitas + transações ENTRADA
 *   saídas   = transações SAIDA
 */

export function noMes(item, mes, ano) {
  const p = partesData(item.data);
  return !!p && p.mes === mes && p.ano === ano;
}

/** Soma entradas/saídas de um conjunto de transações + receitas do MESMO período. */
export function resumir(transacoes = [], receitas = []) {
  let entradas = 0;
  let saidas = 0;
  for (const t of transacoes) {
    if (t.tipo === 'ENTRADA') entradas += t.valor;
    else saidas += t.valor;
  }
  for (const r of receitas) entradas += r.valor;
  return { entradas, saidas, resultado: entradas - saidas };
}

/** Lista dos últimos `quantidade` meses terminando em (mes, ano), do mais antigo ao mais novo. */
export function ultimosMeses(mes, ano, quantidade = 6) {
  const lista = [];
  for (let i = quantidade - 1; i >= 0; i -= 1) {
    const data = new Date(ano, mes - 1 - i, 1);
    lista.push({ mes: data.getMonth() + 1, ano: data.getFullYear() });
  }
  return lista;
}

const chaveMes = (ano, mes) => ano * 12 + (mes - 1);

/**
 * Série mensal para gráficos: entradas, saídas, resultado do mês e saldo
 * acumulado no fim de cada mês (somando todo o histórico até aquele mês).
 */
export function serieMensal(transacoes = [], receitas = [], meses = []) {
  const movimentos = [...transacoes, ...receitas];
  return meses.map(({ mes, ano }) => {
    const limite = chaveMes(ano, mes);
    let entradas = 0;
    let saidas = 0;
    let saldoAcumulado = 0;
    for (const m of movimentos) {
      const p = partesData(m.data);
      if (!p) continue;
      const k = chaveMes(p.ano, p.mes);
      const sinal = m.tipo === 'ENTRADA' ? 1 : -1;
      if (k <= limite) saldoAcumulado += sinal * m.valor;
      if (k === limite) {
        if (sinal > 0) entradas += m.valor;
        else saidas += m.valor;
      }
    }
    return {
      rotulo: formatarMesAnoCurto(mes, ano),
      mes,
      ano,
      entradas,
      saidas,
      resultado: entradas - saidas,
      saldoAcumulado,
    };
  });
}

/** Resultado acumulado dia a dia dentro de um mês (para gráfico de linha). */
export function serieDiaria(transacoes = [], receitas = [], mes, ano) {
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const porDia = Array.from({ length: diasNoMes }, () => ({ entradas: 0, saidas: 0 }));
  for (const m of [...transacoes, ...receitas]) {
    const p = partesData(m.data);
    if (!p || p.mes !== mes || p.ano !== ano) continue;
    if (m.tipo === 'ENTRADA') porDia[p.dia - 1].entradas += m.valor;
    else porDia[p.dia - 1].saidas += m.valor;
  }
  let acumulado = 0;
  return porDia.map((d, i) => {
    acumulado += d.entradas - d.saidas;
    return { dia: String(i + 1).padStart(2, '0'), entradas: d.entradas, saidas: d.saidas, acumulado };
  });
}

/** Agrupa transações SAIDA por categoria → [{ nome, valor }] do maior para o menor. */
export function despesasPorCategoria(transacoes = []) {
  const mapa = new Map();
  for (const t of transacoes) {
    if (t.tipo !== 'SAIDA') continue;
    const nome = t.categoria?.nome || 'Sem categoria';
    mapa.set(nome, (mapa.get(nome) || 0) + t.valor);
  }
  return [...mapa.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
}

/** Ordena movimentações da mais recente para a mais antiga. */
export function ordenarPorData(lista = []) {
  return [...lista].sort((a, b) => {
    if (a.data !== b.data) return a.data < b.data ? 1 : -1;
    return String(b.criadoEm ?? '').localeCompare(String(a.criadoEm ?? ''));
  });
}
