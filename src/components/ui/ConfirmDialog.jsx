import { TriangleAlert, LoaderCircle } from 'lucide-react';
import Modal from './Modal';

/** Confirmação para ações destrutivas. Só fecha depois que a operação termina. */
export default function ConfirmDialog({
  aberto,
  titulo = 'Confirmar exclusão',
  mensagem,
  detalhe,
  textoConfirmar = 'Excluir',
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal aberto={aberto} onFechar={onCancelar} titulo={titulo} largura="sm" bloquearFechamento={carregando}>
      <div className="confirmacao">
        <span className="confirmacao__icone">
          <TriangleAlert size={22} />
        </span>
        <div>
          <p className="confirmacao__mensagem">{mensagem}</p>
          {detalhe && <p className="confirmacao__detalhe">{detalhe}</p>}
        </div>
      </div>
      <div className="modal__acoes">
        <button type="button" className="botao botao--secundario" onClick={onCancelar} disabled={carregando}>
          Cancelar
        </button>
        <button type="button" className="botao botao--perigo" onClick={onConfirmar} disabled={carregando} data-autofocus>
          {carregando && <LoaderCircle size={16} className="girando" />}
          {carregando ? 'Excluindo…' : textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
