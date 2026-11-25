import { db } from './db'
import { supabase } from './supabase'
import { diaOperacion } from '../utils/fechas'

// Arma la venta con las mismas columnas de las tablas "ventas" y "venta_items".
// Los UUID se generan aquí (en el navegador) para que la sincronización no duplique.
export function crearVenta({ local, vendedorId, items, efectivo }) {
  const ahora = new Date()
  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)
  return {
    id: crypto.randomUUID(),
    local,
    vendedor_id: vendedorId,
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

// Asigna el siguiente número del local y guarda la venta en el equipo como 'pendiente'.
// La transacción evita que dos pestañas abiertas tomen el mismo número.
export async function guardarVenta(venta) {
  return db.transaction('rw', db.ventas, db.contadores, async () => {
    const contador = await db.contadores.get(venta.local)
    const numero = (contador?.ultimo ?? 0) + 1
    await db.contadores.put({ local: venta.local, ultimo: numero })
    const guardada = { ...venta, numero, estado: 'pendiente', intentos: 0 }
    await db.ventas.add(guardada)
    return guardada
  })
}

// Si este equipo es nuevo o se borraron sus datos, el contador arrancaría en 1.
// Con internet, se sube hasta el último número que ya tiene Supabase para ese local.
export async function ajustarContador(local) {
  const { data } = await supabase
    .from('ventas')
    .select('numero')
    .eq('local', local)
    .order('numero', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return
  await db.transaction('rw', db.contadores, async () => {
    const contador = await db.contadores.get(local)
    if ((contador?.ultimo ?? 0) < data.numero) {
      await db.contadores.put({ local, ultimo: data.numero })
    }
  })
}
