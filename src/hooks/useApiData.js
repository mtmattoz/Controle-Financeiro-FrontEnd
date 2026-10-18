import { useCallback, useEffect, useRef, useState } from 'react';
import { useDados } from '../contexts/DadosContext';

/**
 * Carrega dados de um serviço e controla loading / erro.
 * Recarrega automaticamente quando `dependencias` mudam ou quando qualquer
 * operação confirmada chama `notificarAlteracao()` (DadosContext).
 *
 * @param {() => Promise<any>} buscar função que chama um serviço
 * @param {any[]} dependencias
 * @param {{ ativo?: boolean }} [opcoes] ativo=false pula a busca
 */
export function useApiData(buscar, dependencias = [], { ativo = true } = {}) {
  const { versao } = useDados();
  const [estado, setEstado] = useState({ dados: null, carregando: ativo, erro: null });
  const [tentativa, setTentativa] = useState(0);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    if (!ativo) {
      setEstado({ dados: null, carregando: false, erro: null });
      return undefined;
    }
    let vigente = true;
    setEstado((anterior) => ({ ...anterior, carregando: true, erro: null }));
    buscarRef
      .current()
      .then((dados) => vigente && setEstado({ dados, carregando: false, erro: null }))
      .catch((erro) => vigente && setEstado((anterior) => ({ dados: anterior.dados, carregando: false, erro })));
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, versao, tentativa, ativo]);

  const recarregar = useCallback(() => setTentativa((t) => t + 1), []);

  return { ...estado, recarregar };
}
