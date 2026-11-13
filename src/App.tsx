import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Registro from './pages/auth/Registro';
import Panel from './pages/admin/Panel';
import Tienda from './pages/store/Tienda';
import RutaProtegida from './components/auth/RutaProtegida';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tienda" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route path="/tienda" element={<Tienda />} />

        <Route element={<RutaProtegida rolesPermitidos={['ADMIN', 'CAJERO']} />}>
          <Route path="/panel" element={<Panel />} />
        </Route>

        <Route path="*" element={<Navigate to="/tienda" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
