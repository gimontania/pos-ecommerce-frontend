import { memo } from 'react';
import type { Producto } from '../../types/product';

interface Props {
  producto: Producto;
  puedeAdministrar: boolean;
  puedeComprar: boolean;
  onEditar: (producto: Producto) => void;
  onEliminar: (id: number) => void;
  onAgregar: (producto: Producto) => void;
}

function ProductoCard({
  producto,
  puedeAdministrar,
  puedeComprar,
  onEditar,
  onEliminar,
  onAgregar,
}: Props) {
  const precio = Number(producto.salePrice).toLocaleString('es-AR');

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">{producto.name}</h3>

      <p className="mt-1 text-sm text-gray-500">{producto.category.name}</p>

      <p className="mt-3 text-gray-600">
        {producto.description || 'Sin descripción'}
      </p>

      <p className="mt-3 text-xl font-bold text-blue-700">${precio}</p>

      <p className="mt-1 text-sm text-gray-500">
        Stock disponible: {producto.stock}
      </p>

      {puedeAdministrar && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEditar(producto)}
            className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            Editar
          </button>

          <button
            onClick={() => onEliminar(producto.id)}
            className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      )}

      {puedeComprar && (
        <button
          onClick={() => onAgregar(producto)}
          disabled={producto.stock <= 0}
          className="mt-4 w-full rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      )}
    </article>
  );
}

export default memo(ProductoCard);
