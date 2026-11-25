import BarraSuperior from '../../components/BarraSuperior'
import Tarjeta from '../../components/Tarjeta'

// PROVISIONAL: las ventas y los productos del admin se construyen en los pasos 8 y 9.
export default function PanelAdmin() {
  return (
    <div className="flex min-h-screen flex-col">
      <BarraSuperior />
      <main className="flex flex-1 items-center justify-center p-4">
        <Tarjeta className="p-8 text-center">
          <h1 className="text-xl font-bold">Panel del administrador</h1>
          <p className="mt-2 text-texto-sec">Aquí irán las ventas, los cierres y los productos (pasos 8 y 9).</p>
        </Tarjeta>
      </main>
    </div>
  )
}
