import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft, ArrowUpRight, Landmark, Scale, Sparkles, Plus, Wallet, ChartPie as PieIcon, ChartLine, ChartColumn, ListOrdered, ArrowRight,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Painel from '../components/ui/Painel';
import SeletorMes from '../components/ui/SeletorMes';
import { EstadoErro, EstadoVazio, Skeleton, SkeletonLista } from '../components/ui/Estados';
import EntradasSaidasChart from '../components/charts/EntradasSaidasChart';
import EvolucaoChart from '../components/charts/EvolucaoChart';
import CategoriaDonutChart from '../components/charts/CategoriaDonutChart';
import ListaMovimentacoes from '../components/movimentacoes/ListaMovimentacoes';
import { useAuth } from '../contexts/AuthContext';
import { useNovaMovimentacao } from '../contexts/NovaMovimentacaoContext';
import { useApiData } from '../hooks/useApiData';
import * as relatorioService from '../services/relatorioService';
import * as transacaoService from '../services/transacaoService';
import * as receitaService from '../services/receitaService';
import { formatarMesAno, mesAtual } from '../utils/format';
import { noMes, ordenarPorData, resumir, serieMensal, ultimosMeses } from '../utils/financas';

/**
 * Fontes de dados (todas reais):
 *  - Indicadores acumulados ........ GET /relatorio/usuario/{id}
 *  - Despesas por categoria ......... GET /relatorio/usuario/{id}/categorias  (SAIDA, todo o período)
 *  - Resultado do mês ............... GET /relatorio/usuario/{id}/mes  + receitas do mês (GET /receita/usuario/{id})
 *  - Gráficos mensais e recentes .... GET /transacao/usuario/{id} + GET /receita/usuario/{id}
 */
