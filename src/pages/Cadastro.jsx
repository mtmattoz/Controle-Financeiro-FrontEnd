import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoaderCircle, UserPlus } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Campo from '../components/ui/Campo';
import CampoSenha from '../components/forms/CampoSenha';
import { useAuth } from '../contexts/AuthContext';
import { mensagemDeErro } from '../services/api';
import { errosDoServidor } from '../components/forms/validacao';

/**
 * POST /usuario/cadastrar { nomeUsuario, senha }
 * Regras do backend: nome obrigatório (até 50, único), senha com no mínimo 6 caracteres.
 * Nome repetido gera RuntimeException sem handler → HTTP 500 sem mensagem; por isso
 * explicamos a causa provável.
 */
export default function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nomeUsuario: '', senha: '', confirmacao: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    setErroGeral('');
  };

  async function enviar(e) {
    e.preventDefault();
    const encontrados = {};
    const nome = form.nomeUsuario.trim();
    if (!nome) encontrados.nomeUsuario = 'Escolha um nome de usuário.';
    else if (nome.length > 50) encontrados.nomeUsuario = 'Use no máximo 50 caracteres.';
    if (form.senha.length < 6) encontrados.senha = 'A senha deve ter no mínimo 6 caracteres.';
    if (form.confirmacao !== form.senha) encontrados.confirmacao = 'As senhas não conferem.';
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      await cadastrar(nome, form.senha);
      navigate('/', { replace: true });
    } catch (erro) {
      setErros(errosDoServidor(erro));
      setErroGeral(
        mensagemDeErro(erro, {
          500: 'Não foi possível criar a conta. Esse nome de usuário provavelmente já está em uso — tente outro.',
        }),
      );
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      titulo="Crie sua conta"
      subtitulo="Leva menos de um minuto. Depois é só registrar suas movimentações."
      rodape={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form className="formulario" onSubmit={enviar} noValidate>
        <Campo rotulo="Nome de usuário" erro={erros.nomeUsuario} dica="Até 50 caracteres. Será usado para entrar.">
          <input type="text" value={form.nomeUsuario} onChange={alterar('nomeUsuario')} maxLength={50} autoComplete="username" autoFocus />
        </Campo>
        <Campo rotulo="Senha" erro={erros.senha} dica="Mínimo de 6 caracteres.">
          <CampoSenha value={form.senha} onChange={alterar('senha')} autoComplete="new-password" />
        </Campo>
        <Campo rotulo="Confirmar senha" erro={erros.confirmacao}>
          <CampoSenha value={form.confirmacao} onChange={alterar('confirmacao')} autoComplete="new-password" />
        </Campo>

        {erroGeral && <p className="formulario__erro" role="alert">{erroGeral}</p>}

        <button type="submit" className="botao botao--primario botao--grande" disabled={enviando}>
          {enviando ? <LoaderCircle size={18} className="girando" /> : <UserPlus size={18} />}
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  );
}
