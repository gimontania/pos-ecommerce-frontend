import api from './api';
import type {
  Producto,
  Categoria,
  DatosProducto,
} from '../types/product';

export const obtenerProductos = async (): Promise<Producto[]> => {
  const respuesta = await api.get<Producto[]>('/products');
  return respuesta.data;
};

export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const respuesta = await api.get<Categoria[]>('/categories');
  return respuesta.data;
};

export const crearProducto = async (datos: DatosProducto): Promise<Producto> => {
  const respuesta = await api.post<Producto>('/products', datos);
  return respuesta.data;
};

export const actualizarProducto = async (
  id: number,
  datos: Partial<DatosProducto>,
): Promise<Producto> => {
  const respuesta = await api.patch<Producto>(`/products/${id}`, datos);
  return respuesta.data;
};

export const eliminarProducto = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};
