import api from './api';

export interface ProductoCarrito {
  id: number;
  name: string;
  salePrice: string;
  stock: number;
}

export interface ItemCarrito {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: ProductoCarrito;
}

export interface Carrito {
  id: number;
  customerId: number;
  items: ItemCarrito[];
}

export const obtenerCarrito = async (): Promise<Carrito | null> => {
  const respuesta = await api.get<Carrito | null>('/cart');
  return respuesta.data;
};

export const agregarProductoCarrito = async (
  productId: number,
  quantity: number,
) => {
  const respuesta = await api.post('/cart/items', {
    productId,
    quantity,
  });

  return respuesta.data;
};

export const modificarCantidadCarrito = async (
  productId: number,
  quantity: number,
) => {
  const respuesta = await api.patch(`/cart/items/${productId}`, {
    quantity,
  });

  return respuesta.data;
};

export const eliminarProductoCarrito = async (
  productId: number,
) => {
  const respuesta = await api.delete(`/cart/items/${productId}`);
  return respuesta.data;
};
