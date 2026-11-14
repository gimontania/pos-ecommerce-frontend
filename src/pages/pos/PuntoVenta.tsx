import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { obtenerProductos } from '../../services/productService';
import {
  abrirCaja,
  obtenerCajaActual,
  registrarVenta,
} from '../../services/salesService';
import { useCartStore } from '../../store/cartStore';
import { useCajaStore } from '../../store/cajaStore';
import type { Producto } from '../../types/product';

interface ComprobanteVenta {
  id: number;
  total?: number | string;
  paymentMethod?: string;
}

function PuntoVenta() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [metodoPago, setMetodoPago] = useState<
    'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA_QR'
  >('EFECTIVO');
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [abriendoCaja, setAbriendoCaja] = useState(false);
  const [montoInicial, setMontoInicial] = useState('');
  const [error, setError] = useState('');
  const [comprobante, setComprobante] = useState<ComprobanteVenta | null>(null);

  const items = useCartStore((state) => state.items);
  const agregarProducto = useCartStore((state) => state.agregarProducto);
  const quitarProducto = useCartStore((state) => state.quitarProducto);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const vaciarCarrito = useCartStore((state) => state.vaciarCarrito);
  const obtenerTotal = useCartStore((state) => state.obtenerTotal);

  const cajaId = useCajaStore((state) => state.cajaId);
  const guardarCaja = useCajaStore((state) => state.guardarCaja);
  const limpiarCaja = useCajaStore((state) => state.limpiarCaja);

  const total = obtenerTotal();

  const formatoPrecio = (precio: number) =>
    precio.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });

  const cargarDatos = async () => {
    try {
      setError('');

      const [respuestaProductos, respuestaCaja] = await Promise.all([
        obtenerProductos(),
        obtenerCajaActual(),
      ]);

      setProductos(respuestaProductos);

      if (respuestaCaja) {
        guardarCaja(
          respuestaCaja.id,
          Number(respuestaCaja.openingAmount),
        );
      } else {
        limpiarCaja();
      }
    } catch {
      setError('No se pudieron cargar los datos del punto de venta.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarAperturaCaja = async () => {
    const monto = Number(montoInicial);

    if (!montoInicial.trim() || !Number.isFinite(monto) || monto < 0) {
      setError('Ingresá un monto inicial válido.');
      return;
    }

    try {
      setAbriendoCaja(true);
      setError('');

      const respuesta = await abrirCaja(monto);

      guardarCaja(
        respuesta.id,
        Number(respuesta.openingAmount),
      );

      setMontoInicial('');
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const mensaje = error.response?.data?.message;

        setError(
          Array.isArray(mensaje)
            ? mensaje.join(', ')
            : mensaje || 'No se pudo abrir la caja.',
        );
      } else {
        setError('Ocurrió un error al abrir la caja.');
      }
    } finally {
      setAbriendoCaja(false);
    }
  };

  const manejarVenta = async () => {
    if (!cajaId) {
      setError('No hay una caja abierta para registrar la venta.');
      return;
    }

    if (items.length === 0) {
      setError('Agregá al menos un producto al carrito.');
      return;
    }

    try {
      setProcesando(true);
      setError('');
      setComprobante(null);

      const respuesta = await registrarVenta({
        cashRegisterId: cajaId,
        paymentMethod: metodoPago,
        items: items.map((item) => ({
          productId: item.producto.id,
          quantity: item.cantidad,
        })),
      });

      setComprobante(respuesta);
      vaciarCarrito();

      const productosActualizados = await obtenerProductos();
      setProductos(productosActualizados);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const mensaje = error.response?.data?.message;

        setError(
          Array.isArray(mensaje)
            ? mensaje.join(', ')
            : mensaje || 'No se pudo registrar la venta.',
        );
      } else {
        setError('Ocurrió un error al registrar la venta.');
      }
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return <p className="p-6">Cargando punto de venta...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Punto de Venta
          </h1>
          <p className="text-gray-500">
            Gestión de ventas en mostrador
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/pos/historial"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Historial de ventas
          </a>

          <a
            href="/tienda"
            className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
          >
            Volver a la tienda
          </a>
        </div>
      </header>

      {error && (
        <p className="mb-6 rounded bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {!cajaId ? (
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-800">
            Abrir caja
          </h2>

          <p className="mt-2 text-gray-600">
            Ingresá el monto inicial disponible para comenzar a vender.
          </p>

          <label className="mt-5 block font-medium text-gray-700">
            Monto inicial
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={montoInicial}
            onChange={(e) => setMontoInicial(e.target.value)}
            placeholder="Ejemplo: 10000"
            className="mt-2 w-full rounded border border-gray-300 p-3"
          />

          <button
            onClick={manejarAperturaCaja}
            disabled={abriendoCaja}
            className="mt-4 w-full rounded bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {abriendoCaja ? 'Abriendo caja...' : 'Abrir caja'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Productos disponibles
            </h2>

            {productos.length === 0 ? (
              <p className="rounded bg-white p-6 text-gray-600">
                No hay productos disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {productos.map((producto) => (
                  <article
                    key={producto.id}
                    className="rounded-lg bg-white p-4 shadow"
                  >
                    <h3 className="font-bold text-gray-800">
                      {producto.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {producto.category.name}
                    </p>

                    <p className="mt-3 text-lg font-bold text-blue-700">
                      {formatoPrecio(Number(producto.salePrice))}
                    </p>

                    <p className="mb-4 text-sm text-gray-500">
                      Stock: {producto.stock}
                    </p>

                    <button
                      onClick={() => {
                        agregarProducto(producto);
                        setComprobante(null);
                        setError('');
                      }}
                      disabled={producto.stock <= 0}
                      className="w-full rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {producto.stock <= 0
                        ? 'Sin stock'
                        : 'Agregar al carrito'}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="h-fit rounded-lg bg-white p-5 shadow">
            <h2 className="mb-5 text-xl font-bold text-gray-800">
              Carrito de venta
            </h2>

            {items.length === 0 ? (
              <p className="py-6 text-center text-gray-500">
                El carrito está vacío.
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.producto.id}
                    className="border-b border-gray-200 pb-4"
                  >
                    <div className="flex justify-between gap-2">
                      <h3 className="font-medium text-gray-800">
                        {item.producto.name}
                      </h3>

                      <button
                        onClick={() => quitarProducto(item.producto.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Quitar
                      </button>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatoPrecio(Number(item.producto.salePrice))}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            cambiarCantidad(
                              item.producto.id,
                              item.cantidad - 1,
                            )
                          }
                          disabled={item.cantidad <= 1}
                          className="rounded bg-gray-200 px-3 py-1 disabled:opacity-40"
                        >
                          -
                        </button>

                        <span>{item.cantidad}</span>

                        <button
                          onClick={() => {
                            if (item.cantidad < item.producto.stock) {
                              cambiarCantidad(
                                item.producto.id,
                                item.cantidad + 1,
                              );
                            }
                          }}
                          disabled={item.cantidad >= item.producto.stock}
                          className="rounded bg-gray-200 px-3 py-1 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-semibold">
                        {formatoPrecio(
                          Number(item.producto.salePrice) * item.cantidad,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 border-t border-gray-200 pt-4">
              <div className="mb-5 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatoPrecio(total)}</span>
              </div>

              <label className="mb-2 block font-medium text-gray-700">
                Método de pago
              </label>

              <select
                value={metodoPago}
                onChange={(e) =>
                  setMetodoPago(
                    e.target.value as
                      | 'EFECTIVO'
                      | 'TARJETA'
                      | 'TRANSFERENCIA_QR',
                  )
                }
                className="mb-5 w-full rounded border border-gray-300 p-2"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA_QR">
                  Transferencia / QR
                </option>
              </select>

              <button
                onClick={manejarVenta}
                disabled={procesando || items.length === 0}
                className="w-full rounded bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {procesando ? 'Procesando venta...' : 'Confirmar venta'}
              </button>

              <button
                onClick={vaciarCarrito}
                disabled={procesando || items.length === 0}
                className="mt-2 w-full rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-40"
              >
                Vaciar carrito
              </button>
            </div>
          </section>
        </div>
      )}

      {comprobante && (
        <section className="mt-6 rounded-lg border border-green-300 bg-green-50 p-5">
          <h2 className="text-xl font-bold text-green-800">
            ¡Venta registrada correctamente!
          </h2>

          <p className="mt-2 text-green-700">
            Número de venta: {comprobante.id}
          </p>

          <p className="text-green-700">
            Total: {formatoPrecio(Number(comprobante.total ?? 0))}
          </p>

          <p className="text-green-700">
            Método de pago: {comprobante.paymentMethod ?? metodoPago}
          </p>
        </section>
      )}
    </main>
  );
}

export default PuntoVenta;
