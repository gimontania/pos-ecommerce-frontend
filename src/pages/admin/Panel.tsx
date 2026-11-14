import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  obtenerPedidos,
  actualizarEstadoPedido,
  type Pedido,
  type EstadoPedido,
} from '../../services/orderService';

const estados: { valor: EstadoPedido; etiqueta: string }[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'PAGADO', etiqueta: 'Pagado' },
  { valor: 'EN_CAMINO', etiqueta: 'En camino' },
  { valor: 'ENTREGADO', etiqueta: 'Entregado' },
  { valor: 'CANCELADO', etiqueta: 'Cancelado' },
];

function Panel() {
  const usuario = useAuthStore((state) => state.usuario);
  const cerrarSesion = useAuthStore((state) => state.cerrarSesion);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState<number | null>(null);
  const [error, setError] = useState('');

  const cargarPedidos = useCallback(async () => {
    try {
      setError('');
      const respuesta = await obtenerPedidos();
      setPedidos(respuesta);
    } catch {
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();

    window.addEventListener('focus', cargarPedidos);

    return () => {
      window.removeEventListener('focus', cargarPedidos);
    };
  }, [cargarPedidos]);

  const manejarCambioEstado = async (
    id: number,
    estado: EstadoPedido,
  ) => {
    try {
      setActualizando(id);
      setError('');

      await actualizarEstadoPedido(id, estado);
      await cargarPedidos();
    } catch {
      setError('No se pudo actualizar el estado del pedido.');
    } finally {
      setActualizando(null);
    }
  };

  const handleLogout = () => {
    cerrarSesion();
    window.location.href = '/login';
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Panel administrativo
          </h1>
          <p className="mt-1 text-gray-600">
            Bienvenido/a, {usuario?.name}
          </p>
          <p className="text-sm text-gray-500">Rol: {usuario?.role}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.location.href = '/tienda'}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Tienda
          </button>

          <button
            onClick={() => window.location.href = '/pos'}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Punto de venta
          </button>

          {usuario?.role === 'ADMIN' && (
            <button
              onClick={() => window.location.href = '/admin/caja'}
              className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Gestión de caja
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
              Cola de pedidos
            </h2>
            <p className="text-gray-500">
              Administrá los pedidos y sus estados.
            </p>
          </div>

          <button
            onClick={cargarPedidos}
            disabled={cargando}
            className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Actualizar pedidos
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        {cargando ? (
          <p className="text-gray-600">Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-gray-600">
            Todavía no hay pedidos registrados.
          </p>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <article
                key={pedido.id}
                className="rounded-lg border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Pedido #{pedido.id}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(pedido.createdAt).toLocaleString('es-AR')}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Origen: {pedido.source}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Estado del pedido
                    </label>

                    <select
                      value={pedido.status}
                      disabled={actualizando === pedido.id}
                      onChange={(e) =>
                        manejarCambioEstado(
                          pedido.id,
                          e.target.value as EstadoPedido,
                        )
                      }
                      className="rounded border border-gray-300 p-2 disabled:opacity-50"
                    >
                      {estados.map((estado) => (
                        <option key={estado.valor} value={estado.valor}>
                          {estado.etiqueta}
                        </option>
                      ))}
                    </select>

                    {actualizando === pedido.id && (
                      <p className="mt-1 text-xs text-gray-500">
                        Actualizando...
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-gray-800">
                      Datos del cliente
                    </h4>

                    <p className="text-sm text-gray-600">
                      Nombre: {pedido.customer?.user.name || pedido.shippingName || 'No disponible'}
                    </p>

                    <p className="text-sm text-gray-600">
                      Email: {pedido.customer?.user.email || 'No disponible'}
                    </p>

                    <p className="text-sm text-gray-600">
                      Teléfono: {pedido.customer?.phone || pedido.shippingPhone || 'No disponible'}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-800">
                      Dirección de entrega
                    </h4>

                    <p className="text-sm text-gray-600">
                      {pedido.shippingAddress || 'Sin dirección registrada'}
                    </p>

                    <p className="text-sm text-gray-600">
                      {pedido.shippingCity}, {pedido.shippingProvince}
                    </p>

                    <p className="text-sm text-gray-600">
                      Código postal: {pedido.shippingPostalCode || 'No disponible'}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Referencia de dirección:{' '}
                      {pedido.shippingReference || 'Sin referencias'}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Referencias de entrega:{' '}
                      {pedido.deliveryReference || 'Sin referencias'}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="mb-3 font-semibold text-gray-800">
                    Productos del pedido
                  </h4>

                  <div className="space-y-2">
                    {pedido.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-4 border-b pb-2 text-sm"
                      >
                        <span className="text-gray-700">
                          {item.product?.name || `Producto #${item.productId}`}
                          {' '}x {item.quantity}
                        </span>

                        <span className="font-medium text-gray-700">
                          $
                          {(
                            Number(item.unitPrice) * item.quantity
                          ).toLocaleString('es-AR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex justify-end border-t pt-4">
                  <p className="text-xl font-bold text-blue-700">
                    Total: ${Number(pedido.total).toLocaleString('es-AR')}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Panel;
