export type Rol = 'ADMIN' | 'CAJERO' | 'CLIENTE';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  role: Rol;
}

export interface RespuestaLogin {
  access_token: string;
  user: Usuario;
}

export interface DatosRegistro {
  name: string;
  email: string;
  password: string;
  phone: string;
}
