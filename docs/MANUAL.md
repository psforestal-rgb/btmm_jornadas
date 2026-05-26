# Manual operativo — PNLQ Gestión de Jornadas

Manual breve por perfil de usuario. Pensado para impresión a una sola
cara y para consulta rápida en campo.

> **Regla dura permanente:** la herramienta solo **registra y alerta**.
> Ninguna acción genera pagos, suspensiones, reposiciones ni derechos
> automáticos. Toda decisión administrativa pasa por la coordinación
> respectiva.

---

## Para guardaparques (uso operativo en campo)

### Lo primero que verás al abrir la app
- **Dashboard** con dos bloques: **HOY** (qué pasa este día) y
  **ESTE MES** (cobertura crítica, vencimientos, personal).
- En la barra inferior tienes acceso directo a: Inicio,
  Personal, Plan, Alertas, y un menú "Más".

### Cómo se usa el calendario
- En el Dashboard, escoge el puesto (Orosi · Quetzales · Esperanza).
- Cada casilla muestra **Turno** (rol activo), **Plan**
  (actividades programadas) y **Visit.** (atención rutinaria).
- Toca una casilla para ver detalle de funcionarios programados,
  en turno y asignados a Visit.

### Qué significa cada color
- 🟥 **Rojo** — un puesto que requiere Visit. diario no tiene a
  nadie asignado (cobertura crítica).
- 🟨 **Amarillo** — hay funcionarios en turno pero ningún plan.
- 🟩 **Verde** — todo en orden.

### Roles (Tabla mensual o Por semana)
- Por defecto en móvil verás **Por semana** (tarjetas grandes).
- En escritorio verás **Tabla mensual**.
- Toca el candado de tu nombre para editar. El sistema renumera
  consecutivos automáticamente (T1, T2…, L1, L2…).
- 🟢 **INICIO** marca el primer día laboral del mes (desde donde
  empieza tu rotación).
- ⚠️ Anillo rojo pulsante = conflicto entre tu rol y una actividad.

### Detalle del día
- Desliza ← → en el teléfono o usa los botones para navegar.
- Botón "+ Asignar" en cada persona en turno sin actividad.

### Sin conexión
- La app sigue funcionando.
- Banner amarillo "Sin conexión — datos del DD/MM/YYYY HH:mm" te
  dice cuándo se cargó la versión local.
- Al reconectarse, si hay versión nueva verás banner verde
  "Nueva versión disponible — Actualizar ahora".

---

## Para administración

### Tu menú lateral (escritorio)
1. **Dashboard** — vista general.
2. **Funcionarios** — CRUD del personal, filtros y búsqueda.
3. **Detalle del día** — qué pasa en una fecha específica.
4. **Roles** — tabla mensual T/L/V/I/O por funcionario.
5. **Planificación general** — calendario mensual de actividades.
6. **Planificación/Funcionario** — vista por persona.
7. **Adelanto de viáticos** — listado del mes siguiente con corte
   día 15 (configurable).
8. **Disponibilidad** — control de contratos.
9. **Alertas** — listado completo + semáforo normativo.
10. **Datos · respaldo** — export/import JSON, reiniciar.
11. **Configuración** — reglas duras editables (ver abajo).

### Configuración — qué se puede cambiar
Acceso: sidebar grupo "Control" → **Configuración**.

| Regla | Default | Efecto |
|---|---|---|
| Puestos con Visit. diario | Orosi, Quetzales | Dashboard marca rojo si falta |
| Día de corte de viáticos | 15 | Plazo administrativo (1–28) |
| Mes objetivo de viáticos | siguiente | "siguiente" o "actual" |
| Permitir consulta tras cierre | true | Lista visible aunque venza el plazo |
| Aplicar feriados | true | INICIO salta los feriados oficiales CR |
| Alerta inactivo con actividad | true | ⚠️ warn |
| Alerta incapacitado con actividad | true | 🩺 danger |
| Alerta acumulativa sin modalidad | true | 📄 warn |

