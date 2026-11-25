-- =========================================================
-- 04_pruebas_rls.sql — Prueba las políticas haciéndose pasar por cada usuario.
-- Ejecutar COMPLETO en el SQL Editor (después de 01, 02 y 03).
-- Resultado esperado: 27 filas, todas con ✅.
-- Limpia sus datos de prueba al terminar (fecha 1900-01-01 y nombres "__prueba").
-- =========================================================

-- Cuenta las filas que ve el usuario actual
create or replace function pg_temp.contar(consulta text) returns text
language plpgsql as $$
declare c bigint;
begin
  execute 'select count(*) from (' || consulta || ') t' into c;
  return c::text;
exception when others then
  return 'error: ' || sqlerrm;
end $$;

-- Intenta un INSERT/UPDATE/DELETE: 'permitido' si afectó filas, si no 'bloqueado'
create or replace function pg_temp.intentar(sentencia text) returns text
language plpgsql as $$
declare c bigint;
begin
  execute sentencia;
  get diagnostics c = row_count;
  return case when c > 0 then 'permitido' else 'bloqueado' end;
exception
  when insufficient_privilege then return 'bloqueado';
  when others then return 'error: ' || sqlerrm;
end $$;

-- Cambia la sesión para actuar como el usuario con ese rol (igual que hace la API de Supabase)
create or replace function pg_temp.como(p_rol text) returns void
language plpgsql as $$
declare uid uuid;
begin
  perform set_config('role', 'none', true);
  if p_rol = 'anon' then
    perform set_config('request.jwt.claims', '', true);
    perform set_config('role', 'anon', true);
    return;
  end if;
  select id into uid from public.perfiles where rol = p_rol;
  if uid is null then
    raise exception 'No hay perfil con rol %. Revisa 02_perfiles.sql.', p_rol;
  end if;
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

create or replace function pg_temp.probar_rls()
returns table (n int, prueba text, esperado text, obtenido text, ok text)
language plpgsql as $$
declare
  f   date := '1900-01-01';          -- fecha de los datos de prueba
  vl1 uuid := gen_random_uuid();     -- venta de prueba del local 1
  vl2 uuid := gen_random_uuid();     -- venta de prueba del local 2
  nv1 uuid := gen_random_uuid();     -- venta que intentará crear local1
  nv2 uuid := gen_random_uuid();     -- venta que intentará crear local2
  ventas_prueba text := format('select 1 from public.ventas where dia = %L', '1900-01-01');
  prods_prueba  text := 'select 1 from public.productos where nombre in (''__prueba_activo'', ''__prueba_inactivo'')';
  r text[] := '{}';
