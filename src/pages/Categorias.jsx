import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, Plus, Tags, Trash2 } from 'lucide-react';
import Painel from '../components/ui/Painel';
import CategoriaIcone from '../components/ui/CategoriaIcone';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { EstadoErro, EstadoVazio, Nota, Skeleton } from '../components/ui/Estados';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDados } from '../contexts/DadosContext';
import { useApiData } from '../hooks/useApiData';
import { useExclusao } from '../hooks/useExclusao';
import * as categoriaService from '../services/categoriaService';
import * as transacaoService from '../services/transacaoService';
import { mensagemDeErro } from '../services/api';
import { formatarDataHora, formatarMoeda, normalizarTexto } from '../utils/format';

/**
 * Categorias: GET /categoria/usuario/{id}, POST /categoria/cadastrar/{id}, DELETE /categoria/{id}/usuario/{usuarioId}
 * A entidade só tem "nome": ícone e cor são apenas visuais (não são salvos).
 * As estatísticas de uso vêm de GET /transacao/usuario/{id}.
 */
export default function Categorias() {
  const { usuario } = useAuth();
  const toast = useToast();
  const { notificarAlteracao } = useDados();
  const uid = usuario.id;

  const categorias = useApiData(() => categoriaService.listar(uid), [uid]);
  const transacoes = useApiData(() => transacaoService.listar(uid), [uid]);
  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  const uso = useMemo(() => {
    const mapa = new Map();
    for (const t of transacoes.dados ?? []) {
      if (!t.categoria) continue;
      const atual = mapa.get(t.categoria.id) ?? { quantidade: 0, saidas: 0, entradas: 0 };
      atual.quantidade += 1;
      if (t.tipo === 'SAIDA') atual.saidas += t.valor;
      else atual.entradas += t.valor;
      mapa.set(t.categoria.id, atual);
    }
    return mapa;
  }, [transacoes.dados]);

  const exclusao = useExclusao((c) => categoriaService.excluir(c.id, uid), {
    sucesso: (c) => `Categoria "${c.nome}" excluída.`,
    contextoErro: {
      500: 'O servidor recusou a exclusão. Isso acontece quando há transações vinculadas a esta categoria — exclua-as antes.',
    },
  });

  async function cadastrar(e) {
    e.preventDefault();
    const limpo = nome.trim();
    if (!limpo) return setErroNome('Informe o nome da categoria.');
    if (limpo.length > 50) return setErroNome('Use no máximo 50 caracteres.');
    if ((categorias.dados ?? []).some((c) => normalizarTexto(c.nome) === normalizarTexto(limpo))) {
      return setErroNome('Você já tem uma categoria com esse nome.');
    }
    setErroNome('');
    setSalvando(true);
    try {
      const nova = await categoriaService.cadastrar(uid, limpo);
      toast.sucesso(`Categoria "${nova.nome}" criada.`);
      setNome('');
      notificarAlteracao();
    } catch (erro) {
      setErroNome(erro.fieldErrors?.nome || mensagemDeErro(erro, { 500: 'O servidor não conseguiu criar a categoria.' }));
    } finally {
      setSalvando(false);
    }
  }

  const usoDoAlvo = exclusao.alvo ? uso.get(exclusao.alvo.id) : null;

  return (
    <div className="categorias">
      <Painel indice={0} titulo="Nova categoria" subtitulo="Use nomes curtos, como Alimentação, Transporte ou Salário.">
        <form className="categorias__form" onSubmit={cadastrar} noValidate>
          <div className={`campo ${erroNome ? 'campo--erro' : ''}`}>
            <label htmlFor="nome-categoria" className="visualmente-oculto">Nome da categoria</label>
            <input
              id="nome-categoria"
              type="text"
              value={nome}
              maxLength={50}
              placeholder="Nome da categoria"
              onChange={(e) => {
                setNome(e.target.value);
                setErroNome('');
              }}
              aria-invalid={!!erroNome}
              aria-describedby={erroNome ? 'erro-categoria' : undefined}
            />
            {erroNome && <span id="erro-categoria" className="campo__erro">{erroNome}</span>}
          </div>
          {nome.trim() && <CategoriaIcone nome={nome} tamanho={44} />}
          <button type="submit" className="botao botao--primario" disabled={salvando}>
            {salvando ? <LoaderCircle size={17} className="girando" /> : <Plus size={17} />}
            {salvando ? 'Criando…' : 'Adicionar'}
          </button>
        </form>
      </Painel>

      {categorias.erro && !categorias.dados ? (
        <EstadoErro erro={categorias.erro} onTentarNovamente={categorias.recarregar} />
      ) : categorias.carregando && !categorias.dados ? (
        <div className="categorias__grade">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} altura={132} raio={16} />
          ))}
        </div>
      ) : !categorias.dados.length ? (
        <Painel indice={1}>
          <EstadoVazio icone={Tags} titulo="Nenhuma categoria criada" descricao="Categorias organizam suas transações e alimentam os gráficos de despesas." />
        </Painel>
      ) : (
        <motion.ul className="categorias__grade" layout>
          <AnimatePresence initial={false}>
            {[...categorias.dados]
              .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
              .map((c, i) => {
                const info = uso.get(c.id);
                return (
                  <motion.li
                    key={c.id}
                    layout
                    className="categoria-card"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i, 10) * 0.03 } }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    whileHover={{ y: -3 }}
                  >
                    <div className="categoria-card__topo">
                      <CategoriaIcone nome={c.nome} tamanho={44} />
                      <button type="button" className="botao-icone botao-icone--perigo" onClick={() => exclusao.pedir(c)} aria-label={`Excluir categoria ${c.nome}`} title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <strong className="categoria-card__nome">{c.nome}</strong>
                    <span className="categoria-card__info">
                      {transacoes.carregando && !transacoes.dados
                        ? 'Carregando uso…'
                        : info
                          ? `${info.quantidade} ${info.quantidade === 1 ? 'transação' : 'transações'}`
                          : 'Nenhuma transação'}
                    </span>
                    {info && info.saidas > 0 && <span className="categoria-card__valor negativo">− {formatarMoeda(info.saidas)} em saídas</span>}
                    {info && info.entradas > 0 && <span className="categoria-card__valor positivo">+ {formatarMoeda(info.entradas)} em entradas</span>}
                    <span className="categoria-card__data">Criada em {formatarDataHora(c.criadoEm)}</span>
                  </motion.li>
                );
              })}
          </AnimatePresence>
        </motion.ul>
      )}

      <Nota titulo="Observação:">
        ícones e cores são escolhidos automaticamente pelo nome e servem só para visualização — o backend guarda apenas
        o nome. Não há rota para renomear categorias.
      </Nota>

      <ConfirmDialog
        aberto={!!exclusao.alvo}
        titulo="Excluir categoria"
        mensagem={exclusao.alvo ? `Excluir a categoria "${exclusao.alvo.nome}"?` : ''}
        detalhe={
          usoDoAlvo
            ? `Ela tem ${usoDoAlvo.quantidade} ${usoDoAlvo.quantidade === 1 ? 'transação vinculada' : 'transações vinculadas'}. O backend provavelmente vai recusar a exclusão enquanto elas existirem.`
            : 'Esta ação não pode ser desfeita.'
        }
        carregando={exclusao.excluindo}
        onConfirmar={exclusao.confirmar}
        onCancelar={exclusao.cancelar}
      />
    </div>
  );
}
