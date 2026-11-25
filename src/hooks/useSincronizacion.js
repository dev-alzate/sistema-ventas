import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ajustarContador } from '../lib/ventas'
import { contarPorEnviar, sincronizar } from '../lib/sincronizacion'

const CADA_MINUTO = 60_000

// Envía las ventas pendientes: al abrir la pantalla, cuando vuelve internet y cada minuto
// (el evento "online" no siempre se dispara, por eso también hay un reintento periódico).
// Devuelve cuántas ventas faltan por enviar; se actualiza solo.
export function useSincronizacion(perfil) {
  const usuarioId = perfil?.id
  const local = perfil?.local

  useEffect(() => {
    if (!usuarioId) return
    if (local) ajustarContador(local).catch(() => {})
    sincronizar()
    window.addEventListener('online', sincronizar)
    const intervalo = setInterval(sincronizar, CADA_MINUTO)
    return () => {
      window.removeEventListener('online', sincronizar)
      clearInterval(intervalo)
    }
  }, [usuarioId, local])

  return useLiveQuery(() => (usuarioId ? contarPorEnviar(usuarioId) : 0), [usuarioId], 0)
}
