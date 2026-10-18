import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TooltipMoeda from './TooltipMoeda';
import { CORES } from './cores';
import { corDaCategoria } from '../../utils/categoriaVisual';
import { formatarMoedaCompacta } from '../../utils/format';
import { useAnimacaoGraficos } from '../../hooks/useAnimacaoGraficos';

/** Barras horizontais de despesas por categoria. */
export default function CategoriaBarrasChart({ dados }) {
  const animar = useAnimacaoGraficos();
  const altura = Math.max(160, dados.length * 42 + 30);
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={CORES.grade} />
        <XAxis type="number" tickFormatter={formatarMoedaCompacta} tickLine={false} axisLine={false} tick={{ fill: CORES.eixo, fontSize: 12 }} />
        <YAxis type="category" dataKey="nome" width={110} tickLine={false} axisLine={false} tick={{ fill: '#3d4a4d', fontSize: 13 }} />
        <Tooltip content={<TooltipMoeda />} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
        <Bar dataKey="valor" name="Despesas" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={animar}>
          {dados.map((d) => (
            <Cell key={d.nome} fill={corDaCategoria(d.nome)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
