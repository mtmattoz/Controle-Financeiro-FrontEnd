import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/** Login e cadastro: quem já está identificado vai direto para o dashboard. */
export default function RotaPublica() {
  const { usuario } = useAuth();
  if (usuario) return <Navigate to="/" replace />;
  return <Outlet />;
}
