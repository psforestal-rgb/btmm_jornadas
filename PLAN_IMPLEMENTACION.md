# PLAN DE IMPLEMENTACIÓN — Mejoras PNLQ Gestión de Jornadas
## Basado en las 4 revisiones del documento `Revisi_nesJORNALES.docx`
### Branch base: `claude/nice-hopper-048go` (PR #6 abierto)

---

## 0. PRINCIPIOS RECTORES

1. **Cero pérdida funcional**: ningún indicador, alerta, registro o flujo de
   los 30 elementos del prompt original puede desaparecer (puede reubicarse,
   reagruparse o cambiar de iconografía, **nunca eliminarse**).
2. **Cambios por partes**: ninguna fase debe mezclar refactor profundo con
   cambios cosméticos en el mismo commit/PR.
3. **Reversibilidad**: cada fase trabaja en su sub-rama; el `main` queda
   intacto hasta merge explícito; siempre existe un tag/rama "baseline"
   al que volver.
4. **Anti-cache desde el día 1**: el primer paso técnico (Fase 1) instala
   el mecanismo de invalidación de cache para que **ningún usuario quede
   con secciones desactualizadas** durante las fases siguientes.
5. **No hacer nada hoy**: este documento es solo el plan; las
   implementaciones empiezan cuando el usuario lo apruebe fase por fase.

---

## 1. SÍNTESIS DE LAS 4 REVISIONES (coincidencias clave)

Las cuatro revisiones convergen en las mismas 8 prioridades altas:

| ID consenso | Tema | Revisiones que lo mencionan |
|---|---|---|
| **A** | Refactor `App.jsx` → features + dominio puro + `useReducer`/Context | R1[ARQ-01,02,03], R2[ARQ-01], R3[ARCH-01,STATE-01], R4[ARQ01,02] |
| **B** | Persistencia offline (localStorage → IndexedDB/Dexie) + export/import | R1[DAT-01,02], R2[DAT-01], R3[OFF-01,DATA-01], R4[DAT01] |
| **C** | Migrar emojis → Lucide SVG + ARIA + contraste WCAG AA | R1[UI-03,A11Y-01,02], R2[UIX-01], R3[UI-02,A11Y-01,02], R4[UI04,A1101,02] |
| **D** | Reorganizar Dashboard "Hoy vs Mes" + tira de alertas arriba | R1[UX-01], R2[mockup §3.1], R3[UX-01], R4[UX01] |
| **E** | Asistente unificado de resolución de conflictos rol-vs-plan | R1[UX-02], R3[UX-02], R4[UX02] |
| **F** | Vista móvil alternativa para Roles (tarjetas por funcionario + semana) sin eliminar la tabla | R1[MOV-01], R2[MOB-01], R3[MOB-01], R4[UI01,MOV01] |
| **G** | Memoización (`useMemo`, `React.memo`) de cálculos pesados | R1[PERF-01], R2[PER-01], R3[PERF-01], R4[PER01] |
| **H** | Parametrizar reglas duras (puestos con Visit. diario, corte día 15, feriados CR) | R1[NEG-01,03,04], R2[LOG-01], R3[BIZ-01,02,03], R4[NEG01,02] |

Otras recomendaciones (media/baja prioridad) que se incorporan al plan:

- Tokens semánticos sobre Tailwind (R1[UI-01], R3[UI-01], R4[UI03]).
- Modo oscuro / alto contraste opcional (R1[UI-04], R4[UI02]).
- EmptyState reutilizable con CTA (R1[UX-05], R3[UX-03], R4[UX03]).
- Banner offline con timestamp "última actualización local" (R1[MOV-03], R3[PWA-01], R4[PWA01]).
- Tests Vitest + Playwright (R1[TEST-01], R3[TEST-01], R4[PRU01]).
- README + glosario (R1[DOC-01], R3[DOC-01], R4[MAN01]).
- i18n liviano (R1[I18N-01], R3[I18N-01], R4[I1801]).
- Gestos swipe seguros (R3[MOB-02], R4[MOV02]).
- Virtualización condicional de Roles (R1[PERF-02], R3[PERF-02]).
- Workbox por estrategia (R1[PWA-01], R3[PWA-01]).
- Prompt de actualización de versión (R1[PWA-02]).

