import { useAuthStore } from '../../store/authStore';

function Panel() {
  const usuario = useAuthStore((state) => state.usuario);
  const cerrarSesion = useAuthStore((state) => state.cerrarSesion);

  //cerramos la sesion
  const handleLogout = () => {
    cerrarSesion();
    window.location.href = '/login';
  };

  return (
    <main>
      <h1>Panel administrativo</h1>
      <p>Bienvenido/a, {usuario?.name}</p>
      <p>Rol: {usuario?.role}</p>

      <button onClick={handleLogout}>Cerrar sesión</button>
    </main>
  );
}

export default Panel;
