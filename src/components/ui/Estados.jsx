import { motion } from 'framer-motion';
import { CircleAlert, Info, RefreshCw, WifiOff } from 'lucide-react';
import { mensagemDeErro } from '../../services/api';

/** Bloco cinza animado exibido enquanto os dados carregam. */
export function Skeleton({ altura = 16, largura = '100%', raio, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ height: altura, width: largura, borderRadius: raio }}
      aria-hidden="true"
    />
  );
}

export function SkeletonLista({ linhas = 5 }) {
  return (
    <div className="skeleton-lista" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <div className="skeleton-lista__linha" key={i}>
          <Skeleton altura={38} largura={38} raio={10} />
          <div className="skeleton-lista__textos">
            <Skeleton altura={13} largura="55%" />
            <Skeleton altura={11} largura="30%" />
          </div>
          <Skeleton altura={14} largura={84} />
        </div>
      ))}
    </div>
  );
}

export function EstadoVazio({ icone: Icone, titulo, descricao, acao }) {
  return (
    <motion.div className="estado-vazio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {Icone && (
        <span className="estado-vazio__icone">
          <Icone size={26} />
        </span>
      )}
      <h3>{titulo}</h3>
      {descricao && <p>{descricao}</p>}
      {acao}
    </motion.div>
  );
}

export function EstadoErro({ erro, contexto, onTentarNovamente, compacto = false }) {
  const semConexao = erro?.codigo === 'REDE';
  const Icone = semConexao ? WifiOff : CircleAlert;
  return (
    <div className={`estado-erro ${compacto ? 'estado-erro--compacto' : ''}`} role="alert">
      <Icone size={compacto ? 18 : 24} />
      <div>
        <strong>{semConexao ? 'Sem conexão com a API' : 'Não foi possível carregar'}</strong>
        <p>{mensagemDeErro(erro, contexto)}</p>
      </div>
      {onTentarNovamente && (
        <button type="button" className="botao botao--secundario botao--pequeno" onClick={onTentarNovamente}>
          <RefreshCw size={14} /> Tentar novamente
        </button>
      )}
    </div>
  );
}

/** Aviso discreto que explica uma limitação real do backend. */
export function Nota({ children, titulo }) {
  return (
    <div className="nota">
      <Info size={16} />
      <div>
        {titulo && <strong>{titulo} </strong>}
        {children}
      </div>
    </div>
  );
}
