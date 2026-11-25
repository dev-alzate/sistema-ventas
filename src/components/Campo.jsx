// Etiqueta + input con el estilo del diseño.
// "children" sirve para poner algo dentro del input, como el botón de mostrar contraseña.
export default function Campo({ id, etiqueta, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`h-12 w-full rounded-md border border-borde bg-tarjeta px-3.5 text-base text-texto placeholder:text-texto-tenue ${className}`}
          {...props}
        />
        {children}
      </div>
    </div>
  )
}
