import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import Campo from '../ui/Campo';
import { EstadoErro, Skeleton } from '../ui/Estados';
import { useAuth } from '../../contexts/AuthContext';
import { useApiData } from '../../hooks/useApiData';
import * as categoriaService from '../../services/categoriaService';
import * as transacaoService from '../../services/transacaoService';
import { mensagemDeErro } from '../../services/api';
import { hojeISO } from '../../utils/format';
import { errosDoServidor, paraNumeroDoFormulario, validarTransacao } from './validacao';

/**
 * Cadastro de transação: POST /transacao/cadastrar/{usuarioId}/{categoriaId}
 * A categoria é obrigatória e precisa ser do usuário (lista vinda de GET /categoria/usuario/{id}).
 */
export default function TransacaoForm({ tipoInicial = 'SAIDA', onSucesso, onCancelar }) {
  const { usuario } = useAuth();
  const categorias = useApiData(() => categoriaService.listar(usuario.id), [usuario.id]);
  const [form, setForm] = useState({ tipo: tipoInicial, descricao: '', valor: '', data: hojeISO(), categoriaId: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    const encontrados = validarTransacao(form);
    setErros(encontrados);
    setErroGeral('');
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      const nova = await transacaoService.cadastrar(usuario.id, form.categoriaId, {
        descricao: form.descricao,
        valor: paraNumeroDoFormulario(form.valor),
        tipo: form.tipo,
        data: form.data,
      });
      onSucesso?.(nova);
    } catch (erro) {
      setErros(errosDoServidor(erro));
      setErroGeral(mensagemDeErro(erro, { 500: 'O servidor não conseguiu salvar a transação. Verifique se a categoria ainda existe.' }));
    } finally {
      setEnviando(false);
    }
  }

  if (categorias.carregando && !categorias.dados) {
    return (
      <div className="formulario">
        <Skeleton altura={44} />
        <Skeleton altura={44} />
        <Skeleton altura={44} />
      </div>
    );
  }
  if (categorias.erro && !categorias.dados) {
    return <EstadoErro erro={categorias.erro} onTentarNovamente={categorias.recarregar} compacto />;
  }
  if (!categorias.dados?.length) {
    return (
      <div className="aviso-categoria">
        <p>Toda transação precisa de uma categoria, e você ainda não tem nenhuma.</p>
        <Link to="/categorias" className="botao botao--primario" onClick={onCancelar}>
          Criar minha primeira categoria
        </Link>
      </div>
    );
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="seletor-tipo" role="radiogroup" aria-label="Tipo da transação">
        {[
          ['SAIDA', 'Saída'],
          ['ENTRADA', 'Entrada'],
        ].map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={form.tipo === valor}
            className={`seletor-tipo__opcao seletor-tipo__opcao--${valor.toLowerCase()} ${form.tipo === valor ? 'ativo' : ''}`}
            onClick={() => setForm((f) => ({ ...f, tipo: valor }))}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <Campo rotulo="Descrição" erro={erros.descricao}>
        <input type="text" value={form.descricao} onChange={alterar('descricao')} maxLength={150} placeholder="Ex.: Mercado do mês" data-autofocus />
      </Campo>

      <div className="formulario__linha">
        <Campo rotulo="Valor (R$)" erro={erros.valor}>
          <input type="number" inputMode="decimal" min="0.01" step="0.01" value={form.valor} onChange={alterar('valor')} placeholder="0,00" />
        </Campo>
        <Campo rotulo="Data" erro={erros.data}>
          <input type="date" value={form.data} onChange={alterar('data')} />
        </Campo>
      </div>

      <Campo rotulo="Categoria" erro={erros.categoriaId}>
        <select value={form.categoriaId} onChange={alterar('categoriaId')}>
          <option value="">Selecione…</option>
          {categorias.dados.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </Campo>

      {erroGeral && <p className="formulario__erro" role="alert">{erroGeral}</p>}

      <div className="modal__acoes">
        <button type="button" className="botao botao--secundario" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button type="submit" className="botao botao--primario" disabled={enviando}>
          {enviando && <LoaderCircle size={16} className="girando" />}
          {enviando ? 'Salvando…' : 'Salvar transação'}
        </button>
      </div>
    </form>
  );
}
