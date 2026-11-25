import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { guardarPerfil, leerPerfilGuardado } from '../lib/auth'
import { AuthContexto } from '../hooks/auth-contexto'

// Mantiene la sesión y el perfil del usuario disponibles para toda la app.
export default function ProveedorAuth({ children }) {
  // undefined = todavía no se sabe; null = no hay sesión
  const [sesion, setSesion] = useState(undefined)
  // Último perfil leído de Supabase, con el usuario al que pertenece
  const [remoto, setRemoto] = useState({ usuarioId: null, perfil: null })

  // 1. Sesión: se lee del equipo (funciona sin internet) y se escuchan los cambios
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSesion(nueva))
    return () => data.subscription.unsubscribe()
  }, [])

  const usuarioId = sesion?.user?.id ?? null

  // 2. Perfil: se pide a Supabase cada vez que cambia el usuario
  useEffect(() => {
    if (!usuarioId) return
    let cancelado = false
    supabase
      .from('perfiles')
      .select('id, nombre, rol, local')
      .eq('id', usuarioId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelado) return
        if (data) guardarPerfil(data)
        // Si falla por falta de internet, se queda con el perfil guardado en el equipo
        setRemoto({ usuarioId, perfil: data, error })
      })
    return () => {
      cancelado = true
    }
  }, [usuarioId])

  const guardado = useMemo(() => (usuarioId ? leerPerfilGuardado(usuarioId) : null), [usuarioId])
  const respondio = remoto.usuarioId === usuarioId
  const perfil = usuarioId ? (respondio && remoto.perfil) || guardado : null
  const cargando = sesion === undefined || (usuarioId !== null && !perfil && !respondio)

  return (
    <AuthContexto.Provider value={{ sesion: sesion ?? null, perfil, cargando }}>
      {children}
    </AuthContexto.Provider>
  )
}