---

## 2. ESTRATEGIA DE BRANCHING Y RESPALDO

### 2.1 Estado actual
- `main` (remoto) — versión institucional estable.
- `claude/nice-hopper-048go` — rama actual; PR #6 abierto con
  `PROMPT_REVISION.md`.

### 2.2 Acciones de respaldo previas a cualquier cambio
> Estas acciones no modifican código; solo permiten volver atrás con
> seguridad.

1. **Tag de baseline** sobre el commit actual de `main` (o sobre el
   último commit de `claude/nice-hopper-048go` antes de iniciar Fase 1):
   ```
   git tag -a v1.0.0-baseline -m "Estado previo a refactor mayor (revisiones JORNALES)"
   git push origin v1.0.0-baseline
   ```
   Este tag permite `git checkout v1.0.0-baseline` para auditar la
   versión anterior en cualquier momento.

2. **Rama de respaldo "viva"** en remoto:
   ```
   git branch backup/pre-mejoras-jornales main
   git push origin backup/pre-mejoras-jornales
   ```
   Si el refactor sale mal, se puede hacer `git checkout
   backup/pre-mejoras-jornales` o `git reset --hard
   origin/backup/pre-mejoras-jornales` sin depender del tag.

3. **Política de PRs por fase**: cada fase del plan obtiene su propia
   sub-rama, su propio PR y su propia ventana de revisión/QA. Nunca se
   acumulan dos fases sin merge intermedio. Esto facilita el revert
   selectivo: `git revert <merge-commit>` deshace solo la fase fallida.

### 2.3 Esquema de sub-ramas propuesto

```
main
 └── backup/pre-mejoras-jornales         (espejo congelado)
 └── claude/nice-hopper-048go            (PR #6 — prompt y plan)
      └── claude/fase1-anti-cache        (PR independiente)
      └── claude/fase2-refactor-arq      (PR independiente)
      └── claude/fase3-ui-a11y           (PR independiente)
      └── claude/fase4-mov-ergonomia     (PR independiente)
      └── claude/fase5-persistencia      (PR independiente)
      └── claude/fase6-logica-negocio    (PR independiente)
      └── claude/fase7-rendimiento       (PR independiente)
      └── claude/fase8-tests-doc-i18n    (PR independiente)
```

Cada sub-rama parte de la anterior **ya mergeada**, no en paralelo, para
evitar conflictos. Si se requiere paralelizar (Fase 3 y Fase 4 son
independientes), trabajar en worktrees separados y planificar el merge.

---

## 3. MECANISMO ANTI-CACHE (FASE 1 — PRIORIDAD MÁXIMA)

> Esta fase **debe ir primero** porque es la garantía de que ningún
> usuario quede atascado con código viejo durante las fases siguientes.
> Sin esto, los cambios de Fase 2+ pueden "no aparecer" en los
> dispositivos que ya instalaron la PWA.

### 3.1 Capas del mecanismo (defensa en profundidad)

| # | Capa | Qué hace | Dónde se configura |
|---|------|----------|--------------------|
| 1 | **Hash en filenames** (assets) | Vite ya añade hash a `assets/index-XXXXX.js`. El navegador trata cada deploy como recurso nuevo. | Activo por defecto (verificar). |
| 2 | **PWA autoUpdate + skipWaiting + clientsClaim** | El service worker nuevo toma control inmediato y descarta el anterior. | `vite.config.js` → `VitePWA({...})` |
| 3 | **`cleanupOutdatedCaches: true`** (Workbox) | Borra cachés de versiones previas en cada activación. | `vite.config.js` → `workbox` |
| 4 | **Banner "Nueva versión disponible"** | Detecta `onNeedRefresh` y ofrece recargar; opcionalmente recarga automáticamente al detectar inactividad. | `src/PWAWrapper.jsx` |
| 5 | **`APP_VERSION` inyectada en build** | Variable global expuesta en UI (sidebar/footer) para que el usuario sepa qué versión usa. | `vite.config.js` → `define` |
| 6 | **`version.json` público + heartbeat** | El frontend hace fetch periódico (cada 5 min y al volver de background) a `/version.json`; si la versión remota es distinta, fuerza reload. | `public/version.json` generado en build + `src/lib/versionCheck.js` |
| 7 | **Meta tags `Cache-Control` en `index.html`** | Garantiza que el HTML índice nunca quede cacheado por intermediarios; los assets sí se cachean por hash. | `index.html` |
| 8 | **`SCHEMA_VERSION` en localStorage/IndexedDB** (futuro) | Cuando cambia el esquema de datos, se borra/migra el storage local para evitar leer estructuras viejas. | `src/lib/storage.js` (Fase 5) |
| 9 | **`registerType: 'autoUpdate'`** | El SW se actualiza solo cuando hay versión nueva, sin requerir botón. | `vite.config.js` |
| 10 | **Logs de versión al cargar** (`console.info`) | Trazabilidad: deja en consola la versión exacta cargada. | `src/main.jsx` |

