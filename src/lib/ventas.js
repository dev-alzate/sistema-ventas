import { diaOperacion } from '../utils/fechas'

// Arma la venta con las mismas columnas de las tablas "ventas" y "venta_items".
// Los UUID se generan aquí (en el navegador) para que la sincronización no duplique.
// Pendiente para el paso 6: asignar el número de venta y guardarla en el equipo (Dexie).
export function crearVenta({ local, items, efectivo }) {
  const ahora = new Date()
  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)
  return {
    id: crypto.randomUUID(),
    local,
    dia: diaOperacion(ahora),
    creada_en: ahora.toISOString(),
    total,
    efectivo_recibido: efectivo,
    cambio: efectivo - total,
    items: items.map((i) => ({
      id: crypto.randomUUID(),
      producto_id: i.id,
      nombre: i.nombre,
      precio_unitario: i.precio,
      cantidad: i.cantidad,
    })),
  }
}
