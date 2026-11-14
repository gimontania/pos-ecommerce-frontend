import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Rol } from '../../types/auth';

interface Props {
  rolesPermitidos: Rol[];
}

function RutaProtegida({ rolesPermitidos }: Props) {
  const token = useAuthStore((state) => state.token);
  const usuario = useAuthStore((state) => state.usuario);

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesPermitidos.includes(usuario.role)) {
    return <Navigate to="/tienda" replace />;
  }

  return <Outlet />;
}

export default RutaProtegida;
