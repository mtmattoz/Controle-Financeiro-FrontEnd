import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TriangleAlert, Check, LoaderCircle, Plus, Sparkles, X } from 'lucide-react';
import Campo from '../ui/Campo';
import CategoriaIcone from '../ui/CategoriaIcone';
import { normalizarTexto } from '../../utils/format';
import { validarTransacao } from '../forms/validacao';

/**
 * Prévia editável da movimentação interpretada pela IA.
 * Nada é enviado ao alterar campos; só o botão "Confirmar movimentação" salva.
 */
export default function ConfirmacaoCard({ interpretacao, categorias, salvando, criandoCategoria, erro, onConfirmar, onCancelar, onCriarCategoria }) {
  const sugestao = interpretacao.categoria;
  const categoriaCorrespondente = useMemo(
    () => categorias.find((c) => normalizarTexto(c.nome) === normalizarTexto(sugestao)),
    [categorias, sugestao],
  );

  const [form, setForm] = useState(() => ({
    tipo: interpretacao.tipo,
    valor: interpretacao.valor ? String(interpretacao.valor) : '',
    descricao: interpretacao.descricao,
    data: interpretacao.data,
    categoriaId: categoriaCorrespondente ? String(categoriaCorrespondente.id) : '',
  }));
  const [erros, setErros] = useState({});

  // Se a categoria sugerida for criada depois (botão abaixo), seleciona-a.
  const [ultimaSugestaoAplicada, setUltima] = useState(categoriaCorrespondente?.id ?? null);
  if (categoriaCorrespondente && categoriaCorrespondente.id !== ultimaSugestaoAplicada && !form.categoriaId) {
    setUltima(categoriaCorrespondente.id);
    setForm((f) => ({ ...f, categoriaId: String(categoriaCorrespondente.id) }));
  }

  const alterar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  function confirmar() {
    const encontrados = validarTransacao(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;
    onConfirmar(form);
  }

  const categoriaSelecionada = categorias.find((c) => String(c.id) === form.categoriaId);
  const bloqueado = salvando || criandoCategoria;

  return (
    <motion.div
      className="confirmacao-ia"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
    >
      <header className="confirmacao-ia__cabecalho">
        <span className="confirmacao-ia__selo">
          <Sparkles size={15} /> Interpretado pela IA
        </span>
        <h3>Revise antes de salvar</h3>
        <p>Confira e ajuste os campos. Nada foi salvo ainda.</p>
      </header>

      <fieldset className="formulario" disabled={bloqueado}>
        <div className="seletor-tipo" role="radiogroup" aria-label="Tipo">
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
              onClick={() => {
                setForm((f) => ({ ...f, tipo: valor }));
                setErros((atual) => ({ ...atual, tipo: undefined }));
              }}
            >
              {rotulo}
            </button>
          ))}
        </div>
        {erros.tipo && <span className="campo__erro">{erros.tipo}</span>}

        <div className="formulario__linha">
          <Campo rotulo="Valor (R$)" erro={erros.valor}>
            <input type="number" inputMode="decimal" min="0.01" step="0.01" value={form.valor} onChange={alterar('valor')} />
          </Campo>
          <Campo rotulo="Data" erro={erros.data}>
            <input type="date" value={form.data} onChange={alterar('data')} />
          </Campo>
        </div>

        <Campo rotulo="Descrição" erro={erros.descricao}>
          <input type="text" value={form.descricao} onChange={alterar('descricao')} maxLength={150} />
        </Campo>

        <Campo rotulo="Categoria" erro={erros.categoriaId}>
          <select value={form.categoriaId} onChange={alterar('categoriaId')}>
            <option value="">Selecione uma categoria existente…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Campo>

        {sugestao && !categoriaCorrespondente && (
          <div className="confirmacao-ia__aviso">
            <TriangleAlert size={17} />
            <div>
              <p>
                A IA sugeriu a categoria <strong>“{sugestao}”</strong>, que não existe na sua conta. Escolha uma categoria
                existente acima ou crie esta.
              </p>
              <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => onCriarCategoria(sugestao)} disabled={bloqueado}>
                {criandoCategoria ? <LoaderCircle size={14} className="girando" /> : <Plus size={14} />}
                Criar categoria “{sugestao}”
              </button>
            </div>
          </div>
        )}

        {categoriaSelecionada && (
          <div className="confirmacao-ia__categoria">
            <CategoriaIcone nome={categoriaSelecionada.nome} tamanho={30} /> {categoriaSelecionada.nome}
          </div>
        )}
      </fieldset>

      {erro && <p className="formulario__erro" role="alert">{erro}</p>}

      <div className="confirmacao-ia__acoes">
        <button type="button" className="botao botao--secundario" onClick={onCancelar} disabled={salvando}>
          <X size={16} /> Cancelar
        </button>
        <button type="button" className="botao botao--primario" onClick={confirmar} disabled={bloqueado}>
          {salvando ? <LoaderCircle size={16} className="girando" /> : <Check size={16} />}
          {salvando ? 'Salvando…' : 'Confirmar movimentação'}
        </button>
      </div>
    </motion.div>
  );
}
