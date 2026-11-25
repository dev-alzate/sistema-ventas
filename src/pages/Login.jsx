import { useState } from 'react'
import Boton from '../components/Boton'
import Campo from '../components/Campo'
import { IconoOjo, IconoOjoTachado, IconoRecibo } from '../components/Iconos'
import { iniciarSesion } from '../lib/auth'

// Pantalla de ingreso (docs/diseno/1-login.html).
// Al iniciar sesión no navega por sí misma: ProveedorAuth detecta la sesión
// y la ruta /login redirige a la pantalla del rol.
export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function alEnviar(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    const mensaje = await iniciarSesion(usuario, clave)
    setEnviando(false)
    if (mensaje) setError(mensaje)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <main className="flex w-full max-w-[400px] flex-col gap-7 rounded-lg border border-borde bg-tarjeta px-9 pt-10 pb-8 shadow-elevada">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-[52px] items-center justify-center rounded-lg bg-primario-claro text-primario">
            <IconoRecibo tamano={26} />
          </span>
          <h1 className="text-[26px] font-bold tracking-tight">Ventas</h1>
          <p className="text-[15px] text-texto-sec">Ingresa con tu usuario para continuar</p>
        </div>

        <form onSubmit={alEnviar} className="flex flex-col gap-[18px]">
          <Campo
            id="usuario"
            etiqueta="Usuario"
            autoComplete="username"
            autoCapitalize="none"
            placeholder="Ej. local1"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
          <Campo
            id="clave"
            etiqueta="Contraseña"
            type={verClave ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-13"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          >
            <button
              type="button"
              onClick={() => setVerClave(!verClave)}
              aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute top-1 right-1 flex size-10 cursor-pointer items-center justify-center rounded-md text-texto-sec hover:bg-primario-claro"
            >
              {verClave ? <IconoOjoTachado /> : <IconoOjo />}
            </button>
          </Campo>

          {error && (
            <p role="alert" className="rounded-md bg-error-fondo px-3.5 py-2.5 text-sm font-medium text-error-texto">
              {error}
            </p>
          )}

          <Boton type="submit" tamano="lg" className="mt-1.5" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Boton>
        </form>
      </main>
    </div>
  )
}
