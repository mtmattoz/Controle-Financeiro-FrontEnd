import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoaderCircle, LogIn } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Campo from '../components/ui/Campo';
import CampoSenha from '../components/forms/CampoSenha';
import { useAuth } from '../contexts/AuthContext';
import { mensagemDeErro } from '../services/api';

/** POST /usuario/login — erros reais: 404 "Usuário não encontrado." / 401 "Senha incorreta." */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ nomeUsuario: '', senha: '' });
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
    if (!form.nomeUsuario.trim()) encontrados.nomeUsuario = 'Informe seu nome de usuário.';
    if (!form.senha) encontrados.senha = 'Informe sua senha.';
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      await login(form.nomeUsuario, form.senha);
      navigate(location.state?.de || '/', { replace: true });
    } catch (erro) {
      setErroGeral(mensagemDeErro(erro));
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      titulo="Bem-vindo de volta"
      subtitulo="Entre com seu usuário para acessar seu painel financeiro."
      rodape={
        <>
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </>
      }
    >
      <form className="formulario" onSubmit={enviar} noValidate>
        <Campo rotulo="Nome de usuário" erro={erros.nomeUsuario}>
          <input type="text" value={form.nomeUsuario} onChange={alterar('nomeUsuario')} autoComplete="username" autoFocus />
        </Campo>
        <Campo rotulo="Senha" erro={erros.senha}>
          <CampoSenha value={form.senha} onChange={alterar('senha')} />
        </Campo>

        {erroGeral && <p className="formulario__erro" role="alert">{erroGeral}</p>}

        <button type="submit" className="botao botao--primario botao--grande" disabled={enviando}>
          {enviando ? <LoaderCircle size={18} className="girando" /> : <LogIn size={18} />}
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
