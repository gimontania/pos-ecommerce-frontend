import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebCartStore } from '../../store/webCartStore';
import { useCartTotal } from '../../hooks/useCartTotal';
import {
  obtenerPerfilCliente,
  crearDireccion,
  crearPedido,
  type Direccion,
  type DatosDireccion,
} from '../../services/orderService';

function Checkout() {
  const navigate = useNavigate();

  const items = useWebCartStore((state) => state.items);
  const cargandoCarrito = useWebCartStore((state) => state.cargando);
  const cargarCarrito = useWebCartStore((state) => state.cargarCarrito);
  const cambiarCantidad = useWebCartStore((state) => state.cambiarCantidad);
  const quitarProducto = useWebCartStore((state) => state.quitarProducto);

  const total = useCartTotal(items);

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
  const [referenciaEntrega, setReferenciaEntrega] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [nuevaDireccion, setNuevaDireccion] = useState<DatosDireccion>({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    reference: '',
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [perfil] = await Promise.all([
          obtenerPerfilCliente(),
          cargarCarrito(),
        ]);

        setDirecciones(perfil.addresses);

        if (perfil.addresses.length > 0) {
          setDireccionSeleccionada(String(perfil.addresses[0].id));
        }
      } catch {
        alert('No se pudieron cargar los datos del checkout.');
      }
    };

    cargarDatos();
  }, [cargarCarrito]);

  const manejarCambioDireccion = (
    campo: keyof DatosDireccion,
    valor: string,
  ) => {
    setNuevaDireccion((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const guardarDireccion = async () => {
    if (
      !nuevaDireccion.street.trim() ||
      !nuevaDireccion.city.trim() ||
      !nuevaDireccion.province.trim() ||
      !nuevaDireccion.postalCode.trim()
    ) {
      alert('Completá todos los campos obligatorios de la dirección.');
      return;
    }

    try {
      const direccion = await crearDireccion(nuevaDireccion);

      setDirecciones((actuales) => [...actuales, direccion]);
      setDireccionSeleccionada(String(direccion.id));
      setMostrarFormulario(false);

      setNuevaDireccion({
        street: '',
        city: '',
        province: '',
        postalCode: '',
        reference: '',
      });

      alert('Dirección guardada correctamente.');
    } catch {
      alert('No se pudo guardar la dirección.');
    }
  };

  const confirmarPedido = async () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    if (!direccionSeleccionada) {
      alert('Seleccioná una dirección de entrega.');
      return;
    }

    try {
      setProcesando(true);

      await crearPedido({
        addressId: Number(direccionSeleccionada),
        deliveryReference: referenciaEntrega,
      });

      await cargarCarrito();

      alert('¡Tu pedido fue confirmado correctamente!');
      navigate('/tienda');
    } catch {
      alert('No se pudo confirmar el pedido. Revisá el stock disponible.');
    } finally {
      setProcesando(false);
    }
  };

  if (cargandoCarrito && items.length === 0) {
    return <p className="p-8 text-center">Cargando carrito...</p>;
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mi carrito</h1>

        <button
          onClick={() => navigate('/tienda')}
          className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
        >
          Volver a la tienda
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-gray-600">Tu carrito está vacío.</p>

          <button
            onClick={() => navigate('/tienda')}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ver productos
          </button>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-white p-4"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {item.product.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    ${Number(item.product.salePrice).toLocaleString('es-AR')}
                  </p>

                  <p className="text-sm text-gray-500">
                    Subtotal: $
                    {(
                      Number(item.product.salePrice) * item.quantity
                    ).toLocaleString('es-AR')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={cargandoCarrito || item.quantity <= 1}
                    onClick={() =>
                      cambiarCantidad(item.productId, item.quantity - 1)
                    }
                    className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    disabled={
                      cargandoCarrito ||
                      item.quantity >= item.product.stock
                    }
                    onClick={() =>
                      cambiarCantidad(item.productId, item.quantity + 1)
                    }
                    className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
                  >
                    +
                  </button>

                  <button
                    disabled={cargandoCarrito}
                    onClick={() => quitarProducto(item.productId)}
                    className="ml-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Quitar
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-8 rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Dirección de entrega
            </h2>

            {direcciones.length > 0 && (
              <div className="space-y-3">
                {direcciones.map((direccion) => (
                  <label
                    key={direccion.id}
                    className="flex cursor-pointer items-start gap-3 rounded border p-3"
                  >
                    <input
                      type="radio"
                      name="direccion"
                      value={direccion.id}
                      checked={
                        direccionSeleccionada === String(direccion.id)
                      }
                      onChange={(e) =>
                        setDireccionSeleccionada(e.target.value)
                      }
                    />

                    <span className="text-sm text-gray-700">
                      {direccion.street}, {direccion.city},{' '}
                      {direccion.province}, {direccion.postalCode}
                      {direccion.reference && (
                        <span className="block text-gray-500">
                          Referencia: {direccion.reference}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              {mostrarFormulario
                ? 'Cancelar'
                : 'Agregar nueva dirección'}
            </button>

            {mostrarFormulario && (
              <div className="mt-4 space-y-3">
                <input
                  value={nuevaDireccion.street}
                  onChange={(e) =>
                    manejarCambioDireccion('street', e.target.value)
                  }
                  placeholder="Calle y número"
                  className="w-full rounded border p-3"
                />

                <input
                  value={nuevaDireccion.city}
                  onChange={(e) =>
                    manejarCambioDireccion('city', e.target.value)
                  }
                  placeholder="Ciudad"
                  className="w-full rounded border p-3"
                />

                <input
                  value={nuevaDireccion.province}
                  onChange={(e) =>
                    manejarCambioDireccion('province', e.target.value)
                  }
                  placeholder="Provincia"
                  className="w-full rounded border p-3"
                />

                <input
                  value={nuevaDireccion.postalCode}
                  onChange={(e) =>
                    manejarCambioDireccion('postalCode', e.target.value)
                  }
                  placeholder="Código postal"
                  className="w-full rounded border p-3"
                />

                <input
                  value={nuevaDireccion.reference ?? ''}
                  onChange={(e) =>
                    manejarCambioDireccion('reference', e.target.value)
                  }
                  placeholder="Referencia de la dirección (opcional)"
                  className="w-full rounded border p-3"
                />

                <button
                  onClick={guardarDireccion}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Guardar dirección
                </button>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block font-medium text-gray-700">
                Referencias adicionales para la entrega
              </label>

              <textarea
                value={referenciaEntrega}
                onChange={(e) => setReferenciaEntrega(e.target.value)}
                placeholder="Indicaciones para encontrar el domicilio..."
                className="w-full rounded border p-3"
                rows={3}
              />
            </div>
          </section>

          <section className="mt-6 rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total del pedido</span>

              <span className="text-2xl font-bold text-blue-700">
                ${total.toLocaleString('es-AR')}
              </span>
            </div>

            <button
              onClick={confirmarPedido}
              disabled={procesando || cargandoCarrito}
              className="mt-6 w-full rounded bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {procesando ? 'Confirmando pedido...' : 'Confirmar pedido'}
            </button>
          </section>
        </>
      )}
    </main>
  );
}

export default Checkout;
