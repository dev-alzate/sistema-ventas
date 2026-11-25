// Contenedor blanco con borde y sombra suave.
// "como" permite cambiar la etiqueta HTML: <Tarjeta como="section">, <Tarjeta como="aside">…
export default function Tarjeta({ como: Etiqueta = 'div', className = '', children, ...props }) {
  return (
    <Etiqueta
      className={`rounded-lg border border-borde bg-tarjeta shadow-tarjeta ${className}`}
      {...props}
    >
      {children}
    </Etiqueta>
  )
}
