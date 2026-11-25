// Etiqueta redondeada con un punto de color: "En línea", "Sin conexión", "Activo", "Cerrado"…
const TONOS = {
  exito: { caja: 'bg-exito-fondo text-exito-texto', punto: 'bg-cobrar' },
  alerta: { caja: 'bg-alerta-fondo text-alerta-texto', punto: 'bg-alerta' },
  error: { caja: 'bg-error-fondo text-error-texto', punto: 'bg-eliminar' },
  info: { caja: 'bg-primario-claro text-primario', punto: 'bg-primario' },
}

export default function Insignia({ tono = 'info', className = '', children }) {
  const { caja, punto } = TONOS[tono]
  return (
    <span
      className={`inline-flex h-8 items-center gap-2 rounded-2xl px-3 text-[13px] font-semibold ${caja} ${className}`}
    >
      <span className={`size-2 rounded-full ${punto}`} />
      {children}
    </span>
  )
}