export default function Dashboard() {
  const { usuario } = useAuth();
  const { abrir } = useNovaMovimentacao();
  const [periodo, setPeriodo] = useState(mesAtual);
  const uid = usuario.id;

  const resumo = useApiData(() => relatorioService.resumo(uid), [uid]);
  const categorias = useApiData(() => relatorioService.despesasPorCategoria(uid), [uid]);
  const doMes = useApiData(() => relatorioService.transacoesDoMes(uid, periodo.mes, periodo.ano), [uid, periodo.mes, periodo.ano]);
  const transacoes = useApiData(() => transacaoService.listar(uid), [uid]);
  const receitas = useApiData(() => receitaService.listar(uid), [uid]);

  const receitasDoMes = useMemo(
    () => (receitas.dados ?? []).filter((r) => noMes(r, periodo.mes, periodo.ano)),
    [receitas.dados, periodo],
  );
  const resumoMes = useMemo(() => resumir(doMes.dados ?? [], receitasDoMes), [doMes.dados, receitasDoMes]);

  const serie = useMemo(() => {
    if (!transacoes.dados || !receitas.dados) return null;
    return serieMensal(transacoes.dados, receitas.dados, ultimosMeses(periodo.mes, periodo.ano, 6));
  }, [transacoes.dados, receitas.dados, periodo]);

  const recentes = useMemo(() => {
    if (!transacoes.dados || !receitas.dados) return null;
    return ordenarPorData([...transacoes.dados, ...receitas.dados]).slice(0, 6);
  }, [transacoes.dados, receitas.dados]);

  const historicoCarregando = (transacoes.carregando && !transacoes.dados) || (receitas.carregando && !receitas.dados);
  const historicoErro = transacoes.erro || receitas.erro;
  const recarregarHistorico = () => {
    transacoes.recarregar();
    receitas.recarregar();
  };
  const semMovimentos = serie && serie.every((m) => m.entradas === 0 && m.saidas === 0);
  const nomeMes = formatarMesAno(periodo.mes, periodo.ano);

  return (
    <div className="dashboard">
      <section className="dashboard__topo">
        <div>
          <h2 className="saudacao">Olá, {usuario.nomeUsuario} 👋</h2>
          <p className="texto-suave">Aqui está o resumo das suas finanças.</p>
        </div>
        <div className="dashboard__controles">
          <SeletorMes mes={periodo.mes} ano={periodo.ano} onChange={setPeriodo} />
        </div>
      </section>

      <div className="atalhos">
        <button type="button" className="atalho atalho--saida" onClick={() => abrir('SAIDA')}>
          <ArrowUpRight size={18} /> Nova despesa
        </button>
        <button type="button" className="atalho atalho--entrada" onClick={() => abrir('ENTRADA')}>
          <ArrowDownLeft size={18} /> Nova entrada
        </button>
        <button type="button" className="atalho atalho--receita" onClick={() => abrir('RECEITA')}>
          <Wallet size={18} /> Nova receita
        </button>
        <Link to="/assistente" className="atalho atalho--ia">
          <Sparkles size={18} /> Registrar com IA
        </Link>
      </div>

      {resumo.erro && !resumo.dados && <EstadoErro erro={resumo.erro} onTentarNovamente={resumo.recarregar} compacto />}

      <div className="grade-stats">
        <StatCard
          indice={0}
          titulo="Saldo atual"
          valor={resumo.dados?.saldo ?? 0}
          icone={Landmark}
          tom="auto"
          legenda="Entradas − saídas, todo o período"
          carregando={resumo.carregando && !resumo.dados}
          indisponivel={!resumo.dados && !!resumo.erro}
        />
        <StatCard
          indice={1}
          titulo="Total de entradas"
          valor={resumo.dados?.entradas ?? 0}
          icone={ArrowDownLeft}
          tom="positivo"
          legenda="Receitas + transações de entrada"
          carregando={resumo.carregando && !resumo.dados}
          indisponivel={!resumo.dados && !!resumo.erro}
        />
        <StatCard
          indice={2}
          titulo="Total de saídas"
          valor={resumo.dados?.saidas ?? 0}
          icone={ArrowUpRight}
          tom="negativo"
          legenda="Transações de saída, todo o período"
          carregando={resumo.carregando && !resumo.dados}
          indisponivel={!resumo.dados && !!resumo.erro}
        />
        <StatCard
          indice={3}
          titulo={`Resultado de ${nomeMes}`}
          valor={resumoMes.resultado}
          icone={Scale}
          tom="auto"
          legenda="Entradas − saídas do mês selecionado"
          carregando={(doMes.carregando && !doMes.dados) || (receitas.carregando && !receitas.dados)}
          indisponivel={!!(doMes.erro || receitas.erro) && !(doMes.dados && receitas.dados)}
        />
      </div>

      <div className="grade-dashboard">
        <Painel
          className="area-barras"
          indice={1}
          titulo="Entradas x saídas"
          subtitulo={`Últimos 6 meses até ${nomeMes}`}
          acoes={<ChartColumn size={18} className="texto-suave" />}
        >
          {historicoErro && !serie ? (
            <EstadoErro erro={historicoErro} onTentarNovamente={recarregarHistorico} compacto />
          ) : historicoCarregando ? (
            <Skeleton altura={280} raio={12} />
          ) : semMovimentos ? (
            <EstadoVazio icone={ChartColumn} titulo="Sem movimentações nesses meses" descricao="Registre uma entrada ou despesa para ver o gráfico." />
          ) : (
            <EntradasSaidasChart dados={serie} />
          )}
        </Painel>

        <Painel
          className="area-donut"
          indice={2}
          titulo="Despesas por categoria"
          subtitulo="Todas as saídas registradas"
          acoes={<PieIcon size={18} className="texto-suave" />}
        >
          {categorias.erro && !categorias.dados ? (
            <EstadoErro erro={categorias.erro} onTentarNovamente={categorias.recarregar} compacto />
          ) : categorias.carregando && !categorias.dados ? (
            <Skeleton altura={260} raio={12} />
          ) : !categorias.dados.length ? (
            <EstadoVazio icone={PieIcon} titulo="Nenhuma despesa ainda" descricao="As saídas aparecem aqui agrupadas por categoria." />
          ) : (
            <CategoriaDonutChart dados={categorias.dados} />
          )}
        </Painel>

        <Painel
          className="area-evolucao"
          indice={3}
          titulo="Evolução financeira"
          subtitulo="Saldo acumulado no fim de cada mês e resultado mensal"
          acoes={<ChartLine size={18} className="texto-suave" />}
        >
          {historicoErro && !serie ? (
            <EstadoErro erro={historicoErro} onTentarNovamente={recarregarHistorico} compacto />
          ) : historicoCarregando ? (
            <Skeleton altura={280} raio={12} />
          ) : semMovimentos ? (
            <EstadoVazio icone={ChartLine} titulo="Ainda não há evolução para mostrar" descricao="Assim que houver movimentações, o saldo acumulado aparece aqui." />
          ) : (
            <EvolucaoChart dados={serie} />
          )}
        </Painel>

        <Painel
          className="area-recentes"
          indice={4}
          titulo="Movimentações recentes"
          acoes={
            <Link to="/transacoes" className="link-acao">
              Ver todas <ArrowRight size={15} />
            </Link>
          }
        >
          {historicoErro && !recentes ? (
            <EstadoErro erro={historicoErro} onTentarNovamente={recarregarHistorico} compacto />
          ) : historicoCarregando ? (
            <SkeletonLista linhas={5} />
          ) : !recentes.length ? (
            <EstadoVazio
              icone={ListOrdered}
              titulo="Nada por aqui ainda"
              descricao="Suas últimas transações e receitas aparecerão nesta lista."
              acao={
                <button type="button" className="botao botao--primario botao--pequeno" onClick={() => abrir('SAIDA')}>
                  <Plus size={15} /> Registrar movimentação
                </button>
              }
            />
          ) : (
            <ListaMovimentacoes itens={recentes} compacta />
          )}
        </Painel>
      </div>

      <motion.div
        className="banner-ia"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="banner-ia__icone">
          <Sparkles size={22} />
        </span>
        <div>
          <strong>Registre em uma frase</strong>
          <p>“Gastei 50 reais com alimentação ontem.” A IA preenche os campos e você confirma antes de salvar.</p>
        </div>
        <Link to="/assistente" className="botao botao--primario">
          Abrir assistente <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}
