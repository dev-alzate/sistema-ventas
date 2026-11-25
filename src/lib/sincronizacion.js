import { db } from './db'
import { supabase } from './supabase'
import { diaOperacion } from '../utils/fechas'

const DIAS_A_CONSERVAR = 14

// Columnas que existen en Supabase (lo demás —estado, intentos…— solo vive en el equipo)
function filaVenta(v) {
  return {
    id: v.id,
    local: v.local,
    numero: v.numero,
    dia: v.dia,
    creada_en: v.creada_en,
    total: v.total,
    efectivo_recibido: v.efectivo_recibido,
    cambio: v.cambio,
    vendedor_id: v.vendedor_id,
  }
}

function filasItems(v) {
  // Sin "subtotal": es una columna generada y Postgres rechaza que se envíe
  return v.items.map((i) => ({
    id: i.id,
    venta_id: v.id,
    producto_id: i.producto_id,
    nombre: i.nombre,
    precio_unitario: i.precio_unitario,
    cantidad: i.cantidad,
  }))
}

function esErrorDeRed(error) {
  return !navigator.onLine || /fetch|network|load failed/i.test(error?.message ?? '')
}

// upsert + ignoreDuplicates = INSERT … ON CONFLICT DO NOTHING:
// si la venta ya llegó en un intento anterior, no se duplica ni da error.
async function enviarVenta(venta) {
  const opciones = { onConflict: 'id', ignoreDuplicates: true }
  const r1 = await supabase.from('ventas').upsert(filaVenta(venta), opciones)
  if (r1.error) return r1.error
  const r2 = await supabase.from('venta_items').upsert(filasItems(venta), opciones)
  return r2.error
}

async function procesar() {
  if (!navigator.onLine) return
  const { data } = await supabase.auth.getSession()
  const usuarioId = data.session?.user?.id
  if (!usuarioId) return

  // Solo las ventas de este usuario: el RLS exige vendedor_id = usuario con sesión
  const porEnviar = await db.ventas
    .where('estado')
    .anyOf('pendiente', 'fallida')
    .filter((v) => v.vendedor_id === usuarioId)
    .sortBy('creada_en')

  for (const venta of porEnviar) {
    const error = await enviarVenta(venta)
    if (!error) {
      await db.ventas.update(venta.id, { estado: 'enviada', enviada_en: new Date().toISOString(), error: null })
    } else if (esErrorDeRed(error)) {
      break // se cayó internet: se reintenta cuando vuelva
    } else {
      console.error(`No se pudo enviar la venta ${venta.id}:`, error)
      await db.ventas.update(venta.id, {
        estado: 'fallida',
        intentos: (venta.intentos ?? 0) + 1,
        error: error.message,
      })
    }
  }

  // Las ventas ya enviadas se borran del equipo después de unos días
  const limite = diaOperacion(new Date(Date.now() - DIAS_A_CONSERVAR * 86_400_000))
  await db.ventas
    .where('dia')
    .below(limite)
    .and((v) => v.estado === 'enviada')
    .delete()
}

let enCurso = null

// Envía a Supabase las ventas pendientes. Si ya hay un envío en curso, espera ese mismo
// (así dos llamadas seguidas no mandan la misma venta dos veces a la vez).
export function sincronizar() {
  if (!enCurso) {
    enCurso = procesar()
      .catch((error) => console.error('Error al sincronizar:', error))
      .finally(() => {
        enCurso = null
      })
  }
  return enCurso
}

// Cuántas ventas de este usuario faltan por enviar (para la barra y el cierre de sesión)
export function contarPorEnviar(usuarioId) {
  return db.ventas
    .where('estado')
    .anyOf('pendiente', 'fallida')
    .filter((v) => v.vendedor_id === usuarioId)
    .count()
}
