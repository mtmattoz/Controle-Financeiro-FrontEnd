import {
  Briefcase, Car, Gamepad2, GraduationCap, HeartPulse, House, PawPrint, Plane, Receipt,
  Shirt, ShoppingCart, Smartphone, Tag, TrendingUp, Tv, Utensils, Gift, Fuel,
} from 'lucide-react';
import { normalizarTexto } from './format';

/**
 * Ícone e cor das categorias são APENAS apresentação visual.
 * A entidade Categoria do backend só tem { id, nome, criadoEm } — nada disto é
 * salvo no banco. O ícone é escolhido por palavra-chave no nome e a cor é
 * derivada do nome, para ser sempre a mesma.
 */

export const PALETA_CATEGORIAS = [
  '#3b82f6', // azul
  '#8b5cf6', // roxo
  '#f59e0b', // laranja
  '#14b8a6', // turquesa
  '#ec4899', // rosa
  '#6366f1', // índigo
  '#0ea5e9', // céu
  '#f97316', // laranja forte
  '#a855f7', // violeta
  '#84cc16', // lima
];

const REGRAS = [
  [/aliment|comida|restaur|lanche|ifood|refei/, Utensils],
  [/mercad|supermerc|feira|compra/, ShoppingCart],
  [/combust|gasolina|posto/, Fuel],
  [/transport|uber|onibus|carro|taxi|metro|estaciona/, Car],
  [/casa|aluguel|moradia|condominio|lar/, House],
  [/saude|farmac|medic|academia|hospital|plano/, HeartPulse],
  [/lazer|divers|jogo|game|cinema|festa/, Gamepad2],
  [/educa|curso|escola|faculdade|livro|estudo/, GraduationCap],
  [/salario|renda|trabalho|freela|servico/, Briefcase],
  [/conta|luz|agua|energia|internet|telefone|boleto/, Receipt],
  [/assinatura|stream|netflix|spotify|tv/, Tv],
  [/viagem|passagem|hotel|turismo/, Plane],
  [/roupa|vestu|moda|calcado/, Shirt],
  [/pet|animal|veterin/, PawPrint],
  [/invest|poupan|reserva|acoes/, TrendingUp],
  [/celular|eletron|tecnolog/, Smartphone],
  [/presente|doacao/, Gift],
];

export function iconeDaCategoria(nome) {
  const texto = normalizarTexto(nome);
  const regra = REGRAS.find(([padrao]) => padrao.test(texto));
  return regra ? regra[1] : Tag;
}

export function corDaCategoria(nome) {
  const texto = normalizarTexto(nome);
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  return PALETA_CATEGORIAS[hash % PALETA_CATEGORIAS.length];
}
