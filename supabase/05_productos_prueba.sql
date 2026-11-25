-- =========================================================
-- 05_productos_prueba.sql — Productos de prueba (los mismos del diseño)
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Se puede ejecutar varias veces: no duplica (el código es único).
-- Más adelante se reemplazan con la importación desde Excel (paso 9).
-- =========================================================

insert into public.productos (codigo, nombre, precio) values
  ('P-001', 'Producto A',  5000),
  ('P-002', 'Producto B', 12500),
  ('P-003', 'Producto C',  8000),
  ('P-004', 'Producto D',  3500),
  ('P-005', 'Producto E', 15000),
  ('P-006', 'Producto F',  2000),
  ('P-007', 'Producto G',  7500),
  ('P-008', 'Producto H', 22000),
  ('P-009', 'Producto I',  4200),
  ('P-010', 'Producto J',  9800),
  ('P-011', 'Producto K',  1500),
  ('P-012', 'Producto L', 18000)
on conflict (codigo) do nothing;

-- Comprobación: deben salir 12 productos activos
select codigo, nombre, precio, activo from public.productos order by codigo;
