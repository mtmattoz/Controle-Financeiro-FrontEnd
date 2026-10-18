import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MESES } from '../../utils/format';

/** Escolha de mês/ano com setas. Usado com GET /relatorio/usuario/{id}/mes?mes=&ano= */
export default function SeletorMes({ mes, ano, onChange }) {
  const mover = (delta) => {
    const data = new Date(ano, mes - 1 + delta, 1);
    onChange({ mes: data.getMonth() + 1, ano: data.getFullYear() });
  };
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 8 }, (_, i) => anoAtual - 5 + i);
  if (!anos.includes(ano)) anos.push(ano);

  return (
    <div className="seletor-mes" role="group" aria-label="Selecionar mês">
      <button type="button" className="botao-icone" onClick={() => mover(-1)} aria-label="Mês anterior">
        <ChevronLeft size={18} />
      </button>
      <select value={mes} onChange={(e) => onChange({ mes: Number(e.target.value), ano })} aria-label="Mês">
        {MESES.map((nome, i) => (
          <option key={nome} value={i + 1}>
            {nome.charAt(0).toUpperCase() + nome.slice(1)}
          </option>
        ))}
      </select>
      <select value={ano} onChange={(e) => onChange({ mes, ano: Number(e.target.value) })} aria-label="Ano">
        {anos.sort().map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <button type="button" className="botao-icone" onClick={() => mover(1)} aria-label="Próximo mês">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
