import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProveedorAuth from './components/ProveedorAuth'
import { RutaProtegida, SoloSinSesion } from './components/Rutas'
import Login from './pages/Login'
import PuntoDeVenta from './pages/local/PuntoDeVenta'
import PanelAdmin from './pages/admin/PanelAdmin'

// Flujo: sin sesión → /login. Con sesión → "/" redirige según el rol:
//   admin          → /admin
//   local1, local2 → /local
export default function App() {
  return (
    <ProveedorAuth>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SoloSinSesion><Login /></SoloSinSesion>} />
          <Route path="/" element={<RutaProtegida />} />
          <Route
            path="/local"
            element={<RutaProtegida roles={['local1', 'local2']}><PuntoDeVenta /></RutaProtegida>}
          />
          <Route
            path="/admin"
            element={<RutaProtegida roles={['admin']}><PanelAdmin /></RutaProtegida>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAuth>
  )
}
