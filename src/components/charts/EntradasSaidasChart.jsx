import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TooltipMoeda from './TooltipMoeda';
import { CORES } from './cores';
import { formatarMoedaCompacta } from '../../utils/format';
import { useAnimacaoGraficos } from '../../hooks/useAnimacaoGraficos';

/** Barras lado a lado: entradas (verde) x saídas (coral) por mês. */
export default function EntradasSaidasChart({ dados, altura = 280 }) {
  const animar = useAnimacaoGraficos();
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} barGap={4} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CORES.grade} />
        <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tick={{ fill: CORES.eixo, fontSize: 12 }} />
        <YAxis tickFormatter={formatarMoedaCompacta} tickLine={false} axisLine={false} width={72} tick={{ fill: CORES.eixo, fontSize: 12 }} />
        <Tooltip content={<TooltipMoeda />} cursor={{ fill: 'rgba(5, 150, 105, 0.06)' }} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
        <Bar dataKey="entradas" name="Entradas" fill={CORES.entrada} radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={animar} />
        <Bar dataKey="saidas" name="Saídas" fill={CORES.saida} radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={animar} />
      </BarChart>
    </ResponsiveContainer>
  );
}