begin
  -- ===== Datos de prueba (como postgres, sin RLS) =====
  perform set_config('role', 'none', true);
  insert into public.productos (nombre, precio, activo)
    values ('__prueba_activo', 1000, true), ('__prueba_inactivo', 1000, false);
  insert into public.ventas (id, local, numero, dia, creada_en, total, efectivo_recibido, cambio, vendedor_id) values
    (vl1, 1, 999001, f, now(), 1000, 2000, 1000, (select id from public.perfiles where rol = 'local1')),
    (vl2, 2, 999001, f, now(), 1000, 2000, 1000, (select id from public.perfiles where rol = 'local2'));
  insert into public.venta_items (id, venta_id, nombre, precio_unitario, cantidad) values
    (gen_random_uuid(), vl1, '__prueba', 1000, 1),
    (gen_random_uuid(), vl2, '__prueba', 1000, 1);
  insert into public.cierres (id, local, dia, num_ventas, total, cerrado_en, cerrado_por) values
    (gen_random_uuid(), 2, f, 1, 1000, now(), (select id from public.perfiles where rol = 'local2'));

  -- ===== LOCAL 1 =====
  perform pg_temp.como('local1');
  r := r || array[array['local1 ve solo su perfil', '1', pg_temp.contar('select 1 from public.perfiles')]];
  r := r || array[array['local1 ve solo productos activos', '1', pg_temp.contar(prods_prueba)]];
  r := r || array[array['local1 ve solo ventas de su local', '1', pg_temp.contar(ventas_prueba)]];
  r := r || array[array['local1 ve solo líneas de sus ventas', '1',
    pg_temp.contar(format('select 1 from public.venta_items where venta_id in (%L, %L)', vl1, vl2))]];
  r := r || array[array['local1 registra venta en su local', 'permitido', pg_temp.intentar(format(
    'insert into public.ventas (id, local, numero, dia, creada_en, total, efectivo_recibido, cambio) values (%L, 1, 999002, %L, now(), 1000, 1000, 0)', nv1, f))]];
  r := r || array[array['local1 agrega línea a su venta', 'permitido', pg_temp.intentar(format(
    'insert into public.venta_items (id, venta_id, nombre, precio_unitario, cantidad) values (gen_random_uuid(), %L, ''__prueba'', 1000, 1)', nv1))]];
  r := r || array[array['local1 NO registra venta en local 2', 'bloqueado', pg_temp.intentar(format(
    'insert into public.ventas (id, local, numero, dia, creada_en, total, efectivo_recibido, cambio) values (gen_random_uuid(), 2, 999003, %L, now(), 1000, 1000, 0)', f))]];
  r := r || array[array['local1 NO agrega línea a venta del local 2', 'bloqueado', pg_temp.intentar(format(
    'insert into public.venta_items (id, venta_id, nombre, precio_unitario, cantidad) values (gen_random_uuid(), %L, ''__prueba'', 1000, 1)', vl2))]];
  r := r || array[array['local1 NO crea productos', 'bloqueado', pg_temp.intentar(
    'insert into public.productos (nombre, precio) values (''__prueba_activo'', 1)')]];
  r := r || array[array['local1 NO edita productos', 'bloqueado', pg_temp.intentar(
    'update public.productos set precio = 1 where nombre = ''__prueba_activo''')]];
  r := r || array[array['local1 NO borra ventas', 'bloqueado', pg_temp.intentar(
    format('delete from public.ventas where id = %L', vl1))]];
  r := r || array[array['local1 hace cierre de su local', 'permitido', pg_temp.intentar(format(
    'insert into public.cierres (id, local, dia, num_ventas, total, cerrado_en) values (gen_random_uuid(), 1, %L, 1, 1000, now())', f))]];
  r := r || array[array['local1 NO cierra el local 2', 'bloqueado', pg_temp.intentar(format(
    'insert into public.cierres (id, local, dia, num_ventas, total, cerrado_en) values (gen_random_uuid(), 2, %L, 1, 1000, now())', f + 1))]];
  r := r || array[array['local1 ve solo sus cierres', '1',
    pg_temp.contar(format('select 1 from public.cierres where dia = %L', f))]];

  -- ===== LOCAL 2 =====
  perform pg_temp.como('local2');
  r := r || array[array['local2 ve solo ventas de su local', '1', pg_temp.contar(ventas_prueba)]];
  r := r || array[array['local2 registra venta en su local', 'permitido', pg_temp.intentar(format(
    'insert into public.ventas (id, local, numero, dia, creada_en, total, efectivo_recibido, cambio) values (%L, 2, 999002, %L, now(), 1000, 1000, 0)', nv2, f))]];

  -- ===== ADMIN =====
  perform pg_temp.como('admin');
  r := r || array[array['admin ve todos los perfiles', '3', pg_temp.contar('select 1 from public.perfiles')]];
  r := r || array[array['admin ve productos activos e inactivos', '2', pg_temp.contar(prods_prueba)]];
  r := r || array[array['admin ve ventas de ambos locales', '4', pg_temp.contar(ventas_prueba)]];
  r := r || array[array['admin ve cierres de ambos locales', '2',
    pg_temp.contar(format('select 1 from public.cierres where dia = %L', f))]];
  r := r || array[array['admin NO registra ventas', 'bloqueado', pg_temp.intentar(format(
    'insert into public.ventas (id, local, numero, dia, creada_en, total, efectivo_recibido, cambio) values (gen_random_uuid(), 1, 999004, %L, now(), 1000, 1000, 0)', f))]];
  r := r || array[array['admin edita productos', 'permitido', pg_temp.intentar(
    'update public.productos set precio = 2000 where nombre = ''__prueba_activo''')]];

  -- ===== SIN SESIÓN (todavía hay datos de prueba) =====
  perform pg_temp.como('anon');
  r := r || array[array['sin sesión NO ve productos', '0', pg_temp.contar(prods_prueba)]];
  r := r || array[array['sin sesión NO ve ventas', '0', pg_temp.contar(ventas_prueba)]];

  -- ===== ADMIN borra (prueba de "borrar historial") =====
  perform pg_temp.como('admin');
  r := r || array[array['admin borra ventas', 'permitido', pg_temp.intentar(
    format('delete from public.ventas where dia = %L', f))]];
  r := r || array[array['líneas borradas en cascada', '0',
    pg_temp.contar(format('select 1 from public.venta_items where venta_id in (%L, %L, %L, %L)', vl1, vl2, nv1, nv2))]];
  r := r || array[array['admin borra cierres', 'permitido', pg_temp.intentar(
    format('delete from public.cierres where dia = %L', f))]];

  -- ===== Limpieza final (como postgres) =====
  perform set_config('role', 'none', true);
  delete from public.cierres where dia in (f, f + 1);
  delete from public.ventas where dia = f;
  delete from public.productos where nombre in ('__prueba_activo', '__prueba_inactivo');

  return query
    select i, r[i][1], r[i][2], r[i][3],
           case when r[i][2] = r[i][3] then '✅' else '❌' end
    from generate_subscripts(r, 1) as i;
end $$;

select * from pg_temp.probar_rls();
