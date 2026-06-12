# Arquitectura — PNLQ Gestión de Jornadas

Referencia técnica para quien mantenga o extienda el proyecto.
Complementa al `README.md` (orientado a uso) y al `docs/GLOSARIO.md`
(terminología institucional).

> **Regla dura transversal:** la herramienta registra y alerta; no
> genera pagos, suspensiones ni derechos automáticos. Cualquier módulo
> nuevo debe respetar este principio.

---

## Mapa de capas

```
┌─────────────────────────────────────────────────────────┐
│  UI (features/ + layout/ + ui/)        React + Tailwind │
├─────────────────────────────────────────────────────────┤
│  Estado (context/AppContext)        useReducer + Context │
├─────────────────────────────────────────────────────────┤
│  Dominio (domain/)               funciones puras, tests  │
├─────────────────────────────────────────────────────────┤
│  Persistencia (lib/storage + lib/db)   LS caché + Dexie  │
├─────────────────────────────────────────────────────────┤
│  Plataforma (PWA, anti-cache, i18n, a11y, responsive)    │
└─────────────────────────────────────────────────────────┘
```

Regla de dependencia: las capas superiores importan de las inferiores,
nunca al revés. `domain/` no importa React ni storage; `lib/` no
importa features.

## Decisiones de diseño y su porqué

| Decisión | Motivo |
|---|---|
| Navegación por estado (`view`) en vez de router | Una sola página, sin URLs profundas que cachear; simplifica la PWA offline. |
| Snapshot atómico en persistencia (no stores por entidad) | El volumen de datos es pequeño (~decenas de KB); la atomicidad evita estados parciales. Migrable a stores por entidad sin romper la API pública de `storage.js`. |
| Dual-write LS + IndexedDB | LS da lectura síncrona (primer render sin parpadeo); Dexie da durabilidad y capacidad. Si uno falla, el otro respalda. |
| `t()` con clave visible al faltar | Una clave sin traducir aparece como `view.xxx` en pantalla: el bug se ve, no se esconde. |
| Lazy load por vista, Dashboard eager | Dashboard es la pantalla inicial; diferirla solo añade un spinner. |
| Dexie con `import()` dinámico | ~32 KB gzip fuera del bundle inicial; la persistencia durable no necesita estar lista antes del primer render. |
| Reglas de negocio en `config/reglas.js` + UI | Cambios de directriz administrativa (corte de viáticos, puestos con Visit.) no requieren tocar código. |

## Flujo de datos (escritura)

```
acción del usuario
   → setX() del contexto (setPersonas, setRoleData, …)
   → reducer (SET_*) actualiza el estado en memoria
   → useEffect con debounce 500 ms
   → saveState(): localStorage (sync) + Dexie (fire-and-forget)
   → SyncStatus muestra "Guardando…" → "Respaldo HH:mm"
```

## Flujo de datos (arranque)

```
initialState(): loadState() síncrono desde localStorage (o seed)
   → primer render inmediato
   → useEffect: loadStateAsync() desde IndexedDB
       · si IndexedDB vacío + LS con datos → migración idempotente
       · si difiere Y el usuario no editó nada → REPLACE_STATE
       · si el usuario editó durante la hidratación → su edición gana
```

## Offline y actualización

| Mecanismo | Archivo | Comportamiento |
|---|---|---|
| Service worker (Workbox) | `vite.config.js` | `skipWaiting` + `clientsClaim` + `cleanupOutdatedCaches`. HTML `NetworkFirst`, assets `StaleWhileRevalidate`, `version.json` `NetworkOnly`. |
| Heartbeat de versión | `lib/versionCheck.js` | Consulta `/version.json` cada 5 min y al volver el foco/conexión; si difiere, banner de actualización. |
| Estado de respaldo global | `ui/SyncStatus.jsx` | Pill en Topbar: en línea/sin conexión + hora del último respaldo + "Guardando…" durante el debounce. |
| Banner offline | `PWAWrapper.jsx` | "Sin conexión — datos en caché" + fecha de última carga local. |
| Detalle completo | `features/datos/Datos.jsx` | Backend activo, migración, pendientes de sync, export/import/reset. |

## Responsive / móvil

Detección: `lib/responsive.js` (`useIsMobile` = `max-width: 1023px`,
alineado con el breakpoint `lg` de Tailwind).

| Vista | Escritorio | Móvil (auto) |
|---|---|---|
| Funcionarios | Tabla (overflow-x) | Tarjetas |
| Roles | Tabla mensual (overflow-x) | Tarjetas por semana |
| Planificación | Cuadrícula 7 col (toggle a Agenda) | Agenda vertical por día + alta rápida `+` (toggle a cuadrícula con scroll-x) |
| Dashboard (cobertura) | Grilla 7 col, etiquetas completas | Mini-calendario semafórico (día+color) + panel del día tocado + swipe ←/→ entre puestos (<1024 px); mismo modal de detalle |
| Detalle del día | Botones | Botones + swipe (`lib/useSwipe.js`) |
| Modales de formulario | Secciones tituladas a 2 col | Mismas secciones a 1 col; campos y botones `min-h-touch` |
| Navegación | Sidebar | BottomNav + menú "Más" |

Reglas para nuevas vistas:
1. Tamaño táctil mínimo `min-h-touch` (48 px) en todo elemento
   interactivo, **incluido el botón ✕ de cierre** (usar
   `min-h-touch min-w-touch`, nunca `h-touch`/`w-touch`: esas
   utilidades no existen en la config).
2. Nada de ancho fijo sin un ancestro `overflow-x-auto`.
3. **Hojas/modales**: contenedor `flex flex-col max-h-[92vh]`, cuerpo
   `flex-1 overflow-y-auto`, footer fijo fuera del scroll. Padding
   inferior con `pb-[max(1rem,env(safe-area-inset-bottom))]` para
   librar el home indicator.
4. **Elementos `fixed` al borde inferior** (BottomNav, banners):
   añadir `env(safe-area-inset-bottom)` y, si solapan la nav,
   elevarse con `bottom-[calc(5rem+env(safe-area-inset-bottom))]`
   en `<lg`.
5. No duplicar la navegación de periodo de la Topbar dentro de una
   vista que ya esté en `VISTAS_CON_PERIODO`.
3. Cuando una grilla no aporta en pantalla angosta, ofrecer una
   representación apilada (lista/agenda) con la **misma** información
   y, si aplica, toggle para volver a la grilla — nunca eliminar
   datos; abreviar (`sm:hidden` / `hidden sm:inline`) es el último
   recurso.

## Convenciones de código

- **Idioma**: identificadores y comentarios en español (terminología
  institucional); claves i18n en notación punteada.
- **Comentarios**: solo para explicar restricciones que el código no
  muestra (por qué, no qué). Cabecera JSDoc en módulos de `lib/` y
  `domain/`.
- **Pesos tipográficos**: `font-semibold` máximo para números y
  títulos; `font-medium` para etiquetas; `font-bold` reservado a
  advertencias. `font-black` está prohibido (ruido visual).
- **Strings UI**: siempre vía `t()`; nunca literales en JSX.
- **Tests**: dominio puro en `domain/__tests__`, infraestructura en
  `lib/__tests__`, integración UI con RTL junto al feature.

## Inventario de protección

Los 30 indicadores de `PROMPT_REVISION.md` §7 son un contrato de no
regresión: pueden cambiar de forma, nunca desaparecer. Todo PR debe
declararlo en su descripción.
