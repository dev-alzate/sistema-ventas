# Sistema de ventas (POS) — contexto del proyecto

Responde siempre en español. El desarrollador es ingeniero informático y quiere hacer el trabajo él mismo con tu guía: explica cada paso, dile qué archivos crear o modificar y por qué, y avanza un paso a la vez. Si te pide que escribas el código directamente, hazlo.

## Qué es
App web de punto de venta para registrar ventas en efectivo en dos locales. Instalable en el computador como PWA. Uso interno: sin facturación electrónica, sin nombre de empresa en la app ni en los recibos.

## Roles
- **admin**: ve las ventas y los cierres de cada local por separado, hace el cuadre, exporta a Excel, borra el historial y gestiona productos (crear, editar, desactivar e importar desde Excel).
- **local1** y **local2**: solo venden (carrito → cobro → recibo) y hacen el cierre de caja de su local.

## Decisiones cerradas
- Pago: **solo efectivo**. El carrito pide "efectivo recibido" y calcula el cambio.
- **Sin control de inventario**: los productos siempre están disponibles.
- Recibo PDF en formato tirilla de 80mm, sin datos de empresa: n.º de venta, fecha y hora, local, productos (cantidad × precio), total, efectivo recibido y cambio. Más adelante se enviará a una impresora térmica.
- **Funciona sin internet**: cada venta se guarda primero en el equipo (IndexedDB) y se sincroniza con Supabase cuando hay conexión.
- **Cierre de caja con botón** (no automático por hora): sube las ventas pendientes, cierra el día de ese local y genera el resumen (número de ventas y total). Si no hay internet, el cierre queda pendiente y se envía al volver la conexión. Si al abrir la app hay un día anterior sin cerrar, se cierra automáticamente antes de vender.
- El admin revisa los cierres al día siguiente, separados por Local 1 y Local 2.
- **Borrar historial** (solo admin): antes de borrar se descarga automáticamente un Excel de respaldo.
- Productos: al principio, productos de prueba ("Producto A", etc.). La importación desde Excel va al final.
- Moneda: pesos colombianos, formato `$12.500`.

## Stack
- React + Vite (JavaScript), Tailwind CSS v4 (`@tailwindcss/vite`), ESLint
- react-router-dom
- Supabase (`@supabase/supabase-js`): Postgres, Auth y RLS
- Dexie.js + dexie-react-hooks: base de datos local y cola de sincronización
- jsPDF: recibos
- vite-plugin-pwa: app instalable y funcionamiento sin conexión
- SheetJS (xlsx): importación y exportación de Excel (se instala más adelante)
- Hosting: Vercel. Repositorio en GitHub.

## Detalles técnicos
- Cada venta lleva un UUID generado en el cliente, para que la sincronización sea idempotente (sin duplicados).
- Cola de sincronización con estados `pendiente` / `enviada` / `fallida`. Se procesa con el evento `online`, al iniciar la app y al pulsar el cierre de caja.
- RLS: cada local solo puede insertar y leer sus propias ventas y cierres; el admin puede leer todo y borrar.
- Variables de entorno en `.env.local` (Vite la ignora en git): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (clave publishable `sb_publishable_…`; las claves anon legacy se retiran en 2027). Nunca usar la `sb_secret_…` en el frontend.

