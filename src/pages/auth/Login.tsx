import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { iniciarSesion } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

function Login() {
  const navigate = useNavigate();
  const guardarSesion = useAuthStore((state) => state.iniciarSesion);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  //iniciamos sesion con los datos ingresados
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await iniciarSesion({ email, password });

      //guardamos el token y los datos del usuario
      guardarSesion(respuesta.access_token, respuesta.user);

      //redirigimos segun el rol
      if (respuesta.user.role === 'CLIENTE') {
        navigate('/tienda');
      } else {
        navigate('/panel');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'No se pudo iniciar sesión');
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main>
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p>
        ¿Todavía no tenés cuenta? <Link to="/registro">Registrate</Link>
      </p>
    </main>
  );
}

export default Login;
