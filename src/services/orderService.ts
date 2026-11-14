import api from './api';

export interface Direccion {
  id: number;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  reference: string | null;
}

export interface PerfilCliente {
  id: number;
  phone: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  addresses: Direccion[];
}

export interface DatosDireccion {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  reference?: string;
}

export interface DatosPedido {
  addressId: number;
  deliveryReference?: string;
}

export type EstadoPedido =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface ItemPedido {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  product?: {
    id: number;
    name: string;
  };
}

export interface Pedido {
  id: number;
  status: EstadoPedido;
  source: string;
  total: number | string;
  createdAt: string;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingPostalCode: string | null;
  shippingReference: string | null;
  deliveryReference: string | null;
  customer?: {
    phone: string;
    user: {
      name: string;
      email: string;
    };
  };
  items: ItemPedido[];
}

export const obtenerPerfilCliente = async (): Promise<PerfilCliente> => {
  const respuesta = await api.get('/customers/perfil');
  return respuesta.data;
};

export const crearDireccion = async (
  datos: DatosDireccion,
): Promise<Direccion> => {
  const respuesta = await api.post('/customers/direcciones', datos);
  return respuesta.data;
};

export const crearPedido = async (datos: DatosPedido): Promise<Pedido> => {
  const respuesta = await api.post('/orders', datos);
  return respuesta.data;
};

export const obtenerPedidos = async (): Promise<Pedido[]> => {
  const respuesta = await api.get('/orders');
  return respuesta.data;
};

export const actualizarEstadoPedido = async (
  id: number,
  status: EstadoPedido,
): Promise<Pedido> => {
  const respuesta = await api.patch(`/orders/${id}/status`, { status });
  return respuesta.data;
};
