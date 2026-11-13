import api from './api';
import type {
  DatosRegistro,
  RespuestaLogin,
  Usuario,
} from '../types/auth';

interface DatosLogin {
  email: string;
  password: string;
}

export const iniciarSesion = async (
  datos: DatosLogin,
): Promise<RespuestaLogin> => {
  const respuesta = await api.post<RespuestaLogin>('/auth/login', datos);

  return respuesta.data;
};

export const registrarUsuario = async (
  datos: DatosRegistro,
): Promise<Usuario> => {
  const respuesta = await api.post<Usuario>('/auth/register', datos);

  return respuesta.data;
};
