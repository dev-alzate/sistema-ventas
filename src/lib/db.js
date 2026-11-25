import Dexie from 'dexie'

// Base de datos local (IndexedDB) de este equipo.
// Las ventas se guardan aquí primero y se envían a Supabase cuando hay internet.
export const db = new Dexie('sistema-ventas')

db.version(1).stores({
  // Solo se declaran los campos indexados; el resto de la venta (items, total…) se guarda igual.
  // estado: 'pendiente' | 'enviada' | 'fallida'
  ventas: 'id, estado, dia, vendedor_id',
  // Copia de los productos activos para vender sin internet
  productos: 'id',
  // Último número de venta usado por cada local: { local, ultimo }
  contadores: 'local',
})
