# PNLQ — Gestión de Jornadas Laborales

[![CI · tests + build](https://github.com/psforestal-rgb/BTMM_JORNADAS/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/psforestal-rgb/BTMM_JORNADAS/actions/workflows/ci.yml)
[![Deploy](https://github.com/psforestal-rgb/BTMM_JORNADAS/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/psforestal-rgb/BTMM_JORNADAS/actions/workflows/deploy.yml)

Aplicación web (PWA instalable, con soporte offline) para planificar,
visualizar, controlar y alertar sobre jornadas laborales, cobertura
operativa y actividades del personal del **Parque Nacional Los
Quetzales (PNLQ)** — Bloque Tapantí · Macizo de la Muerte (BTMM),
SINAC · Área de Conservación Central · Costa Rica.

> **Regla dura:** la herramienta **registra y alerta**; **no** ejecuta
> pagos, suspensiones, reposiciones ni derechos automáticos.

---

## Stack

- React 18 + Vite 6 (sin enrutador externo; navegación por estado).
- Tailwind CSS 3 con tokens semánticos (claro / oscuro / alto contraste).
- `lucide-react` para iconografía SVG accesible.
- PWA con `vite-plugin-pwa` + Workbox + `workbox-window`.
- Idioma: español (es-CR).
- Vitest 2 para pruebas unitarias de dominio.

---

## Scripts

```bash
npm install         # instala dependencias
npm run dev         # servidor de desarrollo (Vite)
npm run build       # build de producción + service worker + version.json
npm run preview     # previsualiza el build
npm test            # ejecuta la suite de Vitest (dominio)
npm run test:watch  # Vitest en watch mode
```

---

## Estructura del proyecto

Tras el refactor de la Fase 2, el código está organizado por
responsabilidad:

```
src/
├── App.jsx                     # Shell: AppProvider + router por estado
├── main.jsx                    # Entry point, log de versión
├── PWAWrapper.jsx              # Banners install/offline/update + heartbeat
├── index.css                   # Tailwind base
├── lib/                        # Utilidades transversales
│   ├── appVersion.js           # APP_VERSION / BUILD_TIME / COMMIT
│   ├── versionCheck.js         # Heartbeat anti-cache (/version.json)
│   └── a11y.js                 # useModalA11y, useEscapeClose
├── data/                       # Constantes y datos semilla
│   ├── calendario.js           # meses, dias, diasLargos
│   ├── puestos.js              # puestos operativos + opciones
│   ├── opciones.js             # opciones de cargo/condición/modalidad
│   ├── seedFuncionarios.js     # baseFuncionarios (mock)
│   └── seedActividades.js      # baseActividadesPlan (mock)
├── domain/                     # Funciones puras (testables aisladamente)
│   ├── fechas.js               # dim, isoFecha, fecha, faltan, primerDiaLaboral
│   ├── roles.js                # rolKey, parseModalidad, generarValorPatron,
│   │                           # esRolActivo, renumerarFila, codigoRolFuncionario...
│   ├── actividades.js          # actividadesEnDia, esAtencionRutinaria
│   ├── cobertura.js            # puestoRequiereAtencionRutinaria
│   ├── conflictos.js           # conflictosActividadDia, actividadTieneConflictoMes
│   ├── alertas.js              # alertas() — alertas administrativas y normativas
│   └── __tests__/              # 36 tests Vitest sobre las funciones de dominio
├── ui/                         # Componentes presentacionales reutilizables
│   ├── Badge.jsx
│   ├── Avatar.jsx
│   ├── Card.jsx
│   ├── AlertItem.jsx
│   ├── AlertStrip.jsx
│   ├── Icon.jsx                # wrapper de lucide-react con mapping de emojis
│   ├── EmptyState.jsx          # estado vacío con icono + CTA
│   ├── Modal.jsx               # modal accesible (ARIA + focus trap + Esc)
│   ├── ThemeToggle.jsx         # toggle claro / oscuro / alto contraste
│   └── styles.js               # codigoCls, estadoCls, avatar, iniciales
├── layout/                     # Chrome global
│   ├── Sidebar.jsx             # Navegación lateral + footer con versión
│   ├── Topbar.jsx              # Cabecera sticky + navegación mes/año
│   └── BottomNav.jsx           # Navegación inferior (móvil)
├── context/
│   ├── AppContext.jsx          # useReducer + Context, setters compatibles
│   └── ThemeContext.jsx        # light / dark / hc, persistido en localStorage
└── features/                   # Vistas (una por pantalla del sistema)
    ├── dashboard/
    │   ├── Dashboard.jsx
    │   └── CoberturaDetalleModal.jsx
    ├── dia/DashboardDia.jsx
    ├── funcionarios/
    │   ├── Funcionarios.jsx
    │   └── ModalFuncionario.jsx
    ├── roles/
    │   ├── Roles.jsx
    │   ├── PuestoRolCard.jsx
    │   ├── RoleCell.jsx
    │   ├── MenuCelda.jsx
    │   ├── ConflictoModal.jsx
    │   └── ActividadesDiaModal.jsx
    ├── planificacion/Planificacion.jsx
    ├── planFuncionario/
    │   ├── PlanificacionFuncionario.jsx
    │   ├── ModificarRolModal.jsx
    │   └── AsignarActividadModal.jsx
    ├── viaticos/AdelantoViaticos.jsx
    ├── disponibilidad/Disponibilidad.jsx
    ├── alertas/Alertas.jsx
    └── actividades/ModalActividad.jsx     # compartido entre features
```

---

## Vistas

| Vista | Ruta interna | Responsabilidad |
|-------|---|---|
| Dashboard | `dashboard` | KPIs del mes, cobertura por puesto, alertas activas, marco normativo. |
| Detalle del día | `dia` | KPIs y actividades de un día específico. |
| Funcionarios | `funcionarios` | CRUD del personal con filtros y búsqueda. |
| Roles | `roles` | Tabla mensual T/L/V/I/O por funcionario. |
| Planificación general | `planificacion` | Calendario mensual de actividades (cuadrícula o agenda). |
| Planificación/Funcionario | `planFuncionario` | Vista por persona con sus días/actividades. |
| Adelanto de viáticos | `adelantos` | Listado del mes siguiente con corte día 15. |
| Disponibilidad | `disponibilidad` | Control de contratos y vencimientos. |
| Alertas | `alertas` | Listado completo + semáforo normativo. |

---

## Modelo de roles (códigos diarios)

Cada día de cada funcionario se etiqueta con uno de:

- **T1, T2, …** Turno (activo).
- **L1, L2, …** Libre.
- **V1, V2, …** Vacaciones.
- **I1, I2, …** Incapacidad.
- **O1, O2, …** Otro.

El número consecutivo se recalcula automáticamente al editar una
celda, respetando la **modalidad** del funcionario:

| Modalidad | Trabajo | Libre |
|---|---|---|
| Horario administrativo L-V | 5 | 2 |
| 10x5 | 10 | 5 |
| 12x6 | 12 | 6 |
| 14x7 | 14 | 7 |
| 16x8 | 16 | 8 |
| 20x10 | 20 | 10 |

---

## Tema visual (Fase 3)

La aplicación soporta tres temas, persistidos en `localStorage` con la
clave `pnlq:theme`:

| Tema | Cuándo usar | Contraste |
|---|---|---|
| `light` | Escritorio / oficina (default) | WCAG AA |
| `dark` | Uso nocturno / pantalla con poca luz | WCAG AA |
| `hc` | Campo bajo sol / accesibilidad reforzada | WCAG AAA, bordes de 2 px |

El toggle vive en la barra superior (Topbar) y cicla entre los tres
modos. Los tokens semánticos (`critical`, `warning`, `ok`, `info`,
`viatico`, `surface`, `ink`, `line`, ...) se exponen como utilidades
Tailwind (`bg-critical`, `text-warning-fg`, etc.).

## Iconografía (Fase 3)

La aplicación usa `lucide-react` a través del componente `Icon`, que
acepta tanto un emoji literal (mapeado al ícono correspondiente) como
un alias por nombre. Cada icono que sea funcional debe llevar `label`
(se anuncia a lectores de pantalla); los decorativos quedan
`aria-hidden`.

## CI / despliegue automático

Workflows en `.github/workflows/`:

| Workflow | Disparador | Qué hace |
|---|---|---|
| **`ci.yml`** · CI · tests + build | `pull_request` a `main`, `push` a `main`, manual | Corre `npm test` (143 tests). Si pasa, ejecuta `npm run build` con `GIT_SHA` real. Sube `dist/` como artefacto por 3 días. |
| **`deploy.yml`** · GitHub Pages | `workflow_run` de CI exitoso sobre `main`, manual | Solo despliega si CI terminó OK. Genera build con `GIT_SHA` real para `version.json` (mecanismo anti-cache Fase 1). |
| **`lighthouse.yml`** · Auditoría | `pull_request` cuando cambian `src/`, `index.html`, `vite.config.js`, etc., manual | Corre Lighthouse CI sobre el build de producción. Asserts mínimos: a11y ≥ 90 (error), perf/SEO/best-practices ≥ 85 (warn). Resumen del puntaje en el summary del PR + reporte completo subido a almacenamiento temporal. |

### Lighthouse — configuración

Archivo `lighthouserc.json` define los thresholds y excepciones:

- **A11y ≥ 90** como _error_ — bloquea si baja. Es la métrica más
  crítica para una herramienta usada en campo.
- Performance / SEO / Best-Practices ≥ 85 como _warning_.
- PWA category excluida (`preset: lighthouse:no-pwa`) porque el
  preset de PWA está deprecado en Lighthouse 12.
- Excepciones activas: `color-contrast` (los tokens semánticos ya
  garantizan AA), `unused-javascript`/`-css-rules` (Tailwind purga
  pero deja residual normal), `is-on-https` (test corre local).

Resultado: ningún merge a `main` queda con tests rojos, ningún
despliegue a producción sucede si el build falla.

## Tests, i18n y documentación (Fase 8)

### Pruebas automatizadas
**126/126 verde** en ~3 s, organizados en 15 archivos:
- 97 tests sobre dominio puro (`src/domain/*`, `src/config/*`).
- 26 tests sobre infraestructura (storage, a11y stack de Esc, i18n).
- 12 tests de integración UI con React Testing Library
  (`EmptyState`, `Funcionarios`).

Scripts:
```bash
npm test              # corre todo
npm run test:watch    # vitest en watch mode
```

Detalle por carpeta en `docs/TESTING.md`. Plan de E2E con
Playwright también documentado allí (instalación diferida hasta
release oficial).

### Internacionalización completa (es-CR)
- Diccionario en `src/i18n/es-CR.js` con notación punteada
  (`dashboard.bloqueHoy`), valores escalares + arreglos (para
  listas) + plantillas `{nombre}` interpoladas.
- Helper puro `t(path, vars)` usable dentro y fuera de React.
- Hook `useT()` para componentes con `useCallback` memoizado.
- Helper `plural(n)` para concordancia simple (s / sin sufijo).
- **Migración 100 %** de cadenas visibles: layout (Sidebar,
  BottomNav, Topbar, ThemeToggle), banners PWA (Install, Offline,
  Update), AlertStrip + AlertItem, Modal wrapper, las 11 vistas
  (Dashboard, Detalle del día, Funcionarios, Roles, Planificación,
  Plan/Funcionario, Viáticos, Disponibilidad, Alertas, Datos,
  Configuración) y los 8 modales (ModalActividad, ModalFuncionario,
  MenuCelda, ConflictoModal, ActividadesDiaModal,
  CoberturaDetalleModal, ModificarRolModal, AsignarActividadModal).
- Si una clave falta, se renderiza la propia clave (`view.xxx`)
  como sentinela visible en QA. Tests automatizados de cobertura
  mínima del diccionario en `src/i18n/__tests__/es-CR.test.js`.

### Documentación operativa
- `docs/GLOSARIO.md` — términos institucionales (Visit., Turno,
  INICIO, Conflicto, Jornadas, Modalidades, Atributos, Viáticos,
  Marco normativo).
- `docs/MANUAL.md` — manual breve por perfil (guardaparques,
  administración, jefatura). Apto para impresión a una cara.
- `docs/TESTING.md` — estructura de tests, cobertura por
  indicador, plan E2E.

## Rendimiento (Fase 7)

- **Lazy loading por feature** — `React.lazy` + `Suspense` envuelven
  cada vista no-default. La carga inicial baja ~22 % (gzip ~71 KB
  vs ~91 KB antes) y cada feature se descarga solo cuando el
  usuario la abre.
- **Memoización en Dashboard** — un `useMemo` precomputa el cache
  de cobertura por (puesto × día) en una sola pasada (vs N×M
  iteraciones ad-hoc por render). Los KPIs `diasSinVisit`,
  `sinActividadHoy`, `porVencer`, `totalActivos` y los resúmenes
  por puesto se derivan de ese cache con `useMemo` propios.
- **`React.memo(RoleCell)`** — comparación shallow personalizada
  que ignora la identidad de `onOpen`/`onConflicto`. Resultado:
  ~3 puestos × 16 funcionarios × 31 días = ~1500 celdas que dejan
  de re-renderizarse al cambiar otro estado (p. ej. abrir un modal).
- `prefers-reduced-motion` ya se respetaba; la animación pulsante
  de conflicto usa la clase `pnlq-pulse` que es no-op si el usuario
  lo solicita.

## Impresión / Guardar como PDF

La vista **Roles** incluye un botón "Imprimir / Guardar PDF" que abre
el diálogo de impresión del navegador. Desde ahí cualquier navegador
moderno (Chrome, Firefox, Safari, Edge) permite **"Guardar como PDF"**
sin instalar nada adicional.

El documento impreso incluye:

- Encabezado institucional (SINAC · ACC · PNLQ · BTMM).
- Título "ROL MENSUAL DE TRABAJO" + período + puesto operativo.
- Tabla mensual con códigos T/L/V/I/O por funcionario y día.
- Fila "Cantidad en turno" por día.
- Leyenda de códigos.
- Tres espacios para firmas: Administrador(a) de ASP, Coordinación
  administrativa ACC, Jefatura BTMM.
- Línea para lugar y fecha.
- Pie con versión, fecha de impresión y recordatorio normativo.

Diseño:

- Tamaño A4 horizontal (landscape) con márgenes de 1.2 cm — necesario
  para que entren los 31 días en una sola hoja.
- Un puesto por hoja (corte automático con `page-break-before`).
- En impresión se ocultan: sidebar, topbar, bottomnav, banners PWA,
  candados de edición, botones de acción. Solo queda el documento
  administrativo.

Cero dependencias nuevas: implementado con CSS `@media print`. No
añade peso al bundle.

## Reglas configurables (Fase 6)

Las reglas duras que antes vivían en código ahora se editan desde la
vista **Configuración** (sidebar grupo "Control"):

- **Cobertura · puestos con Visit. diario** — toggle por puesto
  operativo. Por defecto Orosi y Quetzales. Si un día un puesto
  marcado no tiene a nadie asignado a "Atención rutinaria de
  visitantes", el Dashboard lo marca como **cobertura crítica** (rojo).
- **Viáticos** — día de corte administrativo (1–28), mes objetivo
  (`siguiente` o `actual`), permitir consulta tras cierre (boolean).
- **Feriados oficiales CR** — toggle que excluye feriados del cálculo
  del primer día laboral del mes (afecta INICIO de la rotación T/L).
  Lista cargada desde `src/data/feriadosCR.js` con base en
  comunicados del MTSS para 2025/2026/2027.
- **Alertas adicionales** — checkboxes para activar/desactivar
  individualmente: persona inactiva con actividad futura,
  incapacitado con actividad futura, acumulativa sin modalidad.

Los cambios requieren confirmación explícita ("Aplicar cambios → Confirmar").
El botón "Restaurar valores predeterminados" devuelve al estado de fábrica.

Alertas ampliadas en Fase 6:

| Alerta | Tono | Disparador |
|---|---|---|
| Disponibilidad vence HOY | 🚨 danger | `faltan(vencimiento) === 0` |
| Inactivo con actividad futura | ⚠️ warn | `estado === "Inactivo"` + actividad ≥ hoy |
| Incapacitado con actividad futura | 🩺 danger | `estado === "Incapacitado"` + actividad ≥ hoy |
| Acumulativa sin modalidad | 📄 warn | `jornada === "Acumulativa"` + `!modalidad` |

## Persistencia local (Fase 5 · Paso 1)

A partir de v1.11.0 la persistencia es **dual**:

- **localStorage** sigue siendo el caché síncrono que arranca la app sin
  esperar a IndexedDB.
- **IndexedDB con Dexie** (`src/lib/db.js`) es el almacenamiento durable
  primario: capacidad amplia, almacenamiento asíncrono, queries por
  índice y stores adicionales para auditoría y cola de pendientes.

Estrategia:

1. `loadState()` síncrono lee de localStorage → primer render inmediato.
2. Tras montar, `loadStateAsync()` lee de IndexedDB y, si difiere,
   despacha `REPLACE_STATE` para reconciliar.
3. `saveState()` escribe a **ambos** backends (localStorage instantáneo
   + Dexie `fire-and-forget`).
4. La primera vez que se ejecuta, `migrateFromLocalStorageIfNeeded()`
   copia el snapshot existente a IndexedDB de forma idempotente.

### Optimización de bundle
Dexie se carga **dinámicamente** (`import("dexie")`) la primera vez que
algún consumidor pide la base. Resultado: chunk separado de ~32 KB gzip
que no afecta el arranque inicial (~79 KB gzip).

### Cola de cambios pendientes
El store `pendientes` (Dexie) está preparado para Fase 5 paso 2: cuando
exista la API REST del SINAC, los cambios offline se registrarán aquí y
se sincronizarán al reconectar. Hoy el contador siempre es 0.

### Vista "Datos · respaldo"
Ahora muestra el backend activo (badge **IndexedDB ✓** / **localStorage**
/ **Sin durable**), si hubo migración automática desde localStorage y el
contador de cambios pendientes de sincronizar.

## Persistencia local (Fase 5 · Paso 0)

La aplicación guarda automáticamente el estado en `localStorage` con
debounce de 500 ms tras cada cambio:

- **Clave**: `pnlq:state` (más `pnlq:lastSavedAt` con la marca temporal).
- **Esquema versionado**: el snapshot lleva `schemaVersion`; si la
  versión persistida no coincide con la actual, la app crea un backup
  automático (`pnlq:backup:vN-<timestamp>`) y descarta el estado
  obsoleto en lugar de leer estructuras incompatibles.
- **Campos persistidos**: `personas`, `actividadesPlan`, `roleData`.
- **No se persisten** datos efímeros de UI (`view`, `compact`,
  `diaVista`, `month`, `year`).

La vista **Datos · respaldo** (sidebar grupo "Control") expone:

- Estado de la copia local (última fecha guardada, cambios pendientes
  durante el debounce, versión del esquema).
- Conteo de funcionarios, actividades y celdas de rol con override.
- **Exportar JSON** — descarga `pnlq-snapshot-<timestamp>.json` con
  metadatos (unidad, área, fecha de exportación).
- **Importar JSON** — valida `schemaVersion`, rechaza versiones
  incompatibles con mensaje claro.
- **Reiniciar a datos semilla** — modal de confirmación con
  recomendación de exportar antes.

> La copia local **no sustituye** al backend institucional. Fase
> siguiente prevé migrar a IndexedDB (Dexie) con cola de cambios
> preparada para sincronización con el sistema central del SINAC.

## Ergonomía móvil (Fase 4 + mejoras móviles)

Vistas alternas optimizadas para uso en campo, sin remover
ninguna funcionalidad de escritorio:

- **Funcionarios** — toggle "Tabla / Tarjetas". Default automático
  por viewport (`< 1024 px` → tarjetas). `FuncionarioCard` reproduce
  toda la información de la fila: avatar, cargo, puesto operativo,
  condición, jornada/modalidad, "🔵 Sin resolución", disponibilidad
  + vencimiento, atributos (Policía/Brigada/ONG), estado y acciones.
- **Roles** — toggle "Tabla mensual / Por semana". La vista por
  semana muestra una tarjeta por funcionario con 7 botones de día
  ≥ 48 px, conservando: códigos T/L/V/I/O, anillo verde "INICIO",
  anillo rojo de conflicto, candado de edición + modalidad/Aplicar
  patrón, modales `MenuCelda` / `ConflictoModal` /
  `ActividadesDiaModal`. La fila "CANTIDAD EN TURNO" se reubica
  como **tarjeta resumen al final de la semana**.
- **Detalle del día** — swipe horizontal (← →) entre días en
  dispositivos táctiles. Los botones Anterior/Siguiente y el
  selector de fecha siguen siendo la ruta principal (a11y).
- **Planificación** — toggle "Agenda / Cuadrícula". Default
  automático por viewport (`< 1024 px` → agenda). La agenda lista
  cada día con sus actividades (mismos colores de viático y
  conflicto de rol), conteo 👥 en turno y alta rápida `+` con la
  fecha del día prellenada. La cuadrícula de 7 columnas sigue
  íntegra y es el default de escritorio.
- **Dashboard (cobertura)** — bajo 1024 px la grilla de 7 columnas
  se presenta como mini-calendario semafórico (patrón "mes + agenda"
  de Google Calendar/Outlook móvil): celdas día+color que sí caben
  en 360 px, panel con Turno/Plan/Visit. del día tocado debajo,
  botón al mismo modal de detalle de siempre, y deslizar ←/→ rota
  entre puestos operativos.
- **Modales de formulario** — `ModalFuncionario` agrupa sus campos
  en cinco secciones tituladas (Identificación, Puesto y condición,
  Jornada y modalidad, Contratación y fechas, Atributos); campos y
  botones cumplen el mínimo táctil de 48 px. La Topbar agrupa
  ‹ mes año › en un único control segmentado.

Toda nueva vista respeta la condición rectora: ningún indicador,
alerta o registro de las anteriores se pierde — solo cambia de
representación.

## Accesibilidad (Fase 3)

- **Modales**: ARIA `role="dialog"` + `aria-modal="true"` +
  `aria-labelledby`. Cierre por Esc + clic en backdrop + botón ✕
  visible. El componente `Modal` añade además trampa de foco y
  restauración al disparador.
- **Foco visible**: anillo de alto contraste en todos los elementos
  interactivos vía `:focus-visible`.
- **Tamaño táctil mínimo**: `min-h-touch` (48 px) en BottomNav,
  Sidebar nav items, RoleCell (modo amplio), botones de cierre de
  modal y CTAs principales.
- **Movimiento reducido**: respeta `prefers-reduced-motion`.

## Mecanismo anti-cache (Fase 1)

El sistema garantiza que ningún usuario quede con secciones
desactualizadas tras un deploy, mediante defensa en profundidad:

1. **Workbox**: `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches`.
2. **NetworkFirst** para `document` (HTML), **NetworkOnly** para
   `/version.json`, **StaleWhileRevalidate** para assets versionados.
3. **Meta tags** `Cache-Control: no-cache` en `index.html`.
4. **`/version.json`** generado en build con `{ version, buildTime, commit }`.
5. **Heartbeat** que consulta `/version.json` cada 5 minutos y en
   `visibilitychange` / `online`; si la versión remota difiere,
   muestra banner urgente.
6. **`useRegisterSW`** dispara banner verde cuando el SW detecta
   refresh necesario; auto-actualización al pulsar "Actualizar
   ahora".
7. **Versión visible** en el sidebar (`v1.2.0 · <commit> · build
   DD/MM/YYYY HH:mm`).

---

## Indicadores preservados

La condición rectora del proyecto es que ningún indicador, alerta,
registro o funcionalidad existente se pierda. La lista de 30
indicadores que el sistema garantiza se documenta en
`PROMPT_REVISION.md` (sección 7). Cualquier refactor o rediseño
debe acompañarse de un checklist explícito de los 30.

---

## Indicador global de respaldo (SyncStatus)

La barra superior muestra en todo momento un indicador compacto con:

- **Punto de estado**: verde (en línea), ámbar (sin conexión),
  azul pulsante (guardando).
- **Hora del último respaldo local** ("Respaldo HH:mm").
- "Guardando…" mientras hay cambios en la cola de debounce.

En móvil se compacta a punto + hora; el detalle completo (backend
activo, migraciones, export/import) vive en **Datos · respaldo**.
Este indicador evoluciona al antiguo "Activo" estático de la Topbar
(indicador #28): conserva el punto verde pero ahora transmite
información real.

## Documentación complementaria

- `PROMPT_REVISION.md` — prompt de revisión integral con los 30
  indicadores obligatorios.
- `PLAN_IMPLEMENTACION.md` — plan por fases (8 fases, 10 semanas
  estimadas).
- `docs/ARQUITECTURA.md` — mapa de capas, decisiones de diseño,
  flujos de datos, reglas responsive y convenciones de código.
- `docs/GLOSARIO.md` — terminología institucional.
- `docs/MANUAL.md` — manual por perfil de usuario.
- `docs/TESTING.md` — estructura de pruebas y plan E2E.

---

## Marco normativo

El sistema referencia, sin ejecutar automáticamente:

- Dec. 28409-MINAE · Dec. 34885-MINAET · Dec. 40452-MINAE.
- Código de Trabajo arts. 135-144.
- Ley 8968 (protección de datos) · Ley 7575 (forestal) ·
  Ley 6084 (parques nacionales).
- LGAP · Ley 8292 (control interno).
