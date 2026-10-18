import api, { ApiError, garantirObjeto, paraNumero } from './api';
import { paraDataISO } from '../utils/format';

/**
 * AssistenteFinanceiroController — @RequestMapping("/assistente")
 *
 * POST /assistente/interpretar
 * Corpo: { mensagem }
 * Resposta 200: InterpretacaoFinanceiraDTO { tipo, valor, descricao, categoria, data }
 *   - "categoria" é um NOME sugerido pela IA, não um id — pode não existir no banco.
 *
 * Este endpoint apenas interpreta. Ele NÃO grava nada.
 * A chave do Gemini fica no backend; o frontend nunca fala com o Gemini.
 *
 * Erros: quando a IA não entende a mensagem, quando a resposta não bate com o
 * formato ou quando o Gemini falha, o backend lança IllegalArgumentException /
 * RuntimeException sem handler → HTTP 500 com corpo genérico.
 */
export async function interpretar(mensagem) {
  const texto = String(mensagem ?? '').trim();
  if (!texto) throw new ApiError('Escreva uma mensagem para o assistente interpretar.');

  // A IA pode levar alguns segundos: timeout maior que o padrão.
  const { data } = await api.post('/assistente/interpretar', { mensagem: texto }, { timeout: 60000 });
  garantirObjeto(data, 'interpretação da IA', ['tipo', 'valor', 'descricao', 'data']);

  // Não confiamos cegamente na IA: normalizamos e o usuário revisa tudo antes de salvar.
  return {
    tipo: data.tipo === 'ENTRADA' ? 'ENTRADA' : data.tipo === 'SAIDA' ? 'SAIDA' : '',
    valor: paraNumero(data.valor),
    descricao: String(data.descricao ?? '').trim(),
    categoria: String(data.categoria ?? '').trim(),
    data: paraDataISO(data.data),
  };
}
