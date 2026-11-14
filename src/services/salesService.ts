import api from './api';

export interface ItemVenta {
  productId: number;
  quantity: number;
}

export interface DatosVenta {
  cashRegisterId: number;
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA_QR';
  items: ItemVenta[];
}

export const registrarVenta = async (datos: DatosVenta) => {
  const respuesta = await api.post('/sales', datos);
  return respuesta.data;
};

export const obtenerVentas = async () => {
  const respuesta = await api.get('/sales');
  return respuesta.data;
};

export const obtenerCajaActual = async () => {
  const respuesta = await api.get('/sales/caja/actual');
  return respuesta.data;
};

export const abrirCaja = async (openingAmount: number) => {
  const respuesta = await api.post('/sales/caja/abrir', {
    openingAmount,
  });
  return respuesta.data;
};

export const cerrarCaja = async (closingAmount: number) => {
  const respuesta = await api.post('/sales/caja/cerrar', {
    closingAmount,
  });
  return respuesta.data;
};
