import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/** Modal acessível: fecha com Esc, foca o primeiro campo e trava a rolagem do fundo. */
export default function Modal({ aberto, onFechar, titulo, descricao, children, largura = 'md', bloquearFechamento = false }) {
  const idTitulo = useId();
  const caixa = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    const anterior = document.activeElement;
    const aoTeclar = (e) => {
      if (e.key === 'Escape' && !bloquearFechamento) onFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      const foco = caixa.current?.querySelector('[data-autofocus], input, select, textarea, button');
      foco?.focus();
    }, 60);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
      if (anterior instanceof HTMLElement) anterior.focus();
    };
  }, [aberto, onFechar, bloquearFechamento]);

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <div className="modal-raiz">
          <motion.div
            className="modal-fundo"
            onClick={() => !bloquearFechamento && onFechar()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={caixa}
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className={`modal modal--${largura}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="modal__cabecalho">
              <div>
                <h2 id={idTitulo}>{titulo}</h2>
                {descricao && <p>{descricao}</p>}
              </div>
              <button
                type="button"
                className="botao-icone"
                onClick={onFechar}
                disabled={bloquearFechamento}
                aria-label="Fechar"
              >
                <X size={19} />
              </button>
            </div>
            <div className="modal__corpo">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
