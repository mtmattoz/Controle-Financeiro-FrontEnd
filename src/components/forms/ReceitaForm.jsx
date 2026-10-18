import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Campo from '../ui/Campo';
import { useAuth } from '../../contexts/AuthContext';
import * as receitaService from '../../services/receitaService';
import { mensagemDeErro } from '../../services/api';
import { hojeISO } from '../../utils/format';
import { errosDoServidor, paraNumeroDoFormulario, validarReceita } from './validacao';

/**
 * Cadastro de receita: POST /receita/cadastrar/{usuarioId}
 * O contrato de Receita só tem descrição, valor e data (sem categoria e sem tipo).
 */
export default function ReceitaForm({ onSucesso, onCancelar }) {
  const { usuario } = useAuth();
  const [form, setForm] = useState({ descricao: '', valor: '', data: hojeISO() });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    const encontrados = validarReceita(form);
    setErros(encontrados);
    setErroGeral('');
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      const nova = await receitaService.cadastrar(usuario.id, {
        descricao: form.descricao,
        valor: paraNumeroDoFormulario(form.valor),
        data: form.data,
      });
      onSucesso?.(nova);
    } catch (erro) {
      setErros(errosDoServidor(erro));
      setErroGeral(mensagemDeErro(erro, { 500: 'O servidor não conseguiu salvar a receita.' }));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <Campo rotulo="Descrição" erro={erros.descricao}>
        <input type="text" value={form.descricao} onChange={alterar('descricao')} maxLength={100} placeholder="Ex.: Salário de outubro" data-autofocus />
      </Campo>
      <div className="formulario__linha">
        <Campo rotulo="Valor (R$)" erro={erros.valor}>
          <input type="number" inputMode="decimal" min="0.01" step="0.01" value={form.valor} onChange={alterar('valor')} placeholder="0,00" />
        </Campo>
        <Campo rotulo="Data" erro={erros.data}>
          <input type="date" value={form.data} onChange={alterar('data')} />
        </Campo>
      </div>

      {erroGeral && <p className="formulario__erro" role="alert">{erroGeral}</p>}

      <div className="modal__acoes">
        <button type="button" className="botao botao--secundario" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button type="submit" className="botao botao--primario" disabled={enviando}>
          {enviando && <LoaderCircle size={16} className="girando" />}
          {enviando ? 'Salvando…' : 'Salvar receita'}
        </button>
      </div>
    </form>
  );
}
