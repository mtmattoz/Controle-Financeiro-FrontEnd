import { useReducedMotion } from 'framer-motion';

/** Desliga a animação dos gráficos quando o usuário pede menos movimento no sistema. */
export function useAnimacaoGraficos() {
  return !useReducedMotion();
}
