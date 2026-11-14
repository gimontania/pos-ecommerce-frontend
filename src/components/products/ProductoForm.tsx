import { useEffect, useState } from 'react';
import type { Categoria, DatosProducto, Producto } from '../../types/product';

interface Props {
  categorias: Categoria[];
  productoEditar: Producto | null;
  onGuardar: (datos: DatosProducto) => void;
  onCancelar: () => void;
}

function ProductoForm({ categorias, productoEditar, onGuardar, onCancelar }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [stock, setStock] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.name);
      setDescripcion(productoEditar.description || '');
      setPrecioVenta(productoEditar.salePrice);
      setStock(String(productoEditar.stock));
      setCategoriaId(String(productoEditar.categoryId));
    } else {
      setNombre('');
      setDescripcion('');
      setPrecioCompra('');
      setPrecioVenta('');
      setStock('');
      setCategoriaId('');
    }
  }, [productoEditar]);

  const manejarEnvio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const datos: DatosProducto = {
      name: nombre,
      description: descripcion,
      purchasePrice: Number(precioCompra),
      salePrice: Number(precioVenta),
      stock: Number(stock),
      categoryId: Number(categoriaId),
    };

    onGuardar(datos);
  };

  return (
    <form onSubmit={manejarEnvio} className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">
        {productoEditar ? 'Editar producto' : 'Nuevo producto'}
      </h2>

      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      {!productoEditar && (
        <div>
          <label className="mb-1 block text-sm font-medium">Precio de compra</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Precio de venta</label>
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={precioVenta}
          onChange={(e) => setPrecioVenta(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Stock</label>
        <input
          required
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Categoría</label>
        <select
          required
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="w-full rounded border p-2"
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Guardar
        </button>

        <button
          type="button"
          onClick={onCancelar}
          className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ProductoForm;
