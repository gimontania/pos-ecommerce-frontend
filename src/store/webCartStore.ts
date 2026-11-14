import { create } from 'zustand';
import {
  obtenerCarrito,
  agregarProductoCarrito,
  modificarCantidadCarrito,
  eliminarProductoCarrito,
  type ItemCarrito,
} from '../services/cartService';

interface WebCartState {
  items: ItemCarrito[];
  cargando: boolean;
  cargarCarrito: () => Promise<void>;
  agregarProducto: (productId: number, quantity: number) => Promise<void>;
  cambiarCantidad: (productId: number, quantity: number) => Promise<void>;
  quitarProducto: (productId: number) => Promise<void>;
  vaciarCarrito: () => Promise<void>;
}

export const useWebCartStore = create<WebCartState>((set, get) => ({
  items: [],
  cargando: false,

  cargarCarrito: async () => {
    set({ cargando: true });

    try {
      const carrito = await obtenerCarrito();
      set({ items: carrito?.items ?? [] });
    } finally {
      set({ cargando: false });
    }
  },

  agregarProducto: async (productId, quantity) => {
    set({ cargando: true });

    try {
      await agregarProductoCarrito(productId, quantity);
      const carrito = await obtenerCarrito();
      set({ items: carrito?.items ?? [] });
    } finally {
      set({ cargando: false });
    }
  },

  cambiarCantidad: async (productId, quantity) => {
    set({ cargando: true });

    try {
      await modificarCantidadCarrito(productId, quantity);
      const carrito = await obtenerCarrito();
      set({ items: carrito?.items ?? [] });
    } finally {
      set({ cargando: false });
    }
  },

  quitarProducto: async (productId) => {
    set({ cargando: true });

    try {
      await eliminarProductoCarrito(productId);
      const carrito = await obtenerCarrito();
      set({ items: carrito?.items ?? [] });
    } finally {
      set({ cargando: false });
    }
  },

  vaciarCarrito: async () => {
    set({ cargando: true });

    try {
      const items = get().items;

      await Promise.all(
        items.map((item) => eliminarProductoCarrito(item.productId)),
      );

      const carrito = await obtenerCarrito();
      set({ items: carrito?.items ?? [] });
    } finally {
      set({ cargando: false });
    }
  },
}));
