import { corDaCategoria, iconeDaCategoria } from '../../utils/categoriaVisual';

/** Ícone colorido da categoria (apresentação local, não vem do banco). */
export default function CategoriaIcone({ nome, tamanho = 38 }) {
  const Icone = iconeDaCategoria(nome);
  const cor = corDaCategoria(nome);
  return (
    <span
      className="categoria-icone"
      style={{ '--cor': cor, width: tamanho, height: tamanho }}
      aria-hidden="true"
    >
      <Icone size={Math.round(tamanho * 0.47)} />
    </span>
  );
}
