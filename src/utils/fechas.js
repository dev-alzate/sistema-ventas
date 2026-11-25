// Todas las fechas se muestran en hora de Colombia, aunque el equipo tenga otra zona.
const ZONA = 'America/Bogota'

// Día de operación "AAAA-MM-DD" (columna "dia" de ventas y cierres)
export function diaOperacion(fecha = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(fecha)
}

// "mar, 24 nov 2026"
export function formatearFechaCorta(fecha) {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fecha)
}

// "9:31:08 p. m."
export function formatearHora(fecha) {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(fecha)
}
