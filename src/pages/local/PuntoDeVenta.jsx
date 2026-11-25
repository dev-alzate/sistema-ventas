import BarraSuperior from '../../components/BarraSuperior'
import Tarjeta from '../../components/Tarjeta'

// PROVISIONAL: el punto de venta se construye en el paso 4.
export default function PuntoDeVenta() {
  return (
    <div className="flex min-h-screen flex-col">
      <BarraSuperior />
      <main className="flex flex-1 items-center justify-center p-4">
        <Tarjeta className="p-8 text-center">
          <h1 className="text-xl font-bold">Punto de venta</h1>
          <p className="mt-2 text-texto-sec">Aquí irán los productos y el carrito (paso 4).</p>
        </Tarjeta>
      </main>
    </div>
  )
}
