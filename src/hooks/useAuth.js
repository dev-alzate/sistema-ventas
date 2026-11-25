import { useContext } from 'react'
import { AuthContexto } from './auth-contexto'

// Devuelve { sesion, perfil, cargando }
//   sesion: la sesión de Supabase o null
//   perfil: { id, nombre, rol, local } o null
//   cargando: true mientras se sabe si hay sesión y cuál es el perfil
export function useAuth() {
  const valor = useContext(AuthContexto)
  if (!valor) throw new Error('useAuth debe usarse dentro de <ProveedorAuth>')
  return valor
}
