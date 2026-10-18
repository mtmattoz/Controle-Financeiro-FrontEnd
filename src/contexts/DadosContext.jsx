import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * "Versão" dos dados financeiros. Sempre que uma operação é confirmada pelo
 * servidor (cadastro ou exclusão), chamamos `notificarAlteracao()` e todas as
 * telas abertas recarregam seus dados, sem recarregar a página.
 */

const DadosContext = createContext(null);

export function DadosProvider({ children }) {
  const [versao, setVersao] = useState(0);
  const notificarAlteracao = useCallback(() => setVersao((v) => v + 1), []);
  const valor = useMemo(() => ({ versao, notificarAlteracao }), [versao, notificarAlteracao]);
  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>;
}

export function useDados() {
  const contexto = useContext(DadosContext);
  if (!contexto) throw new Error('useDados deve ser usado dentro de <DadosProvider>.');
  return contexto;
}
