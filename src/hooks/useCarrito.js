import { useReducer } from 'react'

// Cada línea guarda una copia del nombre y el precio al momento de agregarla.
function reducir(items, accion) {
  switch (accion.tipo) {
    case 'agregar': {
      const p = accion.producto
      if (items.some((i) => i.id === p.id)) {
        return items.map((i) => (i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      }
      return [...items, { id: p.id, codigo: p.codigo, nombre: p.nombre, precio: p.precio, cantidad: 1 }]
    }
    case 'cambiar':
      return items
        .map((i) => (i.id === accion.id ? { ...i, cantidad: i.cantidad + accion.delta } : i))
        .filter((i) => i.cantidad > 0)
    case 'quitar':
      return items.filter((i) => i.id !== accion.id)
    case 'vaciar':
      return []
    default:
      return items
  }
}

export function useCarrito() {
  const [items, despachar] = useReducer(reducir, [])
  return {
    items,
    total: items.reduce((suma, i) => suma + i.precio * i.cantidad, 0),
    unidades: items.reduce((suma, i) => suma + i.cantidad, 0),
    agregar: (producto) => despachar({ tipo: 'agregar', producto }),
    sumar: (id) => despachar({ tipo: 'cambiar', id, delta: 1 }),
    restar: (id) => despachar({ tipo: 'cambiar', id, delta: -1 }),
    quitar: (id) => despachar({ tipo: 'quitar', id }),
    vaciar: () => despachar({ tipo: 'vaciar' }),
  }
}
