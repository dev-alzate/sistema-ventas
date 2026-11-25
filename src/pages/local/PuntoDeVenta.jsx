import { useState } from 'react'
import BarraSuperior from '../../components/BarraSuperior'
import EstadoConexion from '../../components/EstadoConexion'
import Reloj from '../../components/Reloj'
import Carrito from '../../components/pos/Carrito'
import CobroRealizado from '../../components/pos/CobroRealizado'
import Productos from '../../components/pos/Productos'
import { useAuth } from '../../hooks/useAuth'
import { useCarrito } from '../../hooks/useCarrito'
import { useProductos } from '../../hooks/useProductos'
import { useSincronizacion } from '../../hooks/useSincronizacion'
import { sincronizar } from '../../lib/sincronizacion'
import { crearVenta, guardarVenta } from '../../lib/ventas'

// Punto de venta (docs/diseno/2-punto-de-venta.html): productos 65% / carrito 35%.
export default function PuntoDeVenta() {
  const { perfil } = useAuth()
  const { productos, cargando, error } = useProductos()
  const porEnviar = useSincronizacion(perfil)
  const carrito = useCarrito()
  const [efectivo, setEfectivo] = useState(0)
  const [ventaCobrada, setVentaCobrada] = useState(null)
  const [errorGuardar, setErrorGuardar] = useState('')

  function vaciar() {
    carrito.vaciar()
    setEfectivo(0)
  }

  async function cobrar() {
    setErrorGuardar('')
    try {
      // 1. Se guarda en el equipo (funciona sin internet) y recibe su número
      const venta = await guardarVenta(
        crearVenta({ local: perfil.local, vendedorId: perfil.id, items: carrito.items, efectivo }),
      )
      setVentaCobrada(venta)
      vaciar()
      // 2. Se intenta enviar a Supabase de inmediato; si no hay internet, queda pendiente
      sincronizar()
    } catch (e) {
      console.error('No se pudo guardar la venta:', e)
      setErrorGuardar('No se pudo guardar la venta en este equipo. No se cobró; intenta de nuevo.')
    }
  }

  const cantidades = Object.fromEntries(carrito.items.map((i) => [i.id, i.cantidad]))

  return (
    <div className="flex min-h-screen flex-col">
      <BarraSuperior>
        <Reloj />
        <EstadoConexion porEnviar={porEnviar} />
      </BarraSuperior>

      {errorGuardar && (
        <p role="alert" className="mx-4 mt-4 rounded-md bg-error-fondo px-4 py-3 font-medium text-error-texto">
          {errorGuardar}
        </p>
      )}

      <main className="flex flex-1 flex-wrap items-start gap-4 p-4">
        <Productos
          className="flex-[65_1_560px]"
          productos={productos}
          cargando={cargando}
          error={error}
          cantidades={cantidades}
          alAgregar={carrito.agregar}
        />
        <Carrito
          className="flex-[35_1_380px] lg:sticky lg:top-4"
          carrito={carrito}
          efectivo={efectivo}
          setEfectivo={setEfectivo}
          alVaciar={vaciar}
          alCobrar={cobrar}
        />
      </main>

      {ventaCobrada && <CobroRealizado venta={ventaCobrada} alCerrar={() => setVentaCobrada(null)} />}
    </div>
  )
}
