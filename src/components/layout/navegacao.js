import {
  LayoutDashboard, ArrowLeftRight, Wallet, Tags, ChartColumn, Sparkles, Settings,
} from 'lucide-react';

/** Itens do menu e títulos das páginas (usados pela sidebar e pelo cabeçalho). */
export const ITENS_MENU = [
  { caminho: '/', rotulo: 'Dashboard', icone: LayoutDashboard, descricao: 'Visão geral das suas finanças' },
  { caminho: '/transacoes', rotulo: 'Transações', icone: ArrowLeftRight, descricao: 'Entradas e saídas por categoria' },
  { caminho: '/receitas', rotulo: 'Receitas', icone: Wallet, descricao: 'Dinheiro que entrou' },
  { caminho: '/categorias', rotulo: 'Categorias', icone: Tags, descricao: 'Organize suas transações' },
  { caminho: '/relatorios', rotulo: 'Relatórios', icone: ChartColumn, descricao: 'Análise mensal detalhada' },
  { caminho: '/assistente', rotulo: 'Assistente IA', icone: Sparkles, descricao: 'Registre movimentações escrevendo' },
  { caminho: '/configuracoes', rotulo: 'Perfil e configurações', icone: Settings, descricao: 'Sua conta e a conexão com a API' },
];

export function paginaAtual(pathname) {
  return ITENS_MENU.find((item) => item.caminho === pathname) ?? ITENS_MENU[0];
}
