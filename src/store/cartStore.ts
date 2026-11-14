import { create } from 'zustand';
import type { Producto } from '../types/product';

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];
  agregarProducto: (producto: Producto) => void;
  quitarProducto: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciarCarrito: () => void;
  obtenerTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  //agregamos productos al carrito
  agregarProducto: (producto) => {
    const items = get().items;
    const existe = items.find((item) => item.producto.id === producto.id);

    if (existe) {
      set({
        items: items.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      });
    } else {
      set({
        items: [...items, { producto, cantidad: 1 }],
      });
    }
  },

  //quitamos productos del carrito
  quitarProducto: (productoId) => {
    set({
      items: get().items.filter((item) => item.producto.id !== productoId),
    });
  },

  //actualizamos la cantidad
  cambiarCantidad: (productoId, cantidad) => {
    if (cantidad < 1) return;

    set({
      items: get().items.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item,
      ),
    });
  },

  //vaciamos el carrito
  vaciarCarrito: () => set({ items: [] }),

  //calculamos el total
  obtenerTotal: () =>
    get().items.reduce(
      (total, item) =>
        total + Number(item.producto.salePrice) * item.cantidad,
      0,
    ),
}));
