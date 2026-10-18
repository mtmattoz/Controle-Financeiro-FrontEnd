import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { DadosProvider } from './contexts/DadosContext';
import RotaProtegida from './components/layout/RotaProtegida';
import RotaPublica from './components/layout/RotaPublica';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Transacoes from './pages/Transacoes';
import Receitas from './pages/Receitas';
import Categorias from './pages/Categorias';
import Relatorios from './pages/Relatorios';
import Assistente from './pages/Assistente';
import Configuracoes from './pages/Configuracoes';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DadosProvider>
          <Routes>
            <Route element={<RotaPublica />}>
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
            </Route>

            <Route element={<RotaProtegida />}>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="transacoes" element={<Transacoes />} />
                <Route path="receitas" element={<Receitas />} />
                <Route path="categorias" element={<Categorias />} />
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="assistente" element={<Assistente />} />
                <Route path="configuracoes" element={<Configuracoes />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DadosProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
