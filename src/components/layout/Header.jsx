import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus, Settings, Sparkles } from 'lucide-react';
import { paginaAtual } from './navegacao';
import { useAuth } from '../../contexts/AuthContext';
import { useNovaMovimentacao } from '../../contexts/NovaMovimentacaoContext';
import { iniciais } from '../../utils/format';

export default function Header({ onAbrirMenu }) {
  const { pathname } = useLocation();
  const { usuario } = useAuth();
  const { abrir } = useNovaMovimentacao();
  const pagina = paginaAtual(pathname);

  return (
    <header className="header">
      <button type="button" className="botao-icone header__menu" onClick={onAbrirMenu} aria-label="Abrir menu">
        <Menu size={22} />
      </button>

      <div className="header__titulo">
        <h1>{pagina.rotulo}</h1>
        <p>{pagina.descricao}</p>
      </div>

      <div className="header__acoes">
        <button type="button" className="botao botao--primario header__nova" onClick={() => abrir('SAIDA')}>
          <Plus size={18} />
          <span>Nova movimentação</span>
        </button>
        <Link to="/assistente" className="botao-icone" title="Assistente IA" aria-label="Assistente IA">
          <Sparkles size={19} />
        </Link>
        <Link to="/configuracoes" className="botao-icone header__config" title="Configurações" aria-label="Configurações">
          <Settings size={19} />
        </Link>
        <Link to="/configuracoes" className="header__usuario" title="Perfil">
          <span className="avatar">{iniciais(usuario?.nomeUsuario)}</span>
          <span className="header__usuario-nome">{usuario?.nomeUsuario}</span>
        </Link>
      </div>
    </header>
  );
}
