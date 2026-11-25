import { useSyncExternalStore } from 'react'

function suscribir(avisar) {
  window.addEventListener('online', avisar)
  window.addEventListener('offline', avisar)
  return () => {
    window.removeEventListener('online', avisar)
    window.removeEventListener('offline', avisar)
  }
}

// true si el equipo tiene conexión. Se actualiza solo cuando se cae o vuelve internet.
export function useEnLinea() {
  return useSyncExternalStore(suscribir, () => navigator.onLine, () => true)
}
