import { motion } from 'framer-motion';
import { Skeleton } from './Estados';
import { formatarMoeda } from '../../utils/format';

/**
 * Indicador financeiro. tom: 'marca' | 'positivo' | 'negativo' | 'azul' | 'roxo' | 'auto'
 * ('auto' fica verde se positivo e coral se negativo).
 */
export default function StatCard({ titulo, valor, icone: Icone, tom = 'marca', legenda, carregando, indisponivel, indice = 0 }) {
  const tomFinal = tom === 'auto' ? (valor < 0 ? 'negativo' : 'positivo') : tom;
  return (
    <motion.article
      className={`stat stat--${tomFinal}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: indice * 0.06, duration: 0.3 }}
    >
      <div className="stat__topo">
        <span className="stat__titulo">{titulo}</span>
        {Icone && (
          <span className="stat__icone">
            <Icone size={18} />
          </span>
        )}
      </div>
      {carregando ? (
        <Skeleton altura={30} largura="70%" className="stat__skeleton" />
      ) : indisponivel ? (
        <strong className="stat__valor stat__valor--indisponivel">—</strong>
      ) : (
        <strong className="stat__valor">{formatarMoeda(valor)}</strong>
      )}
      {legenda && <span className="stat__legenda">{legenda}</span>}
    </motion.article>
  );
}
