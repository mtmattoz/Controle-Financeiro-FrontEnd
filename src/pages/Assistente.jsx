import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CircleCheck, LoaderCircle, Send, Sparkles, User, CircleX, ShieldCheck } from 'lucide-react';
import Painel from '../components/ui/Painel';
import ConfirmacaoCard from '../components/assistente/ConfirmacaoCard';
import { EstadoErro } from '../components/ui/Estados';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDados } from '../contexts/DadosContext';
import { useApiData } from '../hooks/useApiData';
import * as assistenteService from '../services/assistenteService';
import * as categoriaService from '../services/categoriaService';
import * as transacaoService from '../services/transacaoService';
import { ApiError, mensagemDeErro } from '../services/api';
import { formatarData, formatarMoeda } from '../utils/format';
import { paraNumeroDoFormulario } from '../components/forms/validacao';

const EXEMPLOS = [
  'Gastei 50 reais com alimentação ontem',
  'Recebi 1200 de freela hoje',
  'Paguei 89,90 de internet',
  'Uber de 23 reais anteontem',
];

/**
 * Fluxo obrigatório:
 * 1. Usuário escreve → 2. POST /assistente/interpretar (não grava nada) →
 * 3. card de confirmação editável → 4. usuário escolhe categoria existente →
 * 5. clique em "Confirmar movimentação" → 6. POST /transacao/cadastrar/{usuarioId}/{categoriaId} →
 * 7. sucesso só após resposta do servidor → 8. telas atualizadas (notificarAlteracao).
 */
