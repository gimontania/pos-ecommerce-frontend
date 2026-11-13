import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Rol } from '../../types/auth';

interface Props {
  rolesPermitidos: Rol[];
}

function RutaProtegida({ rolesPermitidos }: Props) {
  const token = useAuthStore((state) => state.token);
  const usuario = useAuthStore((state) => state.usuario);

  //verificamos si existe una sesion
  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  //verificamos si el rol tiene permiso
  if (!rolesPermitidos.includes(usuario.role)) {
    return <Navigate to={usuario.role === 'CLIENTE' ? '/tienda' : '/panel'} replace />;
  }

  return <Outlet />;
}

export default RutaProtegida;
