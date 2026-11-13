import { useAuthStore } from '../../store/authStore';

function Tienda() {
  const usuario = useAuthStore((state) => state.usuario);
  const cerrarSesion = useAuthStore((state) => state.cerrarSesion);

  //cerramos la sesion
  const handleLogout = () => {
    cerrarSesion();
    window.location.href = '/login';
  };

  return (
    <main>
      <h1>Mi tienda</h1>
      <p>¡Bienvenido/a, {usuario?.name}!</p>

      <h2>Catálogo de productos</h2>
      <p>Próximamente podrás explorar nuestros productos.</p>

      <button onClick={handleLogout}>Cerrar sesión</button>
    </main>
  );
}

export default Tienda;