## Flujo de Git
- `main`: versión estable. `develop`: integración; es la rama que se despliega en Vercel.
- Cada tarea en su rama, creada desde `develop`: `feature/…` (funcionalidad), `fix/…` (corrección), `docs/…`, `chore/…`. Ejemplo: `feature/paso-5-recibo`.
- Al terminar: comprobar que cada commit compila, unir a `develop` con `git merge --no-ff` y hacer push de `develop`. Borrar la rama local.
- `develop` se une a `main` solo cuando el usuario lo pide.
- Commits con Conventional Commits en español: `tipo(scope): descripción en imperativo` (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`), un commit por cambio lógico.

## Estructura de `src/`
```
components/   piezas reutilizables (botones, tarjetas, carrito)
pages/
  Login.jsx
  local/      POS y cierre de caja
  admin/      ventas y productos
lib/
  supabase.js conexión a Supabase
  db.js       base de datos local (Dexie)
hooks/        lógica reutilizable (carrito, sincronización)
utils/        formato de moneda, generar PDF
```

## Diseño
Tonos claros de azul y blanco, estilo de software de facturación tradicional, nada futurista.
- Fondo #F5F9FC · tarjetas #FFFFFF · azul principal #2F80C1 · azul claro #E3F0FA
- Texto #1F2D3D / secundario #627184 · bordes #DCE6EF · verde para cobrar #2E9E6A · rojo para eliminar #D9534F
- Tipografía Inter (Roboto Mono en el recibo), instaladas con @fontsource para que funcionen sin internet; esquinas de 6-8px; botones grandes.
- **Diseño de referencia** (exportado de Claude Design): `docs/diseno/1-login.html` … `6-admin-productos.html`. Es solo referencia visual: estilos en línea y datos falsos; no se importa en la app.
- **Tokens** en `src/index.css` (`@theme`): usar las clases del tema (`bg-primario`, `text-texto-sec`, `bg-exito-fondo`, `shadow-tarjeta`…), no colores hex sueltos.
- **Componentes base** en `src/components/`: `Boton` (primario, cobrar, peligro, contorno, neutro; sm/md/lg/xl), `Campo`, `Tarjeta`, `Insignia`, `Iconos`. Formato de moneda: `formatearPesos()` en `src/utils/formato.js`.
- N.º de venta en pantalla y recibo: `L{local}-{numero con 6 dígitos}`, p. ej. `L1-000124`.

Pantallas: Login · Punto de venta (productos 65% / carrito 35%, indicador de conexión, botón de cierre de caja) · Vista previa del recibo · Cierre de caja · Admin: ventas (pestañas Local 1 / Local 2, resumen, filtro por fecha, tabla con detalle, exportar y borrar) · Admin: productos (tabla, agregar/editar, importar Excel).

## Plan de desarrollo
1. [x] Entorno: cuentas, proyecto Vite, dependencias, Tailwind, carpetas, GitHub, proyecto en Supabase
2. [x] Base de datos y usuarios en Supabase: tablas (perfiles con rol, productos, ventas, venta_items, cierres), 3 usuarios y políticas RLS
   - [x] 2.1 Tablas (`supabase/01_tablas.sql`)
   - [x] 2.2 Usuarios: registro público desactivado, 3 usuarios en Authentication y `supabase/02_perfiles.sql`
   - [x] 2.3 Políticas RLS: `supabase/03_rls.sql` (funciones `privado.es_admin()` y `privado.mi_local()`)
   - [x] 2.4 Verificado con `supabase/04_pruebas_rls.sql` (27 pruebas, todas ✅)
3. [x] Login y redirección por rol
   - [x] Tema y componentes base a partir de `docs/diseno/`
   - [x] Sesión y perfil (`ProveedorAuth`, `useAuth`, `lib/auth.js`; el perfil se guarda en el equipo para abrir sin internet)
   - [x] Login con usuario (`local1` → `local1@sistema-ventas.local`), rutas `/login`, `/local`, `/admin` protegidas por rol
   - [x] Probado con los 3 usuarios reales
4. [x] Punto de venta: productos de prueba, carrito y cobro
   - [x] `supabase/05_productos_prueba.sql` (12 productos del diseño)
   - [x] Pantalla según `docs/diseno/2-punto-de-venta.html`: buscador, cuadrícula, carrito, efectivo, cambio/falta, botones rápidos, reloj y estado de conexión
   - [x] `crearVenta()` arma la venta con UUID y las columnas de la base; la confirmación del cobro es provisional (se reemplaza por el recibo en el paso 5)
   - [x] `05_productos_prueba.sql` ejecutado y probado con los locales
   - Pendiente para el paso 6: número de venta, guardar en Dexie y sincronizar (hoy la venta cobrada no se guarda)
5. [ ] Recibo PDF
6. [ ] Guardado sin internet y sincronización
7. [ ] Cierre de caja
8. [ ] Panel del admin: ventas, cuadre, exportar y borrar
9. [ ] Gestión de productos e importación de Excel
10. [ ] PWA instalable, impresora térmica y publicación en Vercel
