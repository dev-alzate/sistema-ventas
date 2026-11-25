import { useAuth } from '../hooks/useAuth'
import { cerrarSesion } from '../lib/auth'
import Boton from './Boton'

// Barra común a todas las pantallas: marca, nombre del usuario y cerrar sesión.
// "children" permite agregar botones (p. ej. "Cierre de caja" en el punto de venta).
export default function BarraSuperior({ children }) {
  const { perfil } = useAuth()
  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-borde bg-tarjeta px-5 py-2.5">
      <div className="flex items-center gap-3.5">
        <span className="text-xl font-extrabold tracking-tight text-primario">Ventas</span>
        <span className="h-6 w-px bg-borde" />
        <span className="text-base font-semibold">{perfil?.nombre}</span>
      </div>
      <div className="flex-1" />
      {children}
      <Boton variante="neutro" onClick={cerrarSesion}>
        Cerrar sesión
      </Boton>
    </header>
  )
}
