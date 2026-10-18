import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import TooltipMoeda from './TooltipMoeda';
import { CORES } from './cores';
import { formatarMoedaCompacta } from '../../utils/format';
import { useAnimacaoGraficos } from '../../hooks/useAnimacaoGraficos';

/**
 * Linha do saldo acumulado (azul) + resultado de cada período (roxo).
 * chaveX: 'rotulo' (mensal) ou 'dia' (diário). Se `apenasAcumulado`, mostra só a área.
 */
export default function EvolucaoChart({ dados, chaveX = 'rotulo', chaveAcumulado = 'saldoAcumulado', nomeAcumulado = 'Saldo acumulado', mostrarResultado = true, altura = 280 }) {
  const animar = useAnimacaoGraficos();
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <AreaChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${chaveAcumulado}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CORES.saldo} stopOpacity={0.22} />
            <stop offset="100%" stopColor={CORES.saldo} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CORES.grade} />
        <XAxis dataKey={chaveX} tickLine={false} axisLine={false} tick={{ fill: CORES.eixo, fontSize: 12 }} minTickGap={12} />
        <YAxis tickFormatter={formatarMoedaCompacta} tickLine={false} axisLine={false} width={72} tick={{ fill: CORES.eixo, fontSize: 12 }} />
        <ReferenceLine y={0} stroke="#cfd8d5" />
        <Tooltip content={<TooltipMoeda rotuloPrefixo={chaveX === 'dia' ? 'Dia ' : ''} />} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
        <Area
          type="monotone"
          dataKey={chaveAcumulado}
          name={nomeAcumulado}
          stroke={CORES.saldo}
          strokeWidth={2.5}
          fill={`url(#grad-${chaveAcumulado})`}
          dot={false}
          activeDot={{ r: 5 }}
          isAnimationActive={animar}
        />
        {mostrarResultado && (
          <Line
            type="monotone"
            dataKey="resultado"
            name="Resultado do mês"
            stroke={CORES.resultado}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3 }}
            isAnimationActive={animar}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
