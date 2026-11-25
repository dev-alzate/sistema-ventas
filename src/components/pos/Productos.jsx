import { useState } from 'react'
import Tarjeta from '../Tarjeta'
import { IconoBuscar, IconoMas } from '../Iconos'
import { formatearPesos } from '../../utils/formato'

// Buscador + cuadrícula de productos (izquierda del punto de venta).
// "cantidades" = { idProducto: cantidadEnCarrito } para mostrar "× 2" en cada tarjeta.
export default function Productos({ productos, cargando, error, cantidades, alAgregar, className = '' }) {
  const [busqueda, setBusqueda] = useState('')

  const texto = busqueda.trim().toLowerCase()
  const visibles = texto
    ? productos.filter(
        (p) => p.nombre.toLowerCase().includes(texto) || (p.codigo ?? '').toLowerCase().includes(texto),
      )
    : productos

  let aviso = null
  if (cargando) aviso = 'Cargando productos…'
  else if (productos.length === 0 && error) aviso = 'No se pudieron cargar los productos. Revisa la conexión.'
  else if (productos.length === 0) aviso = 'No hay productos activos. Pide al administrador que los agregue.'
  else if (visibles.length === 0) aviso = 'No hay productos que coincidan con la búsqueda.'

  return (
    <Tarjeta como="section" aria-label="Productos" className={`flex min-w-0 flex-col gap-4 p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-[1_1_320px]">
          <label htmlFor="buscar" className="sr-only">
            Buscar producto
          </label>
          <IconoBuscar className="absolute top-3.5 left-3.5 text-texto-sec" />
          <input
            id="buscar"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="h-12 w-full rounded-md border border-borde bg-fondo pr-3.5 pl-11 text-base placeholder:text-texto-tenue"
          />
        </div>
        <span className="text-sm text-texto-sec">
          {visibles.length} {visibles.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {aviso ? (
        <p className="my-6 text-center text-[15px] text-texto-sec">{aviso}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {visibles.map((p) => {
            const cantidad = cantidades[p.id] ?? 0
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => alAgregar(p)}
                aria-label={`Agregar ${p.nombre} al carrito`}
                className="relative flex min-h-[104px] cursor-pointer flex-col gap-1.5 rounded-lg border border-borde bg-tarjeta p-3.5 text-left transition hover:border-primario hover:shadow-producto active:bg-primario-claro"
              >
                {p.codigo && (
                  <span className="text-xs font-semibold tracking-[0.02em] text-texto-sec">{p.codigo}</span>
                )}
                <span className="pr-7 text-base font-semibold">{p.nombre}</span>
                <span className="mt-auto text-[21px] font-bold tabular-nums">{formatearPesos(p.precio)}</span>
                <span
                  aria-hidden="true"
                  className="absolute top-3 right-3 flex size-[26px] items-center justify-center rounded-full bg-primario-claro text-primario"
                >
                  <IconoMas tamano={14} />
                </span>
                {cantidad > 0 && (
                  <span className="absolute right-3 bottom-3.5 rounded-[10px] bg-primario-claro px-2 py-0.5 text-xs font-bold text-primario">
                    × {cantidad}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </Tarjeta>
  )
}
