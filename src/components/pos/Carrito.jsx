import Boton from '../Boton'
import Tarjeta from '../Tarjeta'
import { IconoCarrito, IconoMas, IconoMenos, IconoPapelera } from '../Iconos'
import { formatearMiles, formatearPesos, leerPesos } from '../../utils/formato'

const BILLETES_RAPIDOS = [20000, 50000, 100000]
const MAXIMO_EFECTIVO = 99_999_999

const estiloCantidad =
  'flex size-[34px] cursor-pointer items-center justify-center rounded-md border border-borde bg-tarjeta hover:border-primario hover:bg-primario-claro'

// Carrito + cobro (derecha del punto de venta).
// Presionar Enter en "Efectivo recibido" también cobra.
export default function Carrito({ carrito, efectivo, setEfectivo, alVaciar, alCobrar, className = '' }) {
  const { items, total, unidades, sumar, restar, quitar } = carrito
  const falta = total > 0 && efectivo < total
  const puedeCobrar = total > 0 && efectivo >= total

  function alEnviar(evento) {
    evento.preventDefault()
    if (puedeCobrar) alCobrar()
  }

  return (
    <Tarjeta como="aside" aria-label="Carrito" className={`flex min-w-0 flex-col ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-borde px-4 py-3.5">
        <h2 className="text-lg font-bold">Carrito</h2>
        <span className="rounded-[10px] bg-primario-claro px-2.5 py-0.5 text-[13px] font-semibold text-primario">
          {unidades} {unidades === 1 ? 'artículo' : 'artículos'}
        </span>
        <div className="flex-1" />
        {items.length > 0 && (
          <Boton variante="neutro" tamano="sm" onClick={alVaciar}>
            <IconoPapelera tamano={14} /> Vaciar carrito
          </Boton>
        )}
      </div>

      <div className="max-h-[320px] min-h-[120px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center text-[15px] text-texto-sec">
            <IconoCarrito tamano={32} grosor={1.8} className="text-texto-tenue" />
            El carrito está vacío. Toca un producto para agregarlo.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5 border-b border-divisor px-4 py-3">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{item.nombre}</span>
                <span className="text-[13px] text-texto-sec tabular-nums">{formatearPesos(item.precio)} c/u</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => restar(item.id)} aria-label={`Quitar uno de ${item.nombre}`} className={estiloCantidad}>
                  <IconoMenos tamano={14} />
                </button>
                <span className="min-w-[30px] text-center text-base font-bold tabular-nums">{item.cantidad}</span>
                <button type="button" onClick={() => sumar(item.id)} aria-label={`Agregar uno de ${item.nombre}`} className={estiloCantidad}>
                  <IconoMas tamano={14} />
                </button>
              </div>
              <span className="w-[84px] text-right text-base font-bold tabular-nums">
                {formatearPesos(item.precio * item.cantidad)}
              </span>
              <button
                type="button"
                onClick={() => quitar(item.id)}
                aria-label={`Quitar ${item.nombre} del carrito`}
                className="flex size-[34px] cursor-pointer items-center justify-center rounded-md text-texto-sec hover:bg-error-fondo hover:text-eliminar"
              >
                <IconoPapelera tamano={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={alEnviar} className="mt-auto flex flex-col gap-3.5 rounded-b-lg border-t border-borde bg-tarjeta-pie p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-bold tracking-[0.06em] text-texto-sec">TOTAL</span>
          <span className="text-[40px] font-extrabold tracking-tight tabular-nums">{formatearPesos(total)}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="efectivo" className="text-sm font-semibold">
            Efectivo recibido
          </label>
          <div className="relative">
            <span aria-hidden="true" className="absolute top-3 left-3.5 text-[22px] font-semibold text-texto-sec">
              $
            </span>
            <input
              id="efectivo"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={efectivo ? formatearMiles(efectivo) : ''}
              onChange={(e) => setEfectivo(Math.min(leerPesos(e.target.value), MAXIMO_EFECTIVO))}
              className="h-[52px] w-full rounded-md border border-borde bg-tarjeta pr-3.5 pl-[34px] text-right text-[22px] font-bold tabular-nums"
            />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setEfectivo(total)}
              disabled={total === 0}
              className="h-9 cursor-pointer rounded-md border border-borde bg-tarjeta text-[13px] font-semibold enabled:hover:bg-primario-claro disabled:cursor-not-allowed disabled:text-texto-tenue"
            >
              Exacto
            </button>
            {BILLETES_RAPIDOS.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => setEfectivo(valor)}
                className="h-9 cursor-pointer rounded-md border border-borde bg-tarjeta text-[13px] font-semibold hover:bg-primario-claro"
              >
                {formatearPesos(valor)}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`flex items-center justify-between rounded-md px-3.5 py-2.5 ${falta ? 'bg-error-fondo' : 'bg-exito-fondo'}`}
        >
          <span className="text-[15px] font-semibold">{falta ? 'Falta' : 'Cambio'}</span>
          <span className={`text-[26px] font-extrabold tabular-nums ${falta ? 'text-error-texto' : 'text-exito-texto'}`}>
            {formatearPesos(falta ? total - efectivo : puedeCobrar ? efectivo - total : 0)}
          </span>
        </div>

        <Boton type="submit" variante="cobrar" tamano="xl" disabled={!puedeCobrar}>
          Cobrar
        </Boton>
      </form>
    </Tarjeta>
  )
}
