import { useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { NovaMovimentacaoProvider } from '../../contexts/NovaMovimentacaoContext';

const CHAVE_RECOLHIDO = 'cfi:sidebar-recolhida';

function lerRecolhido() {
  try {
    return localStorage.getItem(CHAVE_RECOLHIDO) === '1';
  } catch {
    return false;
  }
}

export default function AppLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const [recolhido, setRecolhido] = useState(lerRecolhido);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_RECOLHIDO, recolhido ? '1' : '0');
    } catch {
      /* preferência apenas visual */
    }
  }, [recolhido]);

  // Fecha o menu do celular ao trocar de página.
  useEffect(() => setMenuMobileAberto(false), [location.pathname]);

  return (
    <NovaMovimentacaoProvider>
      <div className={`app ${recolhido ? 'app--recolhido' : ''}`}>
        <Sidebar
          recolhido={recolhido}
          onAlternarRecolhido={() => setRecolhido((r) => !r)}
          aberto={menuMobileAberto}
          onFechar={() => setMenuMobileAberto(false)}
        />

        <div className="app__conteudo">
          <Header onAbrirMenu={() => setMenuMobileAberto(true)} />
          <main className="app__main" id="conteudo">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                className="pagina"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </NovaMovimentacaoProvider>
  );
}
