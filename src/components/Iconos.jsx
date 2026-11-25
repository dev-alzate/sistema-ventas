// Íconos SVG copiados del diseño. Toman el color del texto (currentColor),
// así que se pintan con clases como "text-primario".
function Icono({ tamano = 20, grosor = 2, children, ...props }) {
  return (
    <svg
      aria-hidden="true"
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconoRecibo = (p) => (
  <Icono {...p}>
    <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
  </Icono>
)

export const IconoOjo = (p) => (
  <Icono {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icono>
)

export const IconoOjoTachado = (p) => (
  <Icono {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M3 3l18 18" />
  </Icono>
)

export const IconoCalendario = (p) => (
  <Icono {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icono>
)

export const IconoCandado = (p) => (
  <Icono {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icono>
)

export const IconoBuscar = (p) => (
  <Icono {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icono>
)

export const IconoMas = (p) => (
  <Icono grosor={3} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icono>
)

export const IconoMenos = (p) => (
  <Icono grosor={3} {...p}>
    <path d="M5 12h14" />
  </Icono>
)

export const IconoPapelera = (p) => (
  <Icono {...p}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
  </Icono>
)

export const IconoImpresora = (p) => (
  <Icono {...p}>
    <path d="M6 9V3h12v6" />
    <rect x="3" y="9" width="18" height="8" rx="2" />
    <path d="M6 14h12v7H6z" />
  </Icono>
)

export const IconoCarrito = (p) => (
  <Icono {...p}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.5 12h12l2-8H6.5" />
  </Icono>
)
