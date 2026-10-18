import { formatarMoeda } from '../../utils/format';

/** Tooltip padrão dos gráficos, com valores em reais. */
export default function TooltipMoeda({ active, payload, label, rotuloPrefixo = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="grafico-tooltip">
      {label !== undefined && label !== '' && <span className="grafico-tooltip__titulo">{rotuloPrefixo}{label}</span>}
      {payload.map((item) => (
        <div key={item.dataKey ?? item.name} className="grafico-tooltip__linha">
          <i style={{ background: item.color || item.payload?.fill }} />
          <span>{item.name}</span>
          <strong>{formatarMoeda(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}
