import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useDados } from '../contexts/DadosContext';
import { mensagemDeErro } from '../services/api';

/**
 * Fluxo de exclusão com confirmação: escolher item → confirmar → chamar a API →
 * só então mostrar sucesso e atualizar as telas.
 *
 * @param {(item) => Promise<void>} excluir
 * @param {{ sucesso: (item) => string, contextoErro?: Record<number,string> }} mensagens
 */
export function useExclusao(excluir, { sucesso, contextoErro } = {}) {
  const toast = useToast();
  const { notificarAlteracao } = useDados();
  const [alvo, setAlvo] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    if (!alvo) return;
    setExcluindo(true);
    try {
      await excluir(alvo);
      toast.sucesso(sucesso ? sucesso(alvo) : 'Excluído com sucesso.');
      setAlvo(null);
      notificarAlteracao();
    } catch (erro) {
      // Fecha o diálogo mesmo no erro: repetir a mesma exclusão não resolve; a notificação explica o motivo.
      setAlvo(null);
      toast.erro(mensagemDeErro(erro, contextoErro));
    } finally {
      setExcluindo(false);
    }
  }

  return {
    alvo,
    excluindo,
    pedir: setAlvo,
    cancelar: () => !excluindo && setAlvo(null),
    confirmar,
  };
}
