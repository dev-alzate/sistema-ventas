import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Copia de los productos en el equipo, para vender sin internet.
// (En el paso 6 se pasa a Dexie junto con las ventas.)
const CLAVE = 'productos'

function leerGuardados() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE))
  } catch {
    return null
  }
}

// Productos activos. El RLS ya oculta los inactivos a los locales;
// el filtro .eq('activo', true) es para que el admin tampoco los vea aquí.
export function useProductos() {
  const [estado, setEstado] = useState(() => ({ productos: leerGuardados(), error: null }))

  useEffect(() => {
    let cancelado = false
    supabase
      .from('productos')
      .select('id, codigo, nombre, precio')
      .eq('activo', true)
      .order('codigo', { nullsFirst: false })
      .order('nombre')
      .then(({ data, error }) => {
        if (cancelado) return
        if (data) {
          localStorage.setItem(CLAVE, JSON.stringify(data))
          setEstado({ productos: data, error: null })
        } else {
          // Sin internet: se sigue usando la copia guardada
          setEstado((anterior) => ({ ...anterior, error }))
        }
      })
    return () => {
      cancelado = true
    }
  }, [])

  return {
    productos: estado.productos ?? [],
    cargando: estado.productos === null && !estado.error,
    error: estado.error,
  }
}
