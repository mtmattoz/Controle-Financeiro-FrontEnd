import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';

// Estilos: tudo fica em src/styles/ (um arquivo por área).
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/charts.css';
import './styles/pages/auth.css';
import './styles/pages/dashboard.css';
import './styles/pages/movimentacoes.css';
import './styles/pages/categorias.css';
import './styles/pages/relatorios.css';
import './styles/pages/assistente.css';
import './styles/pages/configuracoes.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* reducedMotion="user" respeita prefers-reduced-motion em todas as animações */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