Cada cambio requiere **dos pasos** (Aplicar → Confirmar). Hay un
botón "Restaurar valores predeterminados" para volver al estado de
fábrica.

### Respaldos
Acceso: sidebar grupo "Control" → **Datos · respaldo**.

- **Exportar JSON** — descarga snapshot con metadatos
  institucionales (`appName`, `unidad`, `areaConservacion`,
  `exportadoEn`).
- **Importar JSON** — valida `schemaVersion` antes de aplicar;
  rechaza versiones incompatibles con mensaje claro.
- **Reiniciar datos semilla** — modal de confirmación con
  recomendación de exportar primero.

**Recomendación:** exportar JSON al final de cada jornada
administrativa importante (cierre de mes, antes de un cambio
mayor de reglas).

### Alertas administrativas — cuándo aparece cada una

| Tono | Alerta | Cuándo |
|---|---|---|
| 🚨 danger | Disponibilidad vencida | `días < 0` |
| 🚨 danger | Disponibilidad vence HOY | `días === 0` |
| ⚠️ warn | Disponibilidad por vencer | `0 < días ≤ 60` |
| 📄 warn | Sin resolución acumulativa | jornada Acumulativa + sin resolución + no ONG |
| 📄 warn | Acumulativa sin modalidad | jornada Acumulativa + sin modalidad |
| 🩺 danger | Revisar disponibilidad | Incapacitado + disponibilidad activa |
| 🩺 danger | Incapacitado con actividad | Incapacitado + actividad ≥ hoy |
| ⚠️ warn | Inactivo con actividad | Inactivo + actividad ≥ hoy |

---

## Para jefatura (auditoría y control)

### Lo que la herramienta garantiza
- **Versión visible** en sidebar (`v1.X.Y · commit · build`) —
  útil para reportar bugs y auditar despliegues.
- **Esquema versionado** en los datos persistidos (`schemaVersion`).
- **Backup automático** si la versión del esquema cambia entre
  versiones de la app (clave `pnlq:backup:vN-<timestamp>`).
- **Mecanismo anti-cache** que evita que un usuario quede atascado
  con código viejo tras un deploy (banner verde "Nueva versión
  disponible", heartbeat cada 5 minutos contra `/version.json`).

### Lo que la herramienta NO hace (verificable)
- No envía datos a terceros automáticamente.
- No genera pagos ni derechos automáticos por sí misma.
- No ejecuta suspensiones administrativas.

Toda alerta queda visible para revisión humana; la acción
correspondiente (renovar contrato, suspender disponibilidad,
reasignar personal incapacitado) la toma la coordinación
respectiva.

### Trazabilidad por fase
Ver `PLAN_IMPLEMENTACION.md` para el roadmap completo de las 8
fases. Cada fase tiene su PR en GitHub con detalle de cambios,
QA realizado e indicadores preservados.

### Próximos hitos sugeridos
- **Sincronización con backend institucional SINAC** (Fase 5 paso 1
  diferido): IndexedDB con Dexie + cola de cambios pendientes.
- **Pruebas E2E con Playwright** (ver `docs/TESTING.md`).
- **Calendario de feriados anual** (actualizar `src/data/feriadosCR.js`
  cuando MTSS publique el del año siguiente).

---

## Atajos de teclado

| Acción | Tecla |
|---|---|
| Cerrar modal | `Esc` |
| Navegar en modal | `Tab` / `Shift+Tab` (trampa de foco) |
| Foco visible | `:focus-visible` con anillo de alto contraste |

---

## Soporte y contacto

Para reportes de bug, indique:
1. **Versión** (visible en sidebar, ej. `v1.8.0 · abc1234`).
2. **Vista** donde ocurre.
3. **Pasos** para reproducir.
4. **Dispositivo y navegador**.

> El proyecto vive en https://github.com/psforestal-rgb/BTMM_JORNADAS
