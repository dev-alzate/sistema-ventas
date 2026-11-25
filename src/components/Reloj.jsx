import { useEffect, useState } from 'react'
import { IconoCalendario } from './Iconos'
import { formatearFechaCorta, formatearHora } from '../utils/fechas'

// Fecha y hora en la barra superior; se actualiza cada segundo.
export default function Reloj() {
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm text-texto-sec tabular-nums">
      <IconoCalendario tamano={16} />
      <span>{formatearFechaCorta(ahora)}</span>
      <span className="font-semibold text-texto">{formatearHora(ahora)}</span>
    </div>
  )
}
