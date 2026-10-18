import Modal from '../ui/Modal';
import TransacaoForm from './TransacaoForm';
import ReceitaForm from './ReceitaForm';
import { useToast } from '../../contexts/ToastContext';
import { useDados } from '../../contexts/DadosContext';
import { formatarMoeda } from '../../utils/format';

const ABAS = [
  { modo: 'SAIDA', rotulo: 'Despesa', dica: 'Transação de saída, com categoria' },
  { modo: 'ENTRADA', rotulo: 'Entrada', dica: 'Transação de entrada, com categoria' },
  { modo: 'RECEITA', rotulo: 'Receita', dica: 'Receita simples, sem categoria' },
];

/** Modal único para registrar despesa, entrada ou receita de qualquer tela. */
export default function NovaMovimentacaoModal({ modo, onTrocarModo, onFechar }) {
  const toast = useToast();
  const { notificarAlteracao } = useDados();
  const aba = ABAS.find((a) => a.modo === modo) ?? ABAS[0];

  const aoSalvar = (item) => {
    notificarAlteracao();
    const rotulo = item.origem === 'receita' ? 'Receita' : item.tipo === 'ENTRADA' ? 'Entrada' : 'Despesa';
    toast.sucesso(`${rotulo} de ${formatarMoeda(item.valor)} registrada.`);
    onFechar();
  };

  return (
    <Modal aberto={!!modo} onFechar={onFechar} titulo="Nova movimentação" descricao={aba.dica}>
      <div className="abas" role="tablist">
        {ABAS.map((a) => (
          <button
            key={a.modo}
            type="button"
            role="tab"
            aria-selected={a.modo === aba.modo}
            className={`abas__item ${a.modo === aba.modo ? 'ativo' : ''}`}
            onClick={() => onTrocarModo(a.modo)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {aba.modo === 'RECEITA' ? (
        <ReceitaForm key="receita" onSucesso={aoSalvar} onCancelar={onFechar} />
      ) : (
        <TransacaoForm key={aba.modo} tipoInicial={aba.modo} onSucesso={aoSalvar} onCancelar={onFechar} />
      )}
    </Modal>
  );
}
