-- =========================================================
-- 01_tablas.sql — Esquema del sistema de ventas
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- =========================================================

-- 1. PERFILES: una fila por usuario de Auth, con su rol
create table public.perfiles (
  id        uuid primary key references auth.users (id) on delete cascade,
  nombre    text not null,
  rol       text not null check (rol in ('admin', 'local1', 'local2')),
  -- número de local derivado del rol (null para admin)
  local     smallint generated always as (
              case rol when 'local1' then 1 when 'local2' then 2 end
            ) stored,
  creado_en timestamptz not null default now()
);

-- 2. PRODUCTOS
create table public.productos (
  id        bigint generated always as identity primary key,
  codigo    text unique,                               -- opcional, para importar desde Excel
  nombre    text not null,
  precio    integer not null check (precio >= 0),      -- pesos, sin centavos
  activo    boolean not null default true,
  creado_en timestamptz not null default now()
);

-- 3. VENTAS (el id lo genera el navegador → sincronización sin duplicados)
create table public.ventas (
  id                uuid primary key,
  local             smallint not null check (local in (1, 2)),
  numero            integer not null check (numero > 0),
  dia               date not null,                     -- día de operación (hora Colombia)
  creada_en         timestamptz not null,              -- momento real de la venta
  total             integer not null check (total >= 0),
  efectivo_recibido integer not null,
  cambio            integer not null,
  vendedor_id       uuid not null default auth.uid() references public.perfiles (id),
  sincronizada_en   timestamptz not null default now(),
  check (efectivo_recibido >= total),
  check (cambio = efectivo_recibido - total)
);

create index ventas_local_dia_idx on public.ventas (local, dia);

-- 4. VENTA_ITEMS (líneas de cada venta)
create table public.venta_items (
  id              uuid primary key,
  venta_id        uuid not null references public.ventas (id) on delete cascade,
  producto_id     bigint references public.productos (id) on delete set null,
  nombre          text not null,                       -- copia del nombre al momento de vender
  precio_unitario integer not null check (precio_unitario >= 0),
  cantidad        integer not null check (cantidad > 0),
  subtotal        integer generated always as (precio_unitario * cantidad) stored
);

create index venta_items_venta_idx on public.venta_items (venta_id);

-- 5. CIERRES DE CAJA
create table public.cierres (
  id          uuid primary key,
  local       smallint not null check (local in (1, 2)),
  dia         date not null,
  num_ventas  integer not null check (num_ventas >= 0),
  total       bigint not null check (total >= 0),
  automatico  boolean not null default false,          -- true si se cerró solo al abrir la app
  cerrado_en  timestamptz not null,
  cerrado_por uuid not null default auth.uid() references public.perfiles (id),
  recibido_en timestamptz not null default now(),
  unique (local, dia)                                  -- un cierre por local y por día
);

-- RLS activado desde ya: sin políticas, nadie puede leer ni escribir (seguro por defecto).
-- Las políticas se agregan en el paso 2.3.
alter table public.perfiles    enable row level security;
alter table public.productos   enable row level security;
alter table public.ventas      enable row level security;
alter table public.venta_items enable row level security;
alter table public.cierres     enable row level security;
