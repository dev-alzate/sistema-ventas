import { useEnLinea } from '../hooks/useEnLinea'
import Insignia from './Insignia'

export default function EstadoConexion() {
  const enLinea = useEnLinea()
  return enLinea ? (
    <Insignia tono="exito">En línea</Insignia>
  ) : (
    <Insignia tono="alerta">Sin conexión</Insignia>
  )
}
