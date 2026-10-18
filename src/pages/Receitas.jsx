import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, Search, Wallet, X } from 'lucide-react';
import Painel from '../components/ui/Painel';
import StatCard from '../components/ui/StatCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { EstadoErro, EstadoVazio, Nota, SkeletonLista } from '../components/ui/Estados';
import ListaMovimentacoes from '../components/movimentacoes/ListaMovimentacoes';
import { useAuth } from '../contexts/AuthContext';
import { useNovaMovimentacao } from '../contexts/NovaMovimentacaoContext';
import { useApiData } from '../hooks/useApiData';
import { useExclusao } from '../hooks/useExclusao';
import * as receitaService from '../services/receitaService';
import { MESES, formatarMesAno, formatarMoeda, mesAtual, normalizarTexto, partesData } from '../utils/format';
import { noMes, ordenarPorData } from '../utils/financas';

/**
 * Receitas: GET /receita/usuario/{id}, POST /receita/cadastrar/{id}, DELETE /receita/{id}/usuario/{usuarioId}
 * O backend não tem filtro de receitas; busca e mês são filtros locais sobre a lista real.
 */
export default function Receitas() {
  const { usuario } = useAuth();
  const { abrir } = useNovaMovimentacao();
  const uid = usuario.id;
  const atual = mesAtual();

  const [busca, setBusca] = useState('');
  const [mesFiltro, setMesFiltro] = useState(''); // "aaaa-mm" ou ''

  const receitas = useApiData(() => receitaService.listar(uid), [uid]);
  const exclusao = useExclusao((r) => receitaService.excluir(r.id, uid), {
    sucesso: (r) => `Receita "${r.descricao}" excluída.`,
    contextoErro: { 500: 'O servidor não conseguiu excluir a receita. Ela pode já ter sido removida.' },
  });

  const mesesDisponiveis = useMemo(() => {
    const chaves = new Set((receitas.dados ?? []).map((r) => r.data.slice(0, 7)).filter(Boolean));
    return [...chaves].sort().reverse();
  }, [receitas.dados]);

  const filtradas = useMemo(() => {
    const termo = normalizarTexto(busca);
    return ordenarPorData(
      (receitas.dados ?? []).filter((r) => {
        if (termo && !normalizarTexto(r.descricao).includes(termo)) return false;
        if (mesFiltro && r.data.slice(0, 7) !== mesFiltro) return false;
        return true;
      }),
    );
  }, [receitas.dados, busca, mesFiltro]);

  const total = (receitas.dados ?? []).reduce((s, r) => s + r.valor, 0);
  const totalMes = (receitas.dados ?? []).filter((r) => noMes(r, atual.mes, atual.ano)).reduce((s, r) => s + r.valor, 0);
  const totalFiltrado = filtradas.reduce((s, r) => s + r.valor, 0);
  const carregandoInicial = receitas.carregando && !receitas.dados;
  const temFiltro = busca || mesFiltro;

  const rotuloMes = (chave) => {
    const p = partesData(`${chave}-01`);
    return p ? `${MESES[p.mes - 1].charAt(0).toUpperCase()}${MESES[p.mes - 1].slice(1)} ${p.ano}` : chave;
  };

  return (
    <div className="movimentacoes">
      <div className="grade-stats grade-stats--3">
        <StatCard indice={0} titulo="Total recebido" valor={total} icone={Wallet} tom="positivo" legenda="Todas as receitas" carregando={carregandoInicial} indisponivel={!!receitas.erro && !receitas.dados} />
        <StatCard indice={1} titulo={`Recebido em ${formatarMesAno(atual.mes, atual.ano)}`} valor={totalMes} icone={CalendarDays} tom="marca" legenda="Mês corrente" carregando={carregandoInicial} indisponivel={!!receitas.erro && !receitas.dados} />
        <motion.article className="stat stat--azul stat--contador" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="stat__topo">
            <span className="stat__titulo">Lançamentos</span>
          </div>
          <strong className="stat__valor">{carregandoInicial ? '…' : (receitas.dados?.length ?? 0)}</strong>
          <span className="stat__legenda">receitas registradas</span>
        </motion.article>
      </div>

      <div className="barra-pagina">
        <div className="filtros__grade filtros__grade--linha">
          <label className="busca">
            <Search size={17} />
            <input type="search" placeholder="Buscar receita…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar receita" />
          </label>
          <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} aria-label="Filtrar por mês" disabled={!mesesDisponiveis.length}>
            <option value="">Todos os meses</option>
            {mesesDisponiveis.map((chave) => (
              <option key={chave} value={chave}>
                {rotuloMes(chave)}
              </option>
            ))}
          </select>
          {temFiltro && (
            <button type="button" className="botao botao--fantasma botao--pequeno" onClick={() => { setBusca(''); setMesFiltro(''); }}>
              <X size={15} /> Limpar
            </button>
          )}
        </div>
        <button type="button" className="botao botao--primario" onClick={() => abrir('RECEITA')}>
          <Plus size={18} /> Nova receita
        </button>
      </div>

      <Painel
        indice={1}
        titulo="Receitas"
        subtitulo={temFiltro ? `${filtradas.length} resultado(s) · ${formatarMoeda(totalFiltrado)}` : undefined}
      >
        {receitas.erro && !receitas.dados ? (
          <EstadoErro erro={receitas.erro} onTentarNovamente={receitas.recarregar} />
        ) : carregandoInicial ? (
          <SkeletonLista linhas={5} />
        ) : !filtradas.length ? (
          <EstadoVazio
            icone={Wallet}
            titulo={temFiltro ? 'Nenhuma receita encontrada' : 'Nenhuma receita registrada'}
            descricao={temFiltro ? 'Tente outro termo ou mês.' : 'Salário, freelas, vendas: registre aqui o dinheiro que entrou.'}
            acao={
              !temFiltro && (
                <button type="button" className="botao botao--primario botao--pequeno" onClick={() => abrir('RECEITA')}>
                  <Plus size={15} /> Nova receita
                </button>
              )
            }
          />
        ) : (
          <ListaMovimentacoes itens={filtradas} onExcluir={exclusao.pedir} mostrarCategoria={false} />
        )}
      </Painel>

      <Nota titulo="Como funciona:">
        receitas no backend têm apenas descrição, valor e data (sem categoria) e não podem ser editadas. Elas somam no
        total de entradas junto com as transações do tipo entrada.
      </Nota>

      <ConfirmDialog
        aberto={!!exclusao.alvo}
        titulo="Excluir receita"
        mensagem={exclusao.alvo ? `Excluir "${exclusao.alvo.descricao}" (${formatarMoeda(exclusao.alvo.valor)})?` : ''}
        detalhe="Esta ação não pode ser desfeita."
        carregando={exclusao.excluindo}
        onConfirmar={exclusao.confirmar}
        onCancelar={exclusao.cancelar}
      />
    </div>
  );
}
