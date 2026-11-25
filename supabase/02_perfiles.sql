-- =========================================================
-- 02_perfiles.sql — Asigna el rol a cada usuario
-- Antes de ejecutarlo:
--   1. Authentication → Sign In / Providers → apagar "Allow new users to sign up"
--   2. Authentication → Users → Add user → Create new user (marcar "Auto Confirm User")
--      para los 3 correos de abajo. Si usaste otros correos, cámbialos aquí.
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- =========================================================

insert into public.perfiles (id, nombre, rol)
select u.id, p.nombre, p.rol
from (values
  ('admin@sistema-ventas.local',  'Administrador', 'admin'),
  ('local1@sistema-ventas.local', 'Local 1',       'local1'),
  ('local2@sistema-ventas.local', 'Local 2',       'local2')
) as p(email, nombre, rol)
join auth.users u on u.email = p.email
on conflict (id) do nothing;   -- si ya existe el perfil, no hace nada (se puede ejecutar varias veces)

-- Comprobación: deben salir 3 filas (local: NULL para admin, 1 y 2 para los locales)
select u.email, p.nombre, p.rol, p.local
from public.perfiles p
join auth.users u on u.id = p.id
order by p.rol;
