import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChartColumn, Download, Landmark, ChartLine, ChartPie as PieIcon, Scale, List } from 'lucide-react';
import Painel from '../components/ui/Painel';
import StatCard from '../components/ui/StatCard';
import SeletorMes from '../components/ui/SeletorMes';
import { EstadoErro, EstadoVazio, Nota, Skeleton, SkeletonLista } from '../components/ui/Estados';
import CategoriaBarrasChart from '../components/charts/CategoriaBarrasChart';
import CategoriaDonutChart from '../components/charts/CategoriaDonutChart';
import EvolucaoChart from '../components/charts/EvolucaoChart';
import ListaMovimentacoes from '../components/movimentacoes/ListaMovimentacoes';
import { useAuth } from '../contexts/AuthContext';
import { useApiData } from '../hooks/useApiData';
import * as relatorioService from '../services/relatorioService';
import * as receitaService from '../services/receitaService';
import { formatarMesAno, formatarMoeda, mesAtual } from '../utils/format';
import { despesasPorCategoria, noMes, ordenarPorData, resumir, serieDiaria } from '../utils/financas';
import { exportarMovimentacoesCsv } from '../utils/exportarCsv';

/**
 * Relatórios
 *  - Acumulado (todo o período) ...... GET /relatorio/usuario/{id}
 *  - Transações do mês ............... GET /relatorio/usuario/{id}/mes?mes=&ano=
 *  - Despesas por categoria (total) .. GET /relatorio/usuario/{id}/categorias
 *  - Receitas do mês ................. GET /receita/usuario/{id}, filtrado localmente
 *    (o endpoint /mes do backend devolve só transações).
 * Valores do mês e valores acumulados ficam em blocos separados para não misturar períodos.
 */
