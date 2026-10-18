import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

/** ENTRADA (verde) / SAIDA (coral). origem 'receita' mostra o selo "Receita". */
export default function BadgeTipo({ tipo, origem }) {
  if (origem === 'receita') {
    return (
      <span className="badge badge--receita">
        <ArrowDownLeft size={13} /> Receita
      </span>
    );
  }
  return tipo === 'ENTRADA' ? (
    <span className="badge badge--entrada">
      <ArrowDownLeft size={13} /> Entrada
    </span>
  ) : (
    <span className="badge badge--saida">
      <ArrowUpRight size={13} /> Saída
    </span>
  );
}
