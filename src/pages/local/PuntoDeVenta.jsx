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
import { crearVenta } from '../../lib/ventas'

// Punto de venta (docs/diseno/2-punto-de-venta.html): productos 65% / carrito 35%.
export default function PuntoDeVenta() {
  const { perfil } = useAuth()
  const { productos, cargando, error } = useProductos()
  const carrito = useCarrito()
  const [efectivo, setEfectivo] = useState(0)
  const [ventaCobrada, setVentaCobrada] = useState(null)

  function vaciar() {
    carrito.vaciar()
    setEfectivo(0)
  }

  function cobrar() {
    const venta = crearVenta({ local: perfil.local, items: carrito.items, efectivo })
    // Paso 6: aquí se guardará la venta en el equipo y se enviará a Supabase.
    setVentaCobrada(venta)
    vaciar()
  }

  const cantidades = Object.fromEntries(carrito.items.map((i) => [i.id, i.cantidad]))

  return (
    <div className="flex min-h-screen flex-col">
      <BarraSuperior>
        <Reloj />
        <EstadoConexion />
      </BarraSuperior>

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
