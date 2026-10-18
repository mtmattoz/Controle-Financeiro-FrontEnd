import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/** Só deixa entrar se houver usuário identificado (ver limitação em AuthContext). */
export default function RotaProtegida() {
  const { usuario } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  return <Outlet />;
}
