import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import NovaMovimentacaoModal from '../components/forms/NovaMovimentacaoModal';

/**
 * Permite abrir o modal de "Nova movimentação" de qualquer lugar
 * (cabeçalho, dashboard, páginas). Modos: 'SAIDA' | 'ENTRADA' | 'RECEITA'.
 */

const NovaMovimentacaoContext = createContext(null);

export function NovaMovimentacaoProvider({ children }) {
  const [modo, setModo] = useState(null);

  const abrir = useCallback((novoModo = 'SAIDA') => setModo(novoModo), []);
  const fechar = useCallback(() => setModo(null), []);
  const valor = useMemo(() => ({ abrir }), [abrir]);

  return (
    <NovaMovimentacaoContext.Provider value={valor}>
      {children}
      <NovaMovimentacaoModal modo={modo} onTrocarModo={setModo} onFechar={fechar} />
    </NovaMovimentacaoContext.Provider>
  );
}

export function useNovaMovimentacao() {
  const contexto = useContext(NovaMovimentacaoContext);
  if (!contexto) throw new Error('useNovaMovimentacao deve ser usado dentro de <NovaMovimentacaoProvider>.');
  return contexto;
}
