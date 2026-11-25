import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { supabase } from '../lib/supabase'

function ordenar(a, b) {
  const porCodigo = (a.codigo ?? '￿').localeCompare(b.codigo ?? '￿')
  return porCodigo || a.nombre.localeCompare(b.nombre)
}

// Productos activos. Se muestran desde la copia del equipo (Dexie) y se
// actualizan desde Supabase cuando hay internet.
// El RLS ya oculta los inactivos a los locales; .eq('activo', true) es para el admin.
export function useProductos() {
  const guardados = useLiveQuery(() => db.productos.toArray(), [])
  const [remoto, setRemoto] = useState({ respondio: false, error: null })

  useEffect(() => {
    localStorage.removeItem('productos') // copia antigua del paso 4
    let cancelado = false
    supabase
      .from('productos')
      .select('id, codigo, nombre, precio')
      .eq('activo', true)
      .then(async ({ data, error }) => {
        if (data) {
          // Reemplaza la copia completa: así desaparecen los productos desactivados
          await db.transaction('rw', db.productos, async () => {
            await db.productos.clear()
            await db.productos.bulkPut(data)
          })
        }
        if (!cancelado) setRemoto({ respondio: true, error })
      })
    return () => {
      cancelado = true
    }
  }, [])

  const productos = (guardados ?? []).slice().sort(ordenar)
  return {
    productos,
    cargando: guardados === undefined || (productos.length === 0 && !remoto.respondio),
    error: remoto.error,
  }
}
