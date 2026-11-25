// Formato de pesos colombianos: 12500 → "$12.500"
// No se usa Intl.NumberFormat('es-CO') porque deja "5000" sin punto en números de 4 cifras.
export function formatearPesos(valor) {
  const entero = Math.round(Number(valor) || 0)
  const signo = entero < 0 ? '-' : ''
  return signo + '$' + String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
