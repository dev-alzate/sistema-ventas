// Botón con las variantes del diseño.
// Los estilos "enabled:hover:" evitan que un botón deshabilitado cambie de color.
const VARIANTES = {
  primario: 'bg-primario text-white enabled:hover:bg-primario-hover',
  cobrar: 'bg-cobrar text-white enabled:hover:bg-cobrar-hover',
  peligro: 'bg-eliminar text-white enabled:hover:bg-eliminar-hover',
  contorno: 'border border-primario bg-tarjeta text-primario enabled:hover:bg-primario-claro',
  neutro: 'border border-borde bg-tarjeta text-texto-sec enabled:hover:bg-primario-claro',
}

const TAMANOS = {
  sm: 'h-9 gap-1.5 rounded-md px-3 text-[13px] font-semibold',
  md: 'h-10 gap-2 rounded-md px-4 text-sm font-semibold',
  lg: 'h-[50px] gap-2 rounded-md px-5 text-[17px] font-bold',
  xl: 'h-[60px] gap-2.5 rounded-lg px-6 text-xl font-bold',
}

export default function Boton({
  variante = 'primario',
  tamano = 'md',
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:bg-borde disabled:text-texto-sec ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
