import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Wallet } from 'lucide-react';
import BadgeTipo from '../ui/BadgeTipo';
import CategoriaIcone from '../ui/CategoriaIcone';
import { formatarData, formatarMoeda } from '../../utils/format';

/**
 * Lista de transações e/ou receitas. Vira tabela no desktop e cartões no celular (CSS).
 * Edição não aparece: o backend não tem rota PUT para estes recursos.
 */
export default function ListaMovimentacoes({ itens, onExcluir, mostrarCategoria = true, compacta = false }) {
  return (
    <div className={`movs ${compacta ? 'movs--compacta' : ''} ${mostrarCategoria ? '' : 'movs--sem-categoria'}`}>
      {!compacta && (
        <div className="movs__cabecalho" aria-hidden="true">
          <span>Descrição</span>
          {mostrarCategoria && <span>Categoria</span>}
          <span>Data</span>
          <span>Tipo</span>
          <span className="movs__direita">Valor</span>
          {onExcluir && <span />}
        </div>
      )}
      <ul className="movs__lista">
        <AnimatePresence initial={false}>
          {itens.map((item, i) => {
            const positivo = item.tipo === 'ENTRADA';
            const nomeIcone = item.origem === 'receita' ? 'salario' : item.categoria?.nome;
            return (
              <motion.li
                key={`${item.origem}-${item.id}`}
                className={`movs__item ${mostrarCategoria ? '' : 'movs__item--sem-categoria'}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.025 } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
              >
                <div className="movs__descricao">
                  {item.origem === 'receita' ? (
                    <span className="categoria-icone categoria-icone--receita" aria-hidden="true">
                      <Wallet size={18} />
                    </span>
                  ) : (
                    <CategoriaIcone nome={nomeIcone} />
                  )}
                  <div>
                    <strong>{item.descricao}</strong>
                    <small>
                      {compacta
                        ? `${formatarData(item.data)}${item.categoria ? ` · ${item.categoria.nome}` : item.origem === 'receita' ? ' · Receita' : ''}`
                        : item.origem === 'receita'
                          ? 'Receita'
                          : item.categoria?.nome ?? '—'}
                    </small>
                  </div>
                </div>
                {!compacta && mostrarCategoria && (
                  <span className="movs__categoria">{item.categoria?.nome ?? (item.origem === 'receita' ? '—' : 'Sem categoria')}</span>
                )}
                {!compacta && <span className="movs__data">{formatarData(item.data)}</span>}
                {!compacta && (
                  <span className="movs__tipo">
                    <BadgeTipo tipo={item.tipo} origem={item.origem} />
                  </span>
                )}
                <span className={`movs__valor ${positivo ? 'positivo' : 'negativo'}`}>
                  {positivo ? '+ ' : '− '}
                  {formatarMoeda(item.valor)}
                </span>
                {onExcluir && (
                  <span className="movs__acoes">
                    <button
                      type="button"
                      className="botao-icone botao-icone--perigo"
                      onClick={() => onExcluir(item)}
                      aria-label={`Excluir ${item.descricao}`}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </span>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
