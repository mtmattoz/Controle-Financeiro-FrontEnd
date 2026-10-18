import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Plus, Search, Tags, X } from 'lucide-react';
import Painel from '../components/ui/Painel';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { EstadoErro, EstadoVazio, Nota, SkeletonLista } from '../components/ui/Estados';
import ListaMovimentacoes from '../components/movimentacoes/ListaMovimentacoes';
import { useAuth } from '../contexts/AuthContext';
import { useNovaMovimentacao } from '../contexts/NovaMovimentacaoContext';
import { useApiData } from '../hooks/useApiData';
import { useExclusao } from '../hooks/useExclusao';
import * as transacaoService from '../services/transacaoService';
import * as categoriaService from '../services/categoriaService';
import { formatarMoeda, normalizarTexto } from '../utils/format';
import { ordenarPorData, resumir } from '../utils/financas';

/**
 * Filtros:
 *  - categoria → GET /transacao/usuario/{id}/categoria/{categoriaId}
 *  - tipo      → GET /transacao/usuario/{id}/tipo/{tipo}
 *  - nenhum    → GET /transacao/usuario/{id}
 * O backend não combina os dois filtros nem filtra por texto/data, então quando
 * os dois estão ativos usamos o endpoint de categoria e filtramos o tipo localmente;
 * busca por descrição e período também são filtros locais sobre a resposta real.
 */
export default function Transacoes() {
  const { usuario } = useAuth();
  const { abrir } = useNovaMovimentacao();
  const uid = usuario.id;

  const [tipo, setTipo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [busca, setBusca] = useState('');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');

  const categorias = useApiData(() => categoriaService.listar(uid), [uid]);
  const transacoes = useApiData(() => {
    if (categoriaId) return transacaoService.listarPorCategoria(uid, categoriaId);
    if (tipo) return transacaoService.listarPorTipo(uid, tipo);
    return transacaoService.listar(uid);
  }, [uid, categoriaId, tipo]);

  const exclusao = useExclusao((t) => transacaoService.excluir(t.id, uid), {
    sucesso: (t) => `Transação "${t.descricao}" excluída.`,
    contextoErro: { 500: 'O servidor não conseguiu excluir a transação. Ela pode já ter sido removida.' },
  });

  const filtradas = useMemo(() => {
    const termo = normalizarTexto(busca);
    const lista = (transacoes.dados ?? []).filter((t) => {
      if (tipo && t.tipo !== tipo) return false;
      if (termo && !normalizarTexto(t.descricao).includes(termo)) return false;
      if (de && t.data < de) return false;
      if (ate && t.data > ate) return false;
      return true;
    });
    return ordenarPorData(lista);
  }, [transacoes.dados, tipo, busca, de, ate]);

  const totais = useMemo(() => resumir(filtradas), [filtradas]);
  const temFiltro = tipo || categoriaId || busca || de || ate;
  const limpar = () => {
    setTipo('');
    setCategoriaId('');
    setBusca('');
    setDe('');
    setAte('');
  };
  const semCategorias = categorias.dados && categorias.dados.length === 0;

  return (
    <div className="movimentacoes">
      <div className="barra-pagina">
        <div className="resumo-chips">
          <span className="chip">{filtradas.length} {filtradas.length === 1 ? 'transação' : 'transações'}</span>
          <span className="chip chip--positivo">Entradas {formatarMoeda(totais.entradas)}</span>
          <span className="chip chip--negativo">Saídas {formatarMoeda(totais.saidas)}</span>
        </div>
        <button type="button" className="botao botao--primario" onClick={() => abrir(tipo === 'ENTRADA' ? 'ENTRADA' : 'SAIDA')}>
          <Plus size={18} /> Nova transação
        </button>
      </div>

      <Painel indice={0} className="filtros">
        <div className="filtros__grade">
          <label className="busca">
            <Search size={17} />
            <input type="search" placeholder="Buscar por descrição…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar por descrição" />
          </label>

          <div className="segmentado" role="radiogroup" aria-label="Tipo">
            {[
              ['', 'Todas'],
              ['ENTRADA', 'Entradas'],
              ['SAIDA', 'Saídas'],
            ].map(([valor, rotulo]) => (
              <button
                key={valor || 'todas'}
                type="button"
                role="radio"
                aria-checked={tipo === valor}
                className={tipo === valor ? 'ativo' : ''}
                onClick={() => setTipo(valor)}
              >
                {rotulo}
              </button>
            ))}
          </div>

          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} aria-label="Categoria" disabled={!categorias.dados?.length}>
            <option value="">Todas as categorias</option>
            {(categorias.dados ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <div className="filtros__periodo">
            <input type="date" value={de} onChange={(e) => setDe(e.target.value)} aria-label="Data inicial" title="De" />
            <span>até</span>
            <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} aria-label="Data final" title="Até" />
          </div>

          {temFiltro && (
            <button type="button" className="botao botao--fantasma botao--pequeno" onClick={limpar}>
              <X size={15} /> Limpar
            </button>
          )}
        </div>
      </Painel>

      <Painel indice={1}>
        {transacoes.erro && !transacoes.dados ? (
          <EstadoErro erro={transacoes.erro} onTentarNovamente={transacoes.recarregar} />
        ) : transacoes.carregando && !transacoes.dados ? (
          <SkeletonLista linhas={6} />
        ) : semCategorias && !transacoes.dados?.length ? (
          <EstadoVazio
            icone={Tags}
            titulo="Crie uma categoria primeiro"
            descricao="No backend, toda transação precisa estar ligada a uma categoria."
            acao={
              <Link to="/categorias" className="botao botao--primario botao--pequeno">
                Ir para categorias
              </Link>
            }
          />
        ) : !filtradas.length ? (
          <EstadoVazio
            icone={ArrowLeftRight}
            titulo={temFiltro ? 'Nenhuma transação com esses filtros' : 'Nenhuma transação registrada'}
            descricao={temFiltro ? 'Ajuste ou limpe os filtros para ver mais resultados.' : 'Registre sua primeira entrada ou saída.'}
            acao={
              temFiltro ? (
                <button type="button" className="botao botao--secundario botao--pequeno" onClick={limpar}>
                  Limpar filtros
                </button>
              ) : (
                <button type="button" className="botao botao--primario botao--pequeno" onClick={() => abrir('SAIDA')}>
                  <Plus size={15} /> Nova transação
                </button>
              )
            }
          />
        ) : (
          <ListaMovimentacoes itens={filtradas} onExcluir={exclusao.pedir} />
        )}
      </Painel>

      <Nota titulo="Sem edição:">o backend não possui rota para alterar transações. Para corrigir um lançamento, exclua e registre novamente.</Nota>

      <ConfirmDialog
        aberto={!!exclusao.alvo}
        titulo="Excluir transação"
        mensagem={exclusao.alvo ? `Excluir "${exclusao.alvo.descricao}" (${formatarMoeda(exclusao.alvo.valor)})?` : ''}
        detalhe="Esta ação não pode ser desfeita."
        carregando={exclusao.excluindo}
        onConfirmar={exclusao.confirmar}
        onCancelar={exclusao.cancelar}
      />
    </div>
  );
}
