import api, { garantirObjeto } from './api';

/**
 * UsuarioController — @RequestMapping("/usuario")
 *
 * Importante: o backend NÃO emite token/sessão. O login só confere a senha e
 * devolve { id, nomeUsuario, criadoEm }. As demais rotas recebem o usuarioId na
 * URL, sem verificar quem está chamando.
 */

/**
 * POST /usuario/cadastrar
 * Corpo: { nomeUsuario, senha }  (validação: nome obrigatório, senha ≥ 6)
 * Resposta 200: UsuarioResponseDTO { id, nomeUsuario, criadoEm }
 * Erros: 400 { campo: mensagem } · 500 se o nome já existir (RuntimeException não tratada)
 */
export async function cadastrar(nomeUsuario, senha) {
  const { data } = await api.post('/usuario/cadastrar', { nomeUsuario, senha });
  return garantirObjeto(data, 'cadastro de usuário', ['id', 'nomeUsuario']);
}

/**
 * POST /usuario/login
 * Parâmetros: @RequestParam nomeUsuario, @RequestParam senha
 *
 * Os parâmetros são enviados no corpo como application/x-www-form-urlencoded
 * (o Spring lê @RequestParam do corpo de formulário). Assim a senha não vai
 * para a URL nem para logs de acesso.
 *
 * Resposta 200: UsuarioResponseDTO { id, nomeUsuario, criadoEm }
 * Erros: 404 "Usuário não encontrado." · 401 "Senha incorreta." (texto puro)
 */
export async function login(nomeUsuario, senha) {
  const corpo = new URLSearchParams({ nomeUsuario, senha });
  const { data } = await api.post('/usuario/login', corpo);
  return garantirObjeto(data, 'login', ['id', 'nomeUsuario']);
}
