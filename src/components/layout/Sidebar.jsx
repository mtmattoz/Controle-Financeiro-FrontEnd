import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsLeft, LogOut, X } from 'lucide-react';
import { ITENS_MENU } from './navegacao';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../ui/Logo';
import { iniciais } from '../../utils/format';

export default function Sidebar({ recolhido, onAlternarRecolhido, aberto, onFechar }) {
  const { usuario, logout } = useAuth();

  const conteudo = (mobile) => (
    <>
      <div className="sidebar__topo">
        <Logo compacto={recolhido && !mobile} />
        {mobile ? (
          <button type="button" className="botao-icone" onClick={onFechar} aria-label="Fechar menu">
            <X size={20} />
          </button>
        ) : (
          <button
            type="button"
            className="botao-icone sidebar__recolher"
            onClick={onAlternarRecolhido}
            aria-label={recolhido ? 'Expandir menu' : 'Recolher menu'}
            title={recolhido ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronsLeft size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar__nav" aria-label="Navegação principal">
        {ITENS_MENU.map(({ caminho, rotulo, icone: Icone }) => (
          <NavLink
            key={caminho}
            to={caminho}
            end={caminho === '/'}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--ativo' : ''}`}
            title={recolhido && !mobile ? rotulo : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId={mobile ? 'indicador-mobile' : 'indicador'}
                    className="sidebar__indicador"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icone size={19} className="sidebar__icone" />
                <span className="sidebar__rotulo">{rotulo}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__rodape">
        <div className="sidebar__usuario" title={usuario?.nomeUsuario}>
          <span className="avatar">{iniciais(usuario?.nomeUsuario)}</span>
          <span className="sidebar__usuario-nome">{usuario?.nomeUsuario}</span>
        </div>
        <button type="button" className="sidebar__sair" onClick={logout} title="Sair">
          <LogOut size={18} />
          <span className="sidebar__rotulo">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="sidebar sidebar--desktop">{conteudo(false)}</aside>

      <AnimatePresence>
        {aberto && (
          <>
            <motion.div
              className="sidebar-fundo"
              onClick={onFechar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="sidebar sidebar--mobile"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              aria-label="Menu"
            >
              {conteudo(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
