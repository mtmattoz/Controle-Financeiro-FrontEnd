/**
 * Formatação no padrão brasileiro (moeda BRL e datas dd/mm/aaaa).
 *
 * Datas do backend chegam como LocalDate ("2026-10-17"). Elas são tratadas como
 * texto para evitar o deslocamento de fuso que `new Date("2026-10-17")` causa
 * (seria interpretado como meia-noite UTC = dia anterior no Brasil).
 */

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaCompacta = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatarMoeda = (valor) => moeda.format(Number(valor) || 0);
export const formatarMoedaCompacta = (valor) => moedaCompacta.format(Number(valor) || 0);

export const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
export const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const doisDigitos = (n) => String(n).padStart(2, '0');

/**
 * Converte o que vier do backend em "AAAA-MM-DD".
 * Aceita "AAAA-MM-DD", "AAAA-MM-DDTHH:mm:ss..." e o formato de array [aaaa, mm, dd]
 * (caso o Jackson esteja configurado para serializar datas como array).
 */
export function paraDataISO(valor) {
  if (!valor) return '';
  if (Array.isArray(valor) && valor.length >= 3) {
    return `${valor[0]}-${doisDigitos(valor[1])}-${doisDigitos(valor[2])}`;
  }
  const texto = String(valor);
  const encontrado = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return encontrado ? `${encontrado[1]}-${encontrado[2]}-${encontrado[3]}` : '';
}

/** "2026-10-17" → { ano: 2026, mes: 10, dia: 17 } */
export function partesData(valor) {
  const iso = paraDataISO(valor);
  if (!iso) return null;
  const [ano, mes, dia] = iso.split('-').map(Number);
  return { ano, mes, dia };
}

export function formatarData(valor) {
  const p = partesData(valor);
  return p ? `${doisDigitos(p.dia)}/${doisDigitos(p.mes)}/${p.ano}` : '—';
}

/** "2026-10-17" → "17 out" */
export function formatarDataCurta(valor) {
  const p = partesData(valor);
  return p ? `${doisDigitos(p.dia)} ${MESES_CURTOS[p.mes - 1]}` : '—';
}

/** LocalDateTime → "18/10/2026" */
export function formatarDataHora(valor) {
  if (!valor) return '—';
  if (Array.isArray(valor)) return formatarData(valor);
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return formatarData(valor);
  return data.toLocaleDateString('pt-BR');
}

export const formatarMesAno = (mes, ano) => `${MESES[mes - 1]} de ${ano}`;
export const formatarMesAnoCurto = (mes, ano) => `${MESES_CURTOS[mes - 1]}/${String(ano).slice(2)}`;

export function hojeISO() {
  const agora = new Date();
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

export function mesAtual() {
  const agora = new Date();
  return { mes: agora.getMonth() + 1, ano: agora.getFullYear() };
}

/** Remove acentos e caixa, para comparar textos ("Alimentação" == "alimentacao"). */
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function iniciais(nome) {
  const partes = String(nome ?? '').trim().split(/[\s._-]+/).filter(Boolean);
  if (!partes.length) return '?';
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
}
