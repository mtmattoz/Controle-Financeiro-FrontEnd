import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import TooltipMoeda from './TooltipMoeda';
import { corDaCategoria } from '../../utils/categoriaVisual';
import { formatarMoeda } from '../../utils/format';
import { useAnimacaoGraficos } from '../../hooks/useAnimacaoGraficos';

/** Rosca de despesas por categoria + legenda com valor e percentual. */
export default function CategoriaDonutChart({ dados, altura = 220, limiteLegenda = 6 }) {
  const animar = useAnimacaoGraficos();
  const total = dados.reduce((soma, d) => soma + d.valor, 0);

  return (
    <div className="donut">
      <div className="donut__grafico">
        <ResponsiveContainer width="100%" height={altura}>
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={dados.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={animar}
            >
              {dados.map((d) => (
                <Cell key={d.nome} fill={corDaCategoria(d.nome)} />
              ))}
            </Pie>
            <Tooltip content={<TooltipMoeda />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut__centro">
          <span>Total</span>
          <strong>{formatarMoeda(total)}</strong>
        </div>
      </div>
      <ul className="donut__legenda">
        {dados.slice(0, limiteLegenda).map((d) => (
          <li key={d.nome}>
            <i style={{ background: corDaCategoria(d.nome) }} />
            <span className="donut__nome">{d.nome}</span>
            <span className="donut__pct">{total ? Math.round((d.valor / total) * 100) : 0}%</span>
            <strong>{formatarMoeda(d.valor)}</strong>
          </li>
        ))}
        {dados.length > limiteLegenda && <li className="donut__mais">+ {dados.length - limiteLegenda} categorias</li>}
      </ul>
    </div>
  );
}
