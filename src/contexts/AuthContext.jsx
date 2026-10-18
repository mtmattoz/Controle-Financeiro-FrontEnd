import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService';

/**
 * Sessão do usuário.
 *
 * LIMITAÇÃO REAL DO BACKEND: não existe token, cookie de sessão nem verificação
 * de identidade nas rotas. O login apenas confere a senha e devolve
 * { id, nomeUsuario, criadoEm }. Guardamos SÓ esses dados públicos no
 * localStorage (nunca a senha) para lembrar quem está usando o app.
 * Isso NÃO é autenticação segura — ver docs/API_ENDPOINTS.md.
 */

const CHAVE = 'cfi:usuario';
const AuthContext = createContext(null);

function lerUsuarioSalvo() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if (salvo && salvo.id != null && typeof salvo.nomeUsuario === 'string') return salvo;
  } catch {
    /* armazenamento indisponível ou corrompido */
  }
  return null;
}

function salvarUsuario(usuario) {
  try {
    if (usuario) localStorage.setItem(CHAVE, JSON.stringify(usuario));
    else localStorage.removeItem(CHAVE);
  } catch {
    /* modo privado: a sessão dura até fechar a aba */
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo);

  const iniciarSessao = useCallback((dto) => {
    const dados = { id: dto.id, nomeUsuario: dto.nomeUsuario, criadoEm: dto.criadoEm ?? null };
    salvarUsuario(dados);
    setUsuario(dados);
    return dados;
  }, []);

  const login = useCallback(
    async (nomeUsuario, senha) => iniciarSessao(await authService.login(nomeUsuario.trim(), senha)),
    [iniciarSessao],
  );

  /** Cadastra e em seguida faz o login real com as mesmas credenciais. */
  const cadastrar = useCallback(
    async (nomeUsuario, senha) => {
      await authService.cadastrar(nomeUsuario.trim(), senha);
      return iniciarSessao(await authService.login(nomeUsuario.trim(), senha));
    },
    [iniciarSessao],
  );

  const logout = useCallback(() => {
    salvarUsuario(null);
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, login, cadastrar, logout }), [usuario, login, cadastrar, logout]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return contexto;
}
