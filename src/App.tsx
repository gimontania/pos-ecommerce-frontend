import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Tienda from './pages/store/Tienda';
import RutaProtegida from './components/auth/RutaProtegida';

const Login = lazy(() => import('./pages/auth/Login'));
const Registro = lazy(() => import('./pages/auth/Registro'));
const Panel = lazy(() => import('./pages/admin/Panel'));
const Caja = lazy(() => import('./pages/admin/Caja'));
const Checkout = lazy(() => import('./pages/checkout/Checkout'));
const PuntoVenta = lazy(() => import('./pages/pos/PuntoVenta'));
const HistorialVentas = lazy(() => import('./pages/pos/HistorialVentas'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p className="p-8 text-center">Cargando página...</p>}>
        <Routes>
          <Route path="/" element={<Navigate to="/tienda" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/tienda" element={<Tienda />} />

          <Route element={<RutaProtegida rolesPermitidos={['CLIENTE']} />}>
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          <Route element={<RutaProtegida rolesPermitidos={['ADMIN']} />}>
            <Route path="/admin/caja" element={<Caja />} />
          </Route>

          <Route element={<RutaProtegida rolesPermitidos={['ADMIN', 'CAJERO']} />}>
            <Route path="/panel" element={<Panel />} />
            <Route path="/pos" element={<PuntoVenta />} />
            <Route path="/pos/historial" element={<HistorialVentas />} />
          </Route>

          <Route path="*" element={<Navigate to="/tienda" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
