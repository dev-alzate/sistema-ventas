import { supabase } from './supabase'

// Los usuarios escriben "local1"; Supabase necesita un correo.
const DOMINIO = 'sistema-ventas.local'
const CLAVE_PERFIL = 'perfil'

export function aCorreo(usuario) {
  const limpio = usuario.trim().toLowerCase()
  return limpio.includes('@') ? limpio : `${limpio}@${DOMINIO}`
}

export async function iniciarSesion(usuario, clave) {
  const { error } = await supabase.auth.signInWithPassword({
    email: aCorreo(usuario),
    password: clave,
  })
  if (!error) return null
  if (error.message === 'Invalid login credentials') return 'Usuario o contraseña incorrectos.'
  if (!navigator.onLine || error.name === 'AuthRetryableFetchError') {
    return 'Sin conexión. Para iniciar sesión se necesita internet.'
  }
  return 'No se pudo iniciar sesión. Intenta de nuevo.'
}

// scope 'local': cierra la sesión solo en este equipo y funciona sin internet
// (supabase-js borra la sesión local antes de avisar al servidor).
export async function cerrarSesion() {
  borrarPerfilGuardado()
  await supabase.auth.signOut({ scope: 'local' })
}

// El perfil (rol y local) se guarda en el equipo para poder abrir la app sin internet.
export function leerPerfilGuardado(usuarioId) {
  try {
    const perfil = JSON.parse(localStorage.getItem(CLAVE_PERFIL))
    return perfil?.id === usuarioId ? perfil : null
  } catch {
    return null
  }
}

export function guardarPerfil(perfil) {
  localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil))
}

function borrarPerfilGuardado() {
  localStorage.removeItem(CLAVE_PERFIL)
}

// A qué pantalla va cada rol después de iniciar sesión
export function rutaInicio(rol) {
  return rol === 'admin' ? '/admin' : '/local'
}
