import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, CircleAlert, X } from 'lucide-react';

/** Notificações curtas de sucesso/erro. Só são disparadas após a resposta do servidor. */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const proximoId = useRef(1);

  const remover = useCallback((id) => setToasts((lista) => lista.filter((t) => t.id !== id)), []);

  const mostrar = useCallback(
    (tipo, mensagem) => {
      const id = proximoId.current++;
      setToasts((lista) => [...lista.slice(-3), { id, tipo, mensagem }]);
      setTimeout(() => remover(id), tipo === 'erro' ? 6000 : 4000);
    },
    [remover],
  );

  const api = useMemo(
    () => ({
      sucesso: (mensagem) => mostrar('sucesso', mensagem),
      erro: (mensagem) => mostrar('erro', mensagem),
    }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-area" aria-live="polite" aria-atomic="false">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              className={`toast toast--${t.tipo}`}
              role={t.tipo === 'erro' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
            >
              {t.tipo === 'erro' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
              <span>{t.mensagem}</span>
              <button type="button" className="toast__fechar" onClick={() => remover(t.id)} aria-label="Fechar">
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  return contexto;
}
