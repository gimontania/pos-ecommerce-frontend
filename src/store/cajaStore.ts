import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CajaState {
  cajaId: number | null;
  montoInicial: number | null;
  guardarCaja: (id: number, monto: number) => void;
  limpiarCaja: () => void;
}

export const useCajaStore = create<CajaState>()(
  persist(
    (set) => ({
      cajaId: null,
      montoInicial: null,

      guardarCaja: (id, monto) => {
        set({
          cajaId: id,
          montoInicial: monto,
        });
      },

      limpiarCaja: () => {
        set({
          cajaId: null,
          montoInicial: null,
        });
      },
    }),
    {
      name: 'caja-storage',
    },
  ),
);
