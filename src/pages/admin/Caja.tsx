import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  abrirCaja,
  cerrarCaja,
  obtenerCajaActual,
} from '../../services/salesService';
import { useCajaStore } from '../../store/cajaStore';

interface ResumenCaja {
  montoInicial: number;
  ventasEfectivo: number;
  efectivoEsperado: number;
  efectivoContado: number;
  diferencia: number;
}

function Caja() {
  const cajaId = useCajaStore((state) => state.cajaId);
  const guardarCaja = useCajaStore((state) => state.guardarCaja);
  const limpiarCaja = useCajaStore((state) => state.limpiarCaja);

  const [montoInicial, setMontoInicial] = useState('');
  const [montoCierre, setMontoCierre] = useState('');
  const [resumen, setResumen] = useState<ResumenCaja | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const formatoPrecio = (valor: number) =>
    valor.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });

  useEffect(() => {
    const cargarCaja = async () => {
      try {
        const respuesta = await obtenerCajaActual();

        if (respuesta) {
          guardarCaja(
            respuesta.id,
            Number(respuesta.openingAmount),
          );
        } else {
          limpiarCaja();
        }
      } catch {
        setError('No se pudo consultar la caja actual.');
      } finally {
        setCargando(false);
      }
    };

    cargarCaja();
  }, [guardarCaja, limpiarCaja]);

  const manejarApertura = async () => {
    const monto = Number(montoInicial);

    if (!montoInicial.trim() || !Number.isFinite(monto) || monto < 0) {
      setError('Ingresá un monto inicial válido.');
      return;
    }

    try {
      setProcesando(true);
      setError('');

      const respuesta = await abrirCaja(monto);

      guardarCaja(respuesta.id, Number(respuesta.openingAmount));
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
      setProcesando(false);
    }
  };

  const manejarCierre = async () => {
    const monto = Number(montoCierre);

    if (!montoCierre.trim() || !Number.isFinite(monto) || monto < 0) {
      setError('Ingresá un monto de cierre válido.');
      return;
    }

    try {
      setProcesando(true);
      setError('');

      const respuesta = await cerrarCaja(monto);

      setResumen(respuesta.resumen);
      limpiarCaja();
      setMontoCierre('');
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const mensaje = error.response?.data?.message;
        setError(
          Array.isArray(mensaje)
            ? mensaje.join(', ')
            : mensaje || 'No se pudo cerrar la caja.',
        );
      } else {
        setError('Ocurrió un error al cerrar la caja.');
      }
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return <p className="p-6">Cargando caja...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de caja
          </h1>
          <p className="mt-1 text-gray-600">
            Apertura, cierre y conciliación de efectivo.
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/panel'}
          className="rounded bg-gray-700 px-4 py-2 text-white"
        >
          Volver al panel
        </button>
      </header>

      {error && (
        <p className="mb-6 rounded bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {!cajaId ? (
        <section className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-800">
            Abrir caja
          </h2>

          <label className="mt-5 block font-medium text-gray-700">
            Monto inicial
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={montoInicial}
            onChange={(e) => setMontoInicial(e.target.value)}
            className="mt-2 w-full rounded border p-3"
            placeholder="Ejemplo: 10000"
          />

          <button
            onClick={manejarApertura}
            disabled={procesando}
            className="mt-4 w-full rounded bg-green-600 p-3 font-bold text-white disabled:opacity-50"
          >
            {procesando ? 'Procesando...' : 'Abrir caja'}
          </button>
        </section>
      ) : (
        <section className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-800">
            Caja abierta #{cajaId}
          </h2>

          <p className="mt-3 text-gray-600">
            Monto inicial:
            <strong className="ml-2">
              {formatoPrecio(
                useCajaStore.getState().montoInicial ?? 0,
              )}
            </strong>
          </p>

          <label className="mt-6 block font-medium text-gray-700">
            Efectivo físico contado
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={montoCierre}
            onChange={(e) => setMontoCierre(e.target.value)}
            className="mt-2 w-full rounded border p-3"
            placeholder="Ingresá el efectivo contado"
          />

          <button
            onClick={manejarCierre}
            disabled={procesando}
            className="mt-4 w-full rounded bg-red-600 p-3 font-bold text-white disabled:opacity-50"
          >
            {procesando ? 'Procesando...' : 'Cerrar caja y conciliar'}
          </button>
        </section>
      )}

      {resumen && (
        <section className="mx-auto mt-8 max-w-lg rounded-lg border bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-800">
            Resultado de conciliación
          </h2>

          <div className="mt-5 space-y-4">
            <p className="flex justify-between gap-4">
              Monto inicial:
              <strong>{formatoPrecio(resumen.montoInicial)}</strong>
            </p>

            <p className="flex justify-between gap-4">
              Ventas en efectivo:
              <strong>{formatoPrecio(resumen.ventasEfectivo)}</strong>
            </p>

            <p className="flex justify-between gap-4 border-t pt-3">
              Efectivo esperado:
              <strong>{formatoPrecio(resumen.efectivoEsperado)}</strong>
            </p>

            <p className="flex justify-between gap-4">
              Efectivo contado:
              <strong>{formatoPrecio(resumen.efectivoContado)}</strong>
            </p>

            <p className="flex justify-between gap-4 border-t pt-3 text-lg">
              Diferencia:
              <strong className={
                resumen.diferencia === 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }>
                {formatoPrecio(resumen.diferencia)}
              </strong>
            </p>
          </div>

          <div className={`mt-6 rounded p-4 text-center font-bold ${
            resumen.diferencia === 0
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {resumen.diferencia === 0
              ? '¡Caja cuadrada!'
              : resumen.diferencia > 0
                ? 'Sobrante de efectivo'
                : 'Faltante de efectivo'}
          </div>
        </section>
      )}
    </main>
  );
}

export default Caja;
