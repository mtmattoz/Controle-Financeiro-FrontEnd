import { useState } from 'react';
import { CircleCheck, LoaderCircle, LogOut, PlugZap, ShieldAlert, Server, UserRound, CircleX, Ban } from 'lucide-react';
import Painel from '../components/ui/Painel';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, mensagemDeErro } from '../services/api';
import * as categoriaService from '../services/categoriaService';
import { formatarDataHora, iniciais } from '../utils/format';


export default function Configuracoes() {
  const { usuario, logout } = useAuth();
  const [teste, setTeste] = useState({ estado: 'parado', mensagem: '' });

  async function testarConexao() {
    setTeste({ estado: 'testando', mensagem: '' });
    const inicio = performance.now();
    try {
      // Usa uma rota real e leve (lista de categorias do usuário).
      await categoriaService.listar(usuario.id);
      setTeste({ estado: 'ok', mensagem: `API respondeu em ${Math.round(performance.now() - inicio)} ms.` });
    } catch (erro) {
      setTeste({ estado: 'erro', mensagem: mensagemDeErro(erro) });
    }
  }

  return (
    <div className="configuracoes">
      <Painel indice={0} titulo="Perfil" acoes={<UserRound size={18} className="texto-suave" />}>
        <div className="perfil">
          <span className="avatar avatar--grande">{iniciais(usuario.nomeUsuario)}</span>
          <div>
            <strong className="perfil__nome">{usuario.nomeUsuario}</strong>
            <span className="perfil__info">ID do usuário: {usuario.id}</span>
            <span className="perfil__info">Conta criada em {formatarDataHora(usuario.criadoEm)}</span>
          </div>
        </div>
        <button type="button" className="botao botao--secundario" onClick={logout}>
          <LogOut size={16} /> Sair da conta
        </button>
      </Painel>

      <Painel indice={1} titulo="Conexão com a API" acoes={<Server size={18} className="texto-suave" />}>
        <dl className="definicoes">
          <div>
            <dt>Endereço</dt>
            <dd><code>{API_URL}</code></dd>
          </div>
          <div>
            <dt>Configuração</dt>
            <dd>Variável <code>VITE_API_URL</code> no arquivo <code>.env.local</code></dd>
          </div>
        </dl>
        <div className="teste-conexao">
          <button type="button" className="botao botao--secundario" onClick={testarConexao} disabled={teste.estado === 'testando'}>
            {teste.estado === 'testando' ? <LoaderCircle size={16} className="girando" /> : <PlugZap size={16} />}
            Testar conexão
          </button>
          {teste.estado === 'ok' && <span className="teste-conexao__ok"><CircleCheck size={16} /> {teste.mensagem}</span>}
          {teste.estado === 'erro' && <span className="teste-conexao__erro"><CircleX size={16} /> {teste.mensagem}</span>}
        </div>
      </Painel>

      <Painel indice={2} titulo="Segurança da sessão" acoes={<ShieldAlert size={18} className="texto-suave" />} className="painel--alerta">
        <p className="texto-corrido">
          O backend atual confere usuário e senha no login, mas <strong>não emite token nem sessão</strong>. As demais rotas
          recebem o ID do usuário na URL e não verificam quem está fazendo a requisição. Por isso, este app guarda no
          navegador apenas seu ID e nome de usuário (nunca a senha) para saber de quem são os dados exibidos.
        </p>
        <p className="texto-corrido">
          Isso é adequado para estudo e demonstração local, mas <strong>não é autenticação segura</strong>. O próximo passo
          recomendado no backend é adotar Spring Security com JWT e obter o usuário a partir do token.
        </p>
      </Painel>

      <Painel indice={3} titulo="Ações sem suporte no backend" acoes={<Ban size={18} className="texto-suave" />}>
        <ul className="lista-limitacoes">
          <li>Editar nome de usuário ou senha</li>
          <li>Excluir a conta</li>
          <li>Editar transações, receitas ou categorias (apenas criar e excluir)</li>
        </ul>
        <p className="texto-suave">Essas opções aparecem aqui assim que as rotas correspondentes existirem na API.</p>
      </Painel>
    </div>
  );
}
