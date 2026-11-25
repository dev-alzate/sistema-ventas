-- =========================================================
-- 03_rls.sql — Funciones auxiliares y políticas RLS
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Se puede ejecutar varias veces: borra y recrea las políticas.
-- =========================================================

-- Esquema privado: la API de Supabase solo expone "public",
-- así que estas funciones no se pueden llamar desde el navegador.
create schema if not exists privado;
grant usage on schema privado to authenticated;

-- ¿El usuario con sesión es admin?
-- security definer: se ejecuta con permisos del dueño, así puede leer "perfiles"
-- sin que la política de perfiles se llame a sí misma (recursión infinita).
create or replace function privado.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;

-- Local del usuario con sesión (1, 2 o null para el admin)
create or replace function privado.mi_local()
returns smallint
language sql
stable
security definer
set search_path = ''
as $$
  select local from public.perfiles where id = (select auth.uid());
$$;

revoke all on function privado.es_admin(), privado.mi_local() from public;
grant execute on function privado.es_admin(), privado.mi_local() to authenticated;

-- Nota: (select ...) entre paréntesis hace que Postgres evalúe la función
-- una sola vez por consulta y no una vez por fila (rendimiento).

-- ---------- PERFILES ----------
drop policy if exists "perfiles: ver el propio, admin ve todos" on public.perfiles;
create policy "perfiles: ver el propio, admin ve todos"
  on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select privado.es_admin()));

-- ---------- PRODUCTOS ----------
drop policy if exists "productos: locales ven activos, admin ve todos" on public.productos;
create policy "productos: locales ven activos, admin ve todos"
  on public.productos for select to authenticated
  using (activo or (select privado.es_admin()));

drop policy if exists "productos: solo admin crea" on public.productos;
create policy "productos: solo admin crea"
  on public.productos for insert to authenticated
  with check ((select privado.es_admin()));

drop policy if exists "productos: solo admin edita" on public.productos;
create policy "productos: solo admin edita"
  on public.productos for update to authenticated
  using ((select privado.es_admin()))
  with check ((select privado.es_admin()));

drop policy if exists "productos: solo admin borra" on public.productos;
create policy "productos: solo admin borra"
  on public.productos for delete to authenticated
  using ((select privado.es_admin()));

-- ---------- VENTAS ----------
-- Sin política de UPDATE: una venta registrada no se modifica.
drop policy if exists "ventas: local ve las suyas, admin ve todas" on public.ventas;
create policy "ventas: local ve las suyas, admin ve todas"
  on public.ventas for select to authenticated
  using (local = (select privado.mi_local()) or (select privado.es_admin()));

drop policy if exists "ventas: local registra solo en su local" on public.ventas;
create policy "ventas: local registra solo en su local"
  on public.ventas for insert to authenticated
  with check (
    local = (select privado.mi_local())
    and vendedor_id = (select auth.uid())
  );

drop policy if exists "ventas: solo admin borra" on public.ventas;
create policy "ventas: solo admin borra"
  on public.ventas for delete to authenticated
  using ((select privado.es_admin()));

-- ---------- VENTA_ITEMS ----------
-- Sin política de DELETE: se borran en cascada al borrar la venta.
drop policy if exists "venta_items: se ven si se ve la venta" on public.venta_items;
create policy "venta_items: se ven si se ve la venta"
  on public.venta_items for select to authenticated
  using (exists (
    select 1 from public.ventas v
    where v.id = venta_items.venta_id
      and (v.local = (select privado.mi_local()) or (select privado.es_admin()))
  ));

drop policy if exists "venta_items: local agrega líneas a sus ventas" on public.venta_items;
create policy "venta_items: local agrega líneas a sus ventas"
  on public.venta_items for insert to authenticated
  with check (exists (
    select 1 from public.ventas v
    where v.id = venta_items.venta_id
      and v.local = (select privado.mi_local())
  ));

-- ---------- CIERRES ----------
drop policy if exists "cierres: local ve los suyos, admin ve todos" on public.cierres;
create policy "cierres: local ve los suyos, admin ve todos"
  on public.cierres for select to authenticated
  using (local = (select privado.mi_local()) or (select privado.es_admin()));

drop policy if exists "cierres: local cierra solo su local" on public.cierres;
create policy "cierres: local cierra solo su local"
  on public.cierres for insert to authenticated
  with check (
    local = (select privado.mi_local())
    and cerrado_por = (select auth.uid())
  );

drop policy if exists "cierres: solo admin borra" on public.cierres;
create policy "cierres: solo admin borra"
  on public.cierres for delete to authenticated
  using ((select privado.es_admin()));
