import { motion } from 'framer-motion';

/** Card branco com título, usado em todas as páginas. */
export default function Painel({ titulo, subtitulo, acoes, children, className = '', indice = 0, as = 'section' }) {
  const Componente = motion[as] ?? motion.section;
  return (
    <Componente
      className={`painel ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + indice * 0.06, duration: 0.32 }}
    >
      {(titulo || acoes) && (
        <header className="painel__cabecalho">
          <div>
            {titulo && <h2>{titulo}</h2>}
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          {acoes && <div className="painel__acoes">{acoes}</div>}
        </header>
      )}
      {children}
    </Componente>
  );
}