export default function Relatorios() {
  const { usuario } = useAuth();
  const uid = usuario.id;
  const [periodo, setPeriodo] = useState(mesAtual);
  const { mes, ano } = periodo;

  const resumo = useApiData(() => relatorioService.resumo(uid), [uid]);
  const categoriasTotal = useApiData(() => relatorioService.despesasPorCategoria(uid), [uid]);
  const doMes = useApiData(() => relatorioService.transacoesDoMes(uid, mes, ano), [uid, mes, ano]);
  const receitas = useApiData(() => receitaService.listar(uid), [uid]);

  const receitasDoMes = useMemo(() => (receitas.dados ?? []).filter((r) => noMes(r, mes, ano)), [receitas.dados, mes, ano]);
  const mesPronto = !!doMes.dados && !!receitas.dados;
  const resumoMes = useMemo(() => resumir(doMes.dados ?? [], receitasDoMes), [doMes.dados, receitasDoMes]);
  const categoriasMes = useMemo(() => despesasPorCategoria(doMes.dados ?? []), [doMes.dados]);
  const diaria = useMemo(() => serieDiaria(doMes.dados ?? [], receitasDoMes, mes, ano), [doMes.dados, receitasDoMes, mes, ano]);
  const movimentosMes = useMemo(() => ordenarPorData([...(doMes.dados ?? []), ...receitasDoMes]), [doMes.dados, receitasDoMes]);

  const carregandoMes = (doMes.carregando && !doMes.dados) || (receitas.carregando && !receitas.dados);
  const erroMes = !mesPronto ? doMes.erro || receitas.erro : null;
  const recarregarMes = () => {
    doMes.recarregar();
    receitas.recarregar();
  };
  const nomeMes = formatarMesAno(mes, ano);

  return (
    <div className="relatorios">
      <section className="relatorios__secao">
        <div className="secao-titulo">
          <h2>Acumulado</h2>
          <p>Todo o histórico, calculado pelo backend.</p>
        </div>
        {resumo.erro && !resumo.dados && <EstadoErro erro={resumo.erro} onTentarNovamente={resumo.recarregar} compacto />}
        <div className="grade-stats grade-stats--3">
          <StatCard indice={0} titulo="Entradas" valor={resumo.dados?.entradas ?? 0} icone={ArrowDownLeft} tom="positivo" legenda="Receitas + transações de entrada" carregando={resumo.carregando && !resumo.dados} indisponivel={!resumo.dados && !!resumo.erro} />
          <StatCard indice={1} titulo="Saídas" valor={resumo.dados?.saidas ?? 0} icone={ArrowUpRight} tom="negativo" legenda="Transações de saída" carregando={resumo.carregando && !resumo.dados} indisponivel={!resumo.dados && !!resumo.erro} />
          <StatCard indice={2} titulo="Saldo" valor={resumo.dados?.saldo ?? 0} icone={Landmark} tom="auto" legenda="Entradas − saídas" carregando={resumo.carregando && !resumo.dados} indisponivel={!resumo.dados && !!resumo.erro} />
        </div>
      </section>

      <section className="relatorios__secao">
        <div className="secao-titulo secao-titulo--com-acoes">
          <div>
            <h2>Relatório mensal</h2>
            <p>{nomeMes}</p>
          </div>
          <div className="secao-titulo__acoes">
            <SeletorMes mes={mes} ano={ano} onChange={setPeriodo} />
            <button
              type="button"
              className="botao botao--secundario"
              disabled={!mesPronto || !movimentosMes.length}
              onClick={() => exportarMovimentacoesCsv(movimentosMes, `relatorio-${ano}-${String(mes).padStart(2, '0')}.csv`)}
              title={movimentosMes.length ? 'Baixar as movimentações do mês em CSV' : 'Sem movimentações para exportar'}
            >
              <Download size={16} /> Exportar CSV
            </button>
          </div>
        </div>

        {erroMes ? (
          <EstadoErro erro={erroMes} onTentarNovamente={recarregarMes} />
        ) : (
          <>
            <div className="grade-stats grade-stats--3">
              <StatCard indice={0} titulo="Entradas no mês" valor={resumoMes.entradas} icone={ArrowDownLeft} tom="positivo" legenda={`${receitasDoMes.length} receita(s) + ${(doMes.dados ?? []).filter((t) => t.tipo === 'ENTRADA').length} entrada(s)`} carregando={carregandoMes} />
              <StatCard indice={1} titulo="Saídas no mês" valor={resumoMes.saidas} icone={ArrowUpRight} tom="negativo" legenda={`${(doMes.dados ?? []).filter((t) => t.tipo === 'SAIDA').length} transação(ões) de saída`} carregando={carregandoMes} />
              <StatCard indice={2} titulo="Resultado do mês" valor={resumoMes.resultado} icone={Scale} tom="auto" legenda="Entradas − saídas do mês" carregando={carregandoMes} />
            </div>

            <div className="grade-relatorios">
              <Painel indice={1} titulo="Despesas por categoria" subtitulo={nomeMes} acoes={<ChartColumn size={18} className="texto-suave" />}>
                {carregandoMes ? (
                  <Skeleton altura={220} raio={12} />
                ) : categoriasMes.length ? (
                  <CategoriaBarrasChart dados={categoriasMes} />
                ) : (
                  <EstadoVazio icone={ChartColumn} titulo="Sem despesas neste mês" />
                )}
              </Painel>

              <Painel indice={2} titulo="Evolução no mês" subtitulo="Resultado acumulado dia a dia" acoes={<ChartLine size={18} className="texto-suave" />}>
                {carregandoMes ? (
                  <Skeleton altura={260} raio={12} />
                ) : movimentosMes.length ? (
                  <EvolucaoChart dados={diaria} chaveX="dia" chaveAcumulado="acumulado" nomeAcumulado="Resultado acumulado" mostrarResultado={false} altura={260} />
                ) : (
                  <EstadoVazio icone={ChartLine} titulo="Sem movimentações neste mês" />
                )}
              </Painel>
            </div>

            <Painel indice={3} titulo="Movimentações do mês" subtitulo={mesPronto ? `${movimentosMes.length} lançamento(s)` : undefined} acoes={<List size={18} className="texto-suave" />}>
              {carregandoMes ? (
                <SkeletonLista linhas={4} />
              ) : movimentosMes.length ? (
                <>
                  <ListaMovimentacoes itens={movimentosMes} />
                  <div className="tabela-total">
                    <span>Resultado</span>
                    <strong className={resumoMes.resultado < 0 ? 'negativo' : 'positivo'}>{formatarMoeda(resumoMes.resultado)}</strong>
                  </div>
                </>
              ) : (
                <EstadoVazio icone={List} titulo="Nenhuma movimentação" descricao="Escolha outro mês ou registre uma nova movimentação." />
              )}
            </Painel>
          </>
        )}
      </section>

      <section className="relatorios__secao">
        <Painel indice={4} titulo="Despesas por categoria — acumulado" subtitulo="Soma de todas as saídas, por categoria (calculado pelo backend)" acoes={<PieIcon size={18} className="texto-suave" />}>
          {categoriasTotal.erro && !categoriasTotal.dados ? (
            <EstadoErro erro={categoriasTotal.erro} onTentarNovamente={categoriasTotal.recarregar} compacto />
          ) : categoriasTotal.carregando && !categoriasTotal.dados ? (
            <Skeleton altura={240} raio={12} />
          ) : categoriasTotal.dados.length ? (
            <div className="relatorios__donut">
              <CategoriaDonutChart dados={categoriasTotal.dados} altura={240} limiteLegenda={10} />
            </div>
          ) : (
            <EstadoVazio icone={PieIcon} titulo="Nenhuma despesa registrada" />
          )}
        </Painel>
      </section>

      <Nota titulo="Sobre os dados:">
        o endpoint mensal do backend retorna apenas transações. As receitas do mês são somadas aqui a partir da lista de
        receitas, seguindo a mesma regra do resumo do backend (entradas = receitas + transações de entrada).
      </Nota>
    </div>
  );
}
