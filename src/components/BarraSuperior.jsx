import { useAuth } from '../hooks/useAuth'
import { cerrarSesion } from '../lib/auth'
import { contarPorEnviar } from '../lib/sincronizacion'
import Boton from './Boton'

// Barra común a todas las pantallas: marca, nombre del usuario y cerrar sesión.
// "children" permite agregar elementos (reloj, estado de conexión, botones…).
export default function BarraSuperior({ children }) {
  const { perfil } = useAuth()

  async function alCerrarSesion() {
    // Las ventas sin enviar no se pierden: quedan en el equipo y se envían
    // cuando este mismo usuario vuelva a entrar con internet.
    const pendientes = perfil ? await contarPorEnviar(perfil.id) : 0
    if (
      pendientes > 0 &&
      !window.confirm(
        `Hay ${pendientes} ${pendientes === 1 ? 'venta' : 'ventas'} sin enviar. ` +
          'Quedarán guardadas en este equipo y se enviarán cuando vuelvas a entrar con internet. ¿Cerrar sesión?',
      )
    ) {
      return
    }
    await cerrarSesion()
  }

  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-borde bg-tarjeta px-5 py-2.5">
      <div className="flex items-center gap-3.5">
        <span className="text-xl font-extrabold tracking-tight text-primario">Ventas</span>
        <span className="h-6 w-px bg-borde" />
        <span className="text-base font-semibold">{perfil?.nombre}</span>
      </div>
      <div className="flex-1" />
      {children}
      <Boton variante="neutro" onClick={alCerrarSesion}>
        Cerrar sesión
      </Boton>
    </header>
  )
}
