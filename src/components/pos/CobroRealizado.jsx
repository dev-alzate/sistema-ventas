import Boton from '../Boton'
import { IconoCheck } from '../Iconos'
import { formatearPesos } from '../../utils/formato'

// PROVISIONAL: confirmación del cobro. En el paso 5 se reemplaza por la vista previa del recibo.
export default function CobroRealizado({ venta, alCerrar }) {
  const unidades = venta.items.reduce((suma, i) => suma + i.cantidad, 0)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-texto/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cobro-titulo"
        className="flex w-full max-w-sm flex-col gap-5 rounded-lg bg-tarjeta p-6 shadow-modal"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-exito-fondo text-exito-texto">
            <IconoCheck />
          </span>
          <div>
            <h2 id="cobro-titulo" className="text-lg font-bold">
              Cobro realizado
            </h2>
            <span className="text-sm text-texto-sec">
              {unidades} {unidades === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>
        </div>

        <dl className="flex flex-col gap-2 text-[15px] tabular-nums">
          <div className="flex justify-between">
            <dt className="text-texto-sec">Total</dt>
            <dd className="font-semibold">{formatearPesos(venta.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-texto-sec">Efectivo recibido</dt>
            <dd className="font-semibold">{formatearPesos(venta.efectivo_recibido)}</dd>
          </div>
          <div className="flex items-center justify-between rounded-md bg-exito-fondo px-3.5 py-2.5">
            <dt className="font-semibold">Cambio</dt>
            <dd className="text-[26px] font-extrabold text-exito-texto">{formatearPesos(venta.cambio)}</dd>
          </div>
        </dl>

        <Boton tamano="lg" onClick={alCerrar} autoFocus>
          Nueva venta
        </Boton>
      </div>
    </div>
  )
}
