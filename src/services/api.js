import axios from 'axios';

/**
 * Cliente HTTP central da aplicação.
 *
 * Todas as chamadas ao backend passam por aqui. Os componentes nunca usam o
 * Axios diretamente: eles chamam os serviços de cada módulo (authService,
 * categoriaService, etc.), que por sua vez usam este cliente.
 */

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

/** Erro normalizado. Os componentes só precisam lidar com este formato. */
export class ApiError extends Error {
  constructor(message, { status = null, fieldErrors = null, doServidor = false, codigo = null, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    /** Status HTTP (null quando a API não respondeu). */
    this.status = status;
    /** Mapa campo → mensagem, vindo do GlobalExceptionHandler (validação @Valid). */
    this.fieldErrors = fieldErrors;
    /** true quando a mensagem foi escrita pelo backend (e não gerada aqui). */
    this.doServidor = doServidor;
    /** 'REDE' | 'TIMEOUT' | 'RESPOSTA_INVALIDA' | null */
    this.codigo = codigo;
    this.data = data;
  }
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

function mensagemPorStatus(status) {
  if (status === 400) return 'A requisição foi recusada pelo servidor. Revise os dados informados.';
  if (status === 401) return 'Não autorizado.';
  if (status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'O recurso solicitado não foi encontrado.';
  if (status >= 500) return 'O servidor encontrou um erro ao processar a solicitação.';
  return `Erro inesperado (HTTP ${status}).`;
}

/**
 * O backend responde erros em três formatos diferentes:
 *  1. Texto puro (SenhaIncorretaException → 401, UsuarioNaoEncontradoException → 404,
 *     AcessoNegadoException → 403).
 *  2. Objeto { campo: mensagem } (MethodArgumentNotValidException → 400).
 *  3. Corpo padrão do Spring { timestamp, status, error, path } para qualquer
 *     RuntimeException não tratada (→ 500). Nesse caso a mensagem original
 *     normalmente não é exposta pelo Spring.
 */
function construirErro(error) {
  if (error instanceof ApiError) return error;

  if (error.response) {
    const { status, data } = error.response;
    let message = null;
    let fieldErrors = null;
    let doServidor = false;

    if (typeof data === 'string') {
      const texto = data.trim();
      if (texto && !texto.startsWith('<')) {
        message = texto;
        doServidor = true;
      }
    } else if (data && typeof data === 'object') {
      const padraoSpring = 'status' in data && ('error' in data || 'path' in data || 'timestamp' in data);
      if (padraoSpring) {
        if (typeof data.message === 'string' && data.message && data.message !== 'No message available') {
          message = data.message;
          doServidor = true;
        }
      } else {
        const entradas = Object.entries(data).filter(([, valor]) => typeof valor === 'string');
        if (entradas.length) {
          fieldErrors = Object.fromEntries(entradas);
          message = entradas.map(([, valor]) => valor).join(' ');
          doServidor = true;
        }
      }
    }

    return new ApiError(message || mensagemPorStatus(status), { status, fieldErrors, doServidor, data });
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError('O servidor demorou demais para responder. Tente novamente.', { codigo: 'TIMEOUT' });
  }

  if (error.request) {
    return new ApiError(
      `Não foi possível conectar à API (${API_URL}). Verifique se o backend está em execução.`,
      { codigo: 'REDE' },
    );
  }

  return new ApiError(error.message || 'Erro inesperado.');
}

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => Promise.reject(construirErro(erro)),
);

/**
 * Escolhe a melhor mensagem para exibir. Quando o backend não enviou uma
 * mensagem própria (ex.: 500 genérico), usa a mensagem de contexto da tela.
 *
 * @param {unknown} erro
 * @param {Record<number|string, string>} [contexto] mensagens por status HTTP
 */
export function mensagemDeErro(erro, contexto = {}) {
  if (!erro) return '';
  if (erro instanceof ApiError) {
    if (!erro.doServidor && erro.status != null && contexto[erro.status]) return contexto[erro.status];
    if (!erro.doServidor && erro.status >= 500 && contexto[500]) return contexto[500];
    return erro.message;
  }
  return erro.message || 'Erro inesperado.';
}

// ---------------------------------------------------------------------------
// Evita requisições GET duplicadas simultâneas (ex.: duas telas pedindo a mesma
// lista ao mesmo tempo, ou o StrictMode do React montando o efeito duas vezes).
// ---------------------------------------------------------------------------
const emAndamento = new Map();

export function getSemDuplicar(url, config = {}) {
  const chave = `${url}?${new URLSearchParams(config.params || {}).toString()}`;
  if (emAndamento.has(chave)) return emAndamento.get(chave);
  const promessa = api
    .get(url, config)
    .then((resposta) => resposta.data)
    .finally(() => emAndamento.delete(chave));
  emAndamento.set(chave, promessa);
  return promessa;
}

// ---------------------------------------------------------------------------
// Validação de respostas: o frontend não confia cegamente no formato recebido.
// ---------------------------------------------------------------------------
export function garantirLista(data, recurso) {
  if (!Array.isArray(data)) {
    throw new ApiError(`A API retornou um formato inesperado para ${recurso}.`, { codigo: 'RESPOSTA_INVALIDA', data });
  }
  return data;
}

export function garantirObjeto(data, recurso, camposObrigatorios = []) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError(`A API retornou um formato inesperado para ${recurso}.`, { codigo: 'RESPOSTA_INVALIDA', data });
  }
  const faltando = camposObrigatorios.filter((campo) => data[campo] === undefined || data[campo] === null);
  if (faltando.length) {
    throw new ApiError(`A resposta de ${recurso} veio incompleta (faltando: ${faltando.join(', ')}).`, {
      codigo: 'RESPOSTA_INVALIDA',
      data,
    });
  }
  return data;
}

/** Converte BigDecimal serializado (número ou string) para Number. */
export function paraNumero(valor) {
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

export const id = (valor) => encodeURIComponent(String(valor));

export default api;