export default function Assistente() {
  const { usuario } = useAuth();
  const toast = useToast();
  const { notificarAlteracao } = useDados();
  const uid = usuario.id;

  const categorias = useApiData(() => categoriaService.listar(uid), [uid]);
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState([]);
  const [interpretando, setInterpretando] = useState(false);
  const [pendente, setPendente] = useState(null); // { id, interpretacao }
  const [salvando, setSalvando] = useState(false);
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const fimDaConversa = useRef(null);
  const proximoId = useRef(1);

  useEffect(() => {
    fimDaConversa.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [historico, pendente]);

  const adicionar = (item) => setHistorico((h) => [...h, { id: proximoId.current++, ...item }]);

  async function interpretar(texto) {
    const limpo = texto.trim();
    if (!limpo || interpretando) return;
    if (pendente) {
      adicionar({ autor: 'sistema', tipo: 'cancelado', texto: 'Interpretação anterior descartada (não foi salva).' });
      setPendente(null);
    }
    adicionar({ autor: 'usuario', texto: limpo });
    setMensagem('');
    setErroSalvar('');
    setInterpretando(true);
    try {
      const resultado = await assistenteService.interpretar(limpo);
      adicionar({ autor: 'ia', tipo: 'interpretado', resultado });
      setPendente({ id: proximoId.current, interpretacao: resultado });
    } catch (erro) {
      adicionar({
        autor: 'ia',
        tipo: 'erro',
        texto: mensagemDeErro(erro, {
          500: 'Não consegui interpretar essa mensagem. Tente incluir o valor e o que foi, por exemplo: “Gastei 30 reais com lanche hoje”.',
        }),
      });
    } finally {
      setInterpretando(false);
    }
  }

  async function criarCategoria(nome) {
    setCriandoCategoria(true);
    setErroSalvar('');
    try {
      const nova = await categoriaService.cadastrar(uid, nome);
      toast.sucesso(`Categoria "${nova.nome}" criada.`);
      notificarAlteracao(); // recarrega a lista de categorias, e o card seleciona a nova
    } catch (erro) {
      setErroSalvar(mensagemDeErro(erro, { 500: 'Não foi possível criar a categoria.' }));
    } finally {
      setCriandoCategoria(false);
    }
  }

  async function confirmar(form) {
    setSalvando(true);
    setErroSalvar('');
    try {
      // Confere no servidor, no momento de salvar, se a categoria existe e é do usuário.
      const atuais = await categoriaService.listar(uid);
      const categoria = atuais.find((c) => String(c.id) === String(form.categoriaId));
      if (!categoria) {
        throw new ApiError('A categoria selecionada não existe mais na sua conta. Escolha outra.');
      }
      // Converte para o contrato real de POST /transacao/cadastrar/{usuarioId}/{categoriaId}
      const salva = await transacaoService.cadastrar(uid, categoria.id, {
        descricao: form.descricao,
        valor: paraNumeroDoFormulario(form.valor),
        tipo: form.tipo,
        data: form.data,
      });
      adicionar({ autor: 'sistema', tipo: 'salvo', transacao: salva });
      setPendente(null);
      toast.sucesso('Movimentação registrada com sucesso.');
      notificarAlteracao();
    } catch (erro) {
      setErroSalvar(mensagemDeErro(erro, { 500: 'O servidor não conseguiu salvar a movimentação. Tente novamente.' }));
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    setPendente(null);
    setErroSalvar('');
    adicionar({ autor: 'sistema', tipo: 'cancelado', texto: 'Movimentação cancelada. Nada foi salvo.' });
  }

  const aoTeclar = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      interpretar(mensagem);
    }
  };

  return (
    <div className="assistente">
      <Painel indice={0} className="assistente__chat">
        <div className="chat" aria-live="polite">
          {historico.length === 0 && (
            <div className="chat__boas-vindas">
              <span className="chat__boas-vindas-icone">
                <Sparkles size={26} />
              </span>
              <h2>Como posso ajudar?</h2>
              <p>Descreva uma receita ou despesa do jeito que você falaria. Eu preencho os campos e você confirma.</p>
              <div className="chat__exemplos">
                {EXEMPLOS.map((ex) => (
                  <button key={ex} type="button" className="chip chip--clicavel" onClick={() => interpretar(ex)} disabled={interpretando}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {historico.map((item) => (
              <motion.div
                key={item.id}
                className={`chat__mensagem chat__mensagem--${item.autor}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {item.autor === 'usuario' && (
                  <>
                    <div className="chat__balao">{item.texto}</div>
                    <span className="chat__avatar chat__avatar--usuario"><User size={15} /></span>
                  </>
                )}
                {item.autor === 'ia' && (
                  <>
                    <span className="chat__avatar"><Bot size={15} /></span>
                    <div className={`chat__balao ${item.tipo === 'erro' ? 'chat__balao--erro' : ''}`}>
                      {item.tipo === 'erro' ? (
                        item.texto
                      ) : (
                        <>
                          Entendi: <strong>{item.resultado.tipo === 'ENTRADA' ? 'entrada' : 'saída'}</strong> de{' '}
                          <strong>{formatarMoeda(item.resultado.valor)}</strong> — “{item.resultado.descricao}”
                          {item.resultado.categoria && <> · categoria sugerida <strong>{item.resultado.categoria}</strong></>} ·{' '}
                          {formatarData(item.resultado.data)}. Revise abaixo.
                        </>
                      )}
                    </div>
                  </>
                )}
                {item.autor === 'sistema' && (
                  <div className={`chat__sistema chat__sistema--${item.tipo}`}>
                    {item.tipo === 'salvo' ? (
                      <>
                        <CircleCheck size={16} />
                        <span>
                          Salvo: {item.transacao.descricao} · {formatarMoeda(item.transacao.valor)} ·{' '}
                          {item.transacao.categoria?.nome}. <Link to="/transacoes">Ver transações</Link>
                        </span>
                      </>
                    ) : (
                      <>
                        <CircleX size={16} />
                        <span>{item.texto}</span>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {interpretando && (
            <div className="chat__mensagem chat__mensagem--ia">
              <span className="chat__avatar"><Bot size={15} /></span>
              <div className="chat__balao chat__digitando" aria-label="Interpretando">
                <span /><span /><span />
              </div>
            </div>
          )}

          <AnimatePresence>
            {pendente && (
              <div className="chat__confirmacao" key={pendente.id}>
                {categorias.erro && !categorias.dados ? (
                  <EstadoErro erro={categorias.erro} onTentarNovamente={categorias.recarregar} compacto />
                ) : !categorias.dados ? (
                  <div className="chat__carregando"><LoaderCircle size={18} className="girando" /> Carregando categorias…</div>
                ) : (
                  <ConfirmacaoCard
                    interpretacao={pendente.interpretacao}
                    categorias={categorias.dados}
                    salvando={salvando}
                    criandoCategoria={criandoCategoria}
                    erro={erroSalvar}
                    onConfirmar={confirmar}
                    onCancelar={cancelar}
                    onCriarCategoria={criarCategoria}
                  />
                )}
              </div>
            )}
          </AnimatePresence>
          <div ref={fimDaConversa} />
        </div>

        <form
          className="chat__composer"
          onSubmit={(e) => {
            e.preventDefault();
            interpretar(mensagem);
          }}
        >
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={aoTeclar}
            placeholder="Ex.: Gastei 50 reais com alimentação ontem"
            rows={1}
            maxLength={500}
            aria-label="Mensagem para o assistente"
            disabled={interpretando}
          />
          <button type="submit" className="botao botao--primario" disabled={!mensagem.trim() || interpretando} aria-label="Enviar">
            {interpretando ? <LoaderCircle size={18} className="girando" /> : <Send size={18} />}
          </button>
        </form>
      </Painel>

      <aside className="assistente__lateral">
        <Painel indice={1} titulo="Como funciona">
          <ol className="passos">
            <li><span>1</span><p>Você descreve a movimentação em linguagem natural.</p></li>
            <li><span>2</span><p>O backend envia ao Gemini e devolve os campos estruturados.</p></li>
            <li><span>3</span><p>Você revisa, ajusta e escolhe a categoria.</p></li>
            <li><span>4</span><p>Só ao clicar em <strong>Confirmar movimentação</strong> a transação é salva.</p></li>
          </ol>
        </Painel>
        <Painel indice={2} className="painel--destaque">
          <div className="seguranca-ia">
            <ShieldCheck size={20} />
            <p>
              A IA nunca salva sozinha, e a chave do Gemini fica apenas no servidor: o navegador só conversa com a sua API.
            </p>
          </div>
        </Painel>
      </aside>
    </div>
  );
}