### 3.2 Comportamiento esperado tras la Fase 1

1. Cualquier usuario que tenga la PWA instalada (o la pestaña abierta)
   recibirá un banner verde **"Nueva versión disponible — Actualizar
   ahora / Ver luego"** cuando se haga un nuevo deploy.
2. Si el usuario presiona "Actualizar ahora", la app recarga con la
   nueva versión sin pedir reinstalación.
3. Si el usuario ignora el banner, a los 5 minutos siguientes el
   heartbeat detecta divergencia y muestra un banner más enfático con
   cuenta regresiva de auto-recarga (configurable, 60 s por defecto).
4. La versión actual queda **visible en el sidebar** ("v1.2.3 ·
   23/05/2026 14:00") y al pasar el cursor muestra hash de commit
   (opcional, para soporte).
5. No se rompe el modo offline: el banner offline existente sigue
   apareciendo y muestra la última versión cargada.

### 3.3 Detalle de cambios técnicos (Fase 1)

- `package.json`: nada nuevo; usar `vite-plugin-pwa` y `workbox-window`
  que ya están instalados.
- `vite.config.js`:
  - `registerType: 'autoUpdate'`.
  - `workbox: { cleanupOutdatedCaches: true, skipWaiting: true, clientsClaim: true, runtimeCaching: [...] }`.
  - `define: { __APP_VERSION__: JSON.stringify(pkg.version), __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()), __APP_COMMIT__: JSON.stringify(process.env.GIT_SHA || 'dev') }`.
  - Plugin custom para generar `public/version.json` con
    `{ version, buildTime, commit }`.
- `index.html`:
  - `<meta http-equiv="Cache-Control" content="no-cache">`.
  - `<meta http-equiv="Pragma" content="no-cache">`.
  - `<meta http-equiv="Expires" content="0">`.
- `src/PWAWrapper.jsx`:
  - Importar `useRegisterSW` de `virtual:pwa-register/react`.
  - Nuevo componente `UpdateBanner` (mismo estilo que
    `InstallBanner`).
  - Mostrar timestamp "última actualización local" en
    `OfflineBanner`.
- `src/lib/versionCheck.js` (nuevo):
  - `fetchVersion()` cada 5 minutos + en `visibilitychange`.
  - Compara con `APP_VERSION` y dispara reload o evento.
- `src/main.jsx`:
  - `console.info('PNLQ v' + APP_VERSION + ' · build ' + APP_BUILD_TIME)`.
- `src/App.jsx`:
  - Pasar versión al `Sidebar` como prop, mostrar al pie.

### 3.4 Estimación
- **Esfuerzo**: 1 día de desarrollo + 0.5 día de QA en distintos
  dispositivos (Chrome desktop, Chrome Android, Safari iOS).
- **Riesgo**: bajo. No toca lógica de negocio ni layout.
- **Reversible**: sí, revert del PR.

---

## 4. FASES POSTERIORES — RESUMEN Y ORDEN PROPUESTO

### Fase 2 — Refactor estructural (sin cambio de UX)
> Objetivo: bajar la complejidad del monolito antes de tocar UI o datos.

- Dividir `App.jsx` por features (`src/features/{dashboard,roles,
  funcionarios,planificacion,planificacionFuncionario,actividades,
  viaticos,disponibilidad,alertas}`).
- Extraer **funciones puras** a `src/domain/{roles,cobertura,
  conflictos,viaticos,alertas,fechas}.js` (testables aisladamente).
- Componentes UI base a `src/ui/{Badge,Avatar,Card,AlertItem,
  AlertStrip,EmptyState}.jsx`.
- Constantes a `src/data/{puestos,opciones,seedFuncionarios,
  seedActividades}.js`.
- **Estado global** con `useReducer` + Context (`src/context/
  AppContext.jsx`) con acciones tipadas: `UPSERT_FUNCIONARIO`,
  `UPSERT_ACTIVIDAD`, `UPDATE_ROL_CELL`, `RESOLVE_CONFLICT`,
  `SET_VIEW`, `SET_PERIODO`, etc.
- README actualizado con la nueva estructura.
- **No se cambia ningún pixel visible**: la condición de QA es
  diff visual cero en los 30 indicadores.
- **Esfuerzo**: 3–5 días. **Riesgo**: alto si no hay pruebas — se
  acompaña de pruebas manuales completas y al menos smoke tests
  con Vitest sobre las funciones puras extraídas.

### Fase 3 — UI / a11y / estilo moderno
> Objetivo: visual moderno + accesible, sin tocar lógica.

- Definir tokens en `tailwind.config.js`: `critical`, `warning`,
  `ok`, `info`, `neutral`, `viatico`, `vacaciones`, `incapacidad`,
  `otro`, con variantes claro/oscuro.
- Migrar emojis a `lucide-react` (mapping documentado, `aria-label`
  en todos los iconos).
- Reorganizar Dashboard en bloques "Hoy" y "Este mes" (UX-01).
- `EmptyState` reutilizable con CTA contextual (UX-03).
- Asistente unificado de resolución de conflictos (UX-02).
- Contraste WCAG AA garantizado (auditar con Lighthouse).
- ARIA en modales (`role="dialog"`, `aria-modal`, `aria-labelledby`),
  focus trap (`react-focus-lock` o utilidad propia), `Esc` para
  cerrar, restauración de foco.
- Tamaños táctiles ≥ 48 px en BottomNav, RoleCell y botones de día.
- Modo alto contraste opcional (toggle en Topbar, persistido en
  localStorage con prefijo de versión).
- Banner offline con timestamp local + indicador "última
  actualización".
- **Checklist obligatorio**: marcar los 30 indicadores como
  "presente / reubicado". Cero "ausente".
- **Esfuerzo**: 5–7 días. **Riesgo**: medio (visual masivo).

### Fase 4 — Ergonomía móvil y campo
> Objetivo: usable con guantes y bajo sol, sin perder densidad de
> información en escritorio.

- Vista alterna **móvil** de Roles: tarjetas por funcionario +
  selector de semana, conservando códigos T/L/V/I/O, anillo
  "INICIO", conflicto rojo, edición. La tabla mensual permanece
  como opción.
- Resumen "CANTIDAD EN TURNO" como tarjeta inferior fija en móvil.
- Vista alterna **móvil** de Funcionarios: tarjetas con la misma
  información que la tabla. Conmutador "Tabla / Tarjetas".
- Modo "Semana" en Planificación general (swipe horizontal).
- Gestos seguros: swipe entre días en Detalle del día.
- **Esfuerzo**: 7–10 días. **Riesgo**: medio-alto (duplicación
  controlada de UI).

### Fase 5 — Persistencia offline
> Objetivo: que los datos no se pierdan al recargar (riesgo más
> grave en campo).

- **Paso 0**: `localStorage` con `schemaVersion` y debounce 500 ms,
  más botones "Exportar JSON" / "Importar JSON" / "Reiniciar
  datos semilla".
- **Paso 1**: migrar a IndexedDB vía `dexie`. Stores: `personas`,
  `actividades`, `roles`, `auditoria`. Adaptador de Context que
  lea/escriba en Dexie y exponga estado reactivo.
- IDs estables (`uuid`) y modelo normalizado.
- Cola de "cambios pendientes" visible en banner offline.
- Validaciones (cédula, correo, fechas, traslapes) con criterio
  "guardar con advertencia" para no bloquear operación de campo.
- Integración con el `SCHEMA_VERSION` del mecanismo anti-cache:
  al detectar cambio de esquema, ofrecer migración asistida y
  conservar backup automático antes de migrar.
- **Esfuerzo**: 10–15 días. **Riesgo**: alto (cambia el modelo de
  datos). Requiere pruebas exhaustivas.

### Fase 6 — Lógica de negocio configurable
> Objetivo: parametrizar reglas duras hoy hardcodeadas.

- `src/config/reglas.js` editable por administrador (UI mínima en
  vista nueva "Configuración" o flag en vista Disponibilidad):
  - `puestosRequierenVisitantesDiario: ['Puesto Orosi','Puesto Quetzales']`.
  - `diaCorteViaticos: 15`.
  - `mesObjetivoViaticos: 'siguiente'`.
  - `permitirConsultaDespuesCierre: true`.
- Feriados CR por año en `src/data/feriadosCR.js` (lista
  configurable, importable desde CSV). Cálculo de
  `primerDiaLaboral` que excluye feriados.
- Ampliar función `alertas()` con casos borde:
  - Vencimiento exactamente hoy (estado crítico específico).
  - Persona inactiva con actividad futura.
  - Incapacitado con actividad futura.
  - Acumulativa sin modalidad.
  - Brigada incapacitada con actividad de brigada.
  - ONG con contrato/vencimiento faltante (si la administración
    confirma que aplica).
- Confirmación de cambios de configuración para evitar apagar
  alertas por error.
- **Esfuerzo**: 4–6 días. **Riesgo**: medio (validar con SINAC).

### Fase 7 — Rendimiento
> Objetivo: app fluida en gama baja sin perder funcionalidad.

- `useMemo` en cálculos de matriz mensual, cobertura, conflictos
  y alertas (selectores por `monthKey` / `dayKey`).
- `React.memo` en `RoleCell` y otros componentes "celda".
- Virtualización condicional de la tabla de Roles si supera
  N filas (`@tanstack/react-virtual`).
- Lazy load de vistas pesadas (`React.lazy` por feature).
- Auditoría con React DevTools Profiler.
- **Esfuerzo**: 3–5 días. **Riesgo**: medio (memoización
  incorrecta = stale data).

### Fase 8 — Tests + i18n + documentación
> Objetivo: blindar el sistema contra regresiones y dejarlo
> transferible.

- Vitest unitario sobre `src/domain/*` (renumeración, generación
  de patrón, conflictos, alertas, viáticos, feriados).
- React Testing Library para flujos críticos.
- Playwright para 4 flujos end-to-end:
  1. Crear funcionario → asignar actividad → resolver conflicto.
  2. Planificar mes completo y verificar cobertura.
  3. Viáticos antes y después del corte.
  4. Recarga con datos en IndexedDB.
- i18n liviano: `src/i18n/es-CR.js` + hook `useT()`.
- Glosario operativo en `docs/GLOSARIO.md` (Visit., Plan, Turno,
  Libre, Modalidad, Acumulativa, ONG-Invest-Volunt, etc.).
- Manual breve PDF/MD para guardaparques, administración y
  jefatura.
- **Esfuerzo**: 7–10 días. **Riesgo**: bajo (no toca producción
  de usuario).

---

## 5. CRONOGRAMA ESTIMADO (referencial)

| Semana | Fase | Entregable |
|--------|------|------------|
| 0 | Preparación | Tag baseline, rama backup, este plan aprobado. |
| 1 | **Fase 1 — Anti-cache** | PR + deploy. Banner de versión funcionando en producción. |
| 2 | **Fase 2 — Refactor** | PR + QA. Estructura `features/domain/ui`, Context+Reducer, smoke tests. |
| 3 | **Fase 3 — UI/a11y** | PR + QA con checklist 30 indicadores. |
| 4–5 | **Fase 4 — Móvil** | PR + QA en dispositivo real. |
| 6–7 | **Fase 5 — Persistencia** | PR + pruebas de recarga/recuperación. |
| 8 | **Fase 6 — Reglas** | PR + validación SINAC. |
| 9 | **Fase 7 — Rendimiento** | PR + benchmark antes/después. |
| 10 | **Fase 8 — Tests/Docs** | PR + suite verde + glosario. |

Total estimado: **10 semanas** con un desarrollador a tiempo
parcial; **5–6 semanas** a tiempo completo.

---

## 6. PROTOCOLO POR CADA FASE

Antes de iniciar la implementación de cualquier fase:

1. Confirmar con el usuario que esta fase puede ejecutarse.
2. Crear sub-rama desde la última rama mergeada (no desde `main`
   directamente si hay fases pendientes en cola).
3. Implementar **solo** lo descrito en la fase. No mezclar
   alcances.
4. QA local con checklist de los 30 indicadores antes de abrir PR.
5. Abrir PR con descripción detallada y screenshots (o
   descripciones en texto si no se puede compilar).
6. Esperar revisión y aprobación del usuario.
7. Merge a `claude/nice-hopper-048go` (o donde indique el usuario)
   y cerrar PR de la fase.
8. Repetir.

**Si una fase falla en QA**: revert del PR de la fase, análisis
de causa, replanteo. No avanzar a la siguiente fase hasta
estabilizar la anterior.

---

## 7. RIESGOS GLOBALES Y MITIGACIONES

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Refactor de Fase 2 rompe lógica sutil de roles | Alto | Smoke tests en Vitest sobre `domain/*` antes del PR; checklist visual de los 30 indicadores. |
| Caché del navegador deja a usuarios con versiones mezcladas | Crítico | **Fase 1 es prerrequisito de todo lo demás**. |
| Migración a Dexie pierde datos cargados en localStorage | Alto | Backup automático en JSON antes de migrar; toggle "Volver a versión anterior" durante 30 días. |
| Cambios visuales rompen reconocimiento institucional | Medio | Validar paleta con manual de identidad SINAC; mantener emerald-900 como color institucional principal. |
| Cambios normativos (feriados, regla del 15) sin respaldo administrativo | Medio | Toda regla queda configurable, no se ejecuta automáticamente; mensaje "Regla dura" se preserva. |
| Equipo nuevo no entiende el código tras Fase 2 | Medio | README + glosario en Fase 8; convenciones de naming en español preservadas. |

---

## 8. PREGUNTAS PARA EL USUARIO ANTES DE EJECUTAR

1. ¿Apruebas la **Fase 1 (anti-cache)** como primera implementación?
2. ¿Quieres que cada fase abra un **PR separado** o prefieres acumular
   varias en un solo PR grande para revisar de una vez?
3. ¿Tienes preferencia entre `lucide-react` y `heroicons` para la
   migración de iconos? (Recomendamos `lucide-react`).
4. Para persistencia (Fase 5), ¿el destino final es local-only o se
   prevé sincronización con backend SINAC en un futuro? Esto define
   si se diseña con cola de cambios desde el inicio.
5. ¿Tienes el calendario oficial de feriados CR 2026/2027 o lo
   construimos desde fuentes públicas (MTSS)?
6. ¿Hay paleta institucional SINAC formal que debamos respetar más
   allá del verde emerald actual?
7. ¿Confirmamos el tag `v1.0.0-baseline` y la rama
   `backup/pre-mejoras-jornales` como red de seguridad antes de
   tocar nada?

---

## 9. SIGUIENTE PASO INMEDIATO

Si apruebas este plan:

1. Yo creo el tag `v1.0.0-baseline` y la rama
   `backup/pre-mejoras-jornales` (acciones reversibles, solo de
   etiquetado).
2. Yo abro la sub-rama `claude/fase1-anti-cache`.
3. Implemento la Fase 1 completa.
4. Abro PR independiente "Fase 1 — Mecanismo anti-cache y
   versionado".
5. Quedamos en pausa hasta tu aprobación para avanzar a la Fase 2.

**Hasta que apruebes, no se realiza ninguna modificación al
código.**
