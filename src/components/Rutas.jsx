import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { cerrarSesion, rutaInicio } from '../lib/auth'
import Boton from './Boton'
import Tarjeta from './Tarjeta'

function PantallaCarga() {
  return (
    <div className="flex min-h-screen items-center justify-center text-texto-sec">Cargando…</div>
  )
}

// El usuario existe en Auth pero no tiene fila en "perfiles" (revisar 02_perfiles.sql)
function SinPerfil() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Tarjeta className="flex max-w-sm flex-col gap-4 p-8 text-center">
        <h1 className="text-lg font-bold">Usuario sin rol asignado</h1>
        <p className="text-texto-sec">Pide al administrador que configure tu usuario.</p>
        <Boton variante="contorno" onClick={cerrarSesion}>
          Cerrar sesión
        </Boton>
      </Tarjeta>
    </div>
  )
}

// Solo deja pasar a usuarios con sesión y con uno de los roles permitidos.
// Sin "roles" redirige a la pantalla que le corresponde al usuario.
export function RutaProtegida({ roles, children }) {
  const { cargando, sesion, perfil } = useAuth()
  if (cargando) return <PantallaCarga />
  if (!sesion) return <Navigate to="/login" replace />
  if (!perfil) return <SinPerfil />
  if (!roles || !roles.includes(perfil.rol)) return <Navigate to={rutaInicio(perfil.rol)} replace />
  return children
}

// La pantalla de login solo se muestra si no hay sesión
export function SoloSinSesion({ children }) {
  const { cargando, sesion } = useAuth()
  if (cargando) return <PantallaCarga />
  if (sesion) return <Navigate to="/" replace />
  return children
}
