// 50000 → "50.000"
export function formatearMiles(valor) {
  return String(Math.abs(Math.round(Number(valor) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Formato de pesos colombianos: 12500 → "$12.500"
// No se usa Intl.NumberFormat('es-CO') porque deja "5000" sin punto en números de 4 cifras.
export function formatearPesos(valor) {
  const signo = Math.round(Number(valor) || 0) < 0 ? '-' : ''
  return signo + '$' + formatearMiles(valor)
}

// N.º de venta para pantalla y recibo: local 1, número 124 → "L1-000124"
export function formatearNumeroVenta(local, numero) {
  return `L${local}-${String(numero).padStart(6, '0')}`
}

// Lo que el usuario escribe en un campo de dinero → número: "$50.000" → 50000
export function leerPesos(texto) {
  return parseInt(String(texto).replace(/\D/g, ''), 10) || 0
}
