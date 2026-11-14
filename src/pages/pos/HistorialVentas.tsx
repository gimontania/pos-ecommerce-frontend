import { useEffect, useState } from 'react';
import { obtenerVentas } from '../../services/salesService';

interface Venta {
  id: number;
  total: number | string;
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA_QR';
  createdAt: string;
}

function HistorialVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const formatoPrecio = (precio: number) =>
    precio.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        setError('');
        const respuesta = await obtenerVentas();
        setVentas(respuesta);
      } catch {
        setError('No se pudo cargar el historial de ventas.');
      } finally {
        setCargando(false);
      }
    };

    cargarVentas();
  }, []);

  const ventasFiltradas = ventas.filter((venta) => {
    const fechaVenta = new Date(venta.createdAt);
    const anio = fechaVenta.getFullYear();
    const mes = String(fechaVenta.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaVenta.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}` === fecha;
  });

  if (cargando) {
    return <p className="p-6">Cargando historial...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Historial de ventas
          </h1>
          <p className="text-gray-500">
            Consultá las ventas realizadas por fecha.
          </p>
        </div>

        <a
          href="/pos"
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
        >
          Volver al punto de venta
        </a>
      </header>

      <section className="mb-6 rounded-lg bg-white p-5 shadow">
        <label className="mb-2 block font-medium text-gray-700">
          Seleccionar fecha
        </label>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded border border-gray-300 p-2"
        />
      </section>

      {error && (
        <p className="mb-6 rounded bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      <section className="rounded-lg bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Ventas del día: {ventasFiltradas.length}
        </h2>

        {ventasFiltradas.length === 0 ? (
          <p className="py-6 text-center text-gray-500">
            No hay ventas registradas para esta fecha.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th className="p-3">N.º</th>
                  <th className="p-3">Hora</th>
                  <th className="p-3">Método de pago</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>

              <tbody>
                {ventasFiltradas.map((venta) => (
                  <tr key={venta.id} className="border-b border-gray-100">
                    <td className="p-3">{venta.id}</td>
                    <td className="p-3">
                      {new Date(venta.createdAt).toLocaleTimeString('es-AR')}
                    </td>
                    <td className="p-3">{venta.paymentMethod}</td>
                    <td className="p-3 font-semibold">
                      {formatoPrecio(Number(venta.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default HistorialVentas;
