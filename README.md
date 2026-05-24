# PNLQ — Gestión de Jornadas Laborales

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
- Tailwind CSS 3.
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
│   └── versionCheck.js         # Heartbeat anti-cache (/version.json)
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
│   └── styles.js               # codigoCls, estadoCls, avatar, iniciales
├── layout/                     # Chrome global
│   ├── Sidebar.jsx             # Navegación lateral + footer con versión
│   ├── Topbar.jsx              # Cabecera sticky + navegación mes/año
│   └── BottomNav.jsx           # Navegación inferior (móvil)
├── context/
│   └── AppContext.jsx          # useReducer + Context, setters compatibles
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
| Planificación general | `planificacion` | Calendario mensual de actividades. |
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

## Documentación complementaria

- `PROMPT_REVISION.md` — prompt de revisión integral con los 30
  indicadores obligatorios.
- `PLAN_IMPLEMENTACION.md` — plan por fases (8 fases, 10 semanas
  estimadas).

---

## Marco normativo

El sistema referencia, sin ejecutar automáticamente:

- Dec. 28409-MINAE · Dec. 34885-MINAET · Dec. 40452-MINAE.
- Código de Trabajo arts. 135-144.
- Ley 8968 (protección de datos) · Ley 7575 (forestal) ·
  Ley 6084 (parques nacionales).
- LGAP · Ley 8292 (control interno).
