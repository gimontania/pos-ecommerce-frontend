import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useWebCartStore } from '../../store/webCartStore';
import ProductoCard from '../../components/catalog/ProductoCard';
import ProductoForm from '../../components/products/ProductoForm';
import {
  obtenerProductos,
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../../services/productService';
import type {
  Producto,
  Categoria,
  DatosProducto,
} from '../../types/product';

function Tienda() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const cerrarSesion = useAuthStore((state) => state.cerrarSesion);
  const agregarProducto = useWebCartStore((state) => state.agregarProducto);
  const cargarCarrito = useWebCartStore((state) => state.cargarCarrito);
  const itemsCarrito = useWebCartStore((state) => state.items);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const puedeAdministrar =
    usuario?.role === 'ADMIN' || usuario?.role === 'CAJERO';
  const puedeComprar = usuario?.role === 'CLIENTE';

  const cargarDatos = async () => {
    try {
      setError('');

      const [respuestaProductos, respuestaCategorias] = await Promise.all([
        obtenerProductos(),
        obtenerCategorias(),
      ]);

      setProductos(respuestaProductos);
      setCategorias(respuestaCategorias);
    } catch {
      setError(
        'No se pudieron cargar los productos. Verificá que el servidor esté funcionando.',
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const actualizarProductos = () => {
      cargarDatos();
    };

    window.addEventListener('focus', actualizarProductos);

    return () => {
      window.removeEventListener('focus', actualizarProductos);
    };
  }, []);

  useEffect(() => {
    if (puedeComprar) {
      cargarCarrito().catch(() => {
        setError('No se pudo cargar tu carrito.');
      });
    }
  }, [puedeComprar, cargarCarrito]);

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(
        (producto) => producto.categoryId === Number(categoriaSeleccionada),
      )
    : productos;

  const manejarGuardar = async (datos: DatosProducto) => {
    try {
      if (productoEditar) {
        const { purchasePrice, ...datosActualizados } = datos;
        await actualizarProducto(productoEditar.id, datosActualizados);
      } else {
        await crearProducto(datos);
      }

      setMostrarFormulario(false);
      setProductoEditar(null);
      await cargarDatos();
    } catch {
      setError(
        'No se pudo guardar el producto. Revisá los datos e intentá nuevamente.',
      );
    }
  };

  const manejarEditar = (producto: Producto) => {
    setProductoEditar(producto);
    setMostrarFormulario(true);
  };

  const manejarEliminar = async (id: number) => {
    const confirmar = window.confirm(
      '¿Estás seguro de eliminar este producto?',
    );

    if (!confirmar) return;

    try {
      await eliminarProducto(id);
      await cargarDatos();
    } catch {
      setError('No se pudo eliminar el producto.');
    }
  };

  const manejarAgregar = async (producto: Producto) => {
    try {
      setError('');
      await agregarProducto(producto.id, 1);
    } catch {
      setError('No se pudo agregar el producto al carrito.');
    }
  };

  const manejarCancelar = () => {
    setMostrarFormulario(false);
    setProductoEditar(null);
  };

  const handleLogout = () => {
    cerrarSesion();
    window.location.href = '/login';
  };

  const cantidadCarrito = itemsCarrito.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mi tienda</h1>
          <p className="mt-1 text-gray-600">
            ¡Bienvenido/a, {usuario?.name}!
          </p>
          <p className="text-sm text-gray-500">Rol: {usuario?.role}</p>

          {puedeComprar && (
            <p className="mt-2 font-medium text-green-700">
              Productos en tu carrito: {cantidadCarrito}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {puedeComprar && (
            <button
              onClick={() => navigate('/checkout')}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Mi carrito ({cantidadCarrito})
            </button>
          )}

          <button
            onClick={handleLogout}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Catálogo de productos
            </h2>
            <p className="text-gray-500">
              Explorá nuestros productos disponibles.
            </p>
          </div>

          {puedeAdministrar && (
            <button
              onClick={() => {
                setProductoEditar(null);
                setMostrarFormulario(true);
              }}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Agregar producto
            </button>
          )}
        </div>

        {mostrarFormulario && puedeAdministrar && (
          <div className="mb-8 max-w-xl">
            <ProductoForm
              categorias={categorias}
              productoEditar={productoEditar}
              onGuardar={manejarGuardar}
              onCancelar={manejarCancelar}
            />
          </div>
        )}

        <div className="mb-6 max-w-xs">
          <label className="mb-2 block font-medium text-gray-700">
            Filtrar por categoría
          </label>

          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white p-2"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        {cargando ? (
          <p className="text-gray-600">Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="rounded bg-white p-6 text-gray-600">
            No hay productos disponibles en esta categoría.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productosFiltrados.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                puedeAdministrar={puedeAdministrar}
                puedeComprar={puedeComprar}
                onEditar={manejarEditar}
                onEliminar={manejarEliminar}
                onAgregar={manejarAgregar}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Tienda;
