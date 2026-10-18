import { motion } from 'framer-motion';
import { ChartColumn, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from '../ui/Logo';

/** Layout dividido das telas de login e cadastro. */
export default function AuthLayout({ titulo, subtitulo, children, rodape }) {
  return (
    <div className="auth">
      <aside className="auth__marca">
        <Logo />
        <div className="auth__chamada">
          <h2>Suas finanças, organizadas e explicadas.</h2>
          <p>Registre entradas e saídas, acompanhe o saldo e deixe a IA transformar frases em lançamentos.</p>
          <ul>
            <li>
              <ChartColumn size={18} /> Relatórios mensais com gráficos
            </li>
            <li>
              <Sparkles size={18} /> Assistente que entende linguagem natural
            </li>
            <li>
              <ShieldCheck size={18} /> Você confirma tudo antes de salvar
            </li>
          </ul>
        </div>
        <div className="auth__decoracao" aria-hidden="true">
          {[42, 64, 38, 80, 56, 92, 70].map((altura, i) => (
            <motion.span
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
              style={{ height: `${altura}%` }}
            />
          ))}
        </div>
      </aside>

      <main className="auth__formulario">
        <motion.div
          className="auth__caixa"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="auth__logo-mobile">
            <Logo />
          </div>
          <h1>{titulo}</h1>
          <p className="auth__subtitulo">{subtitulo}</p>
          {children}
          {rodape && <p className="auth__rodape">{rodape}</p>}
        </motion.div>
      </main>
    </div>
  );
}
