import { useEnLinea } from '../hooks/useEnLinea'
import Insignia from './Insignia'

// Estado de la conexión y de las ventas que faltan por enviar a Supabase.
export default function EstadoConexion({ porEnviar = 0 }) {
  const enLinea = useEnLinea()
  const ventas = `${porEnviar} ${porEnviar === 1 ? 'venta' : 'ventas'}`

  if (!enLinea) {
    return (
      <Insignia tono="alerta">
        {porEnviar > 0 ? `Sin conexión · ${ventas} guardadas en el equipo` : 'Sin conexión'}
      </Insignia>
    )
  }
  if (porEnviar > 0) return <Insignia tono="info">En línea · enviando {ventas}</Insignia>
  return <Insignia tono="exito">En línea</Insignia>
}
