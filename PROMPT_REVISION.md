# PROMPT PARA REVISIÓN, OBSERVACIONES Y RECOMENDACIONES
## Herramienta: PNLQ — Gestión de Jornadas Laborales
### Bloque Tapantí · Macizo de la Muerte (BTMM) — SINAC · Área de Conservación Central · Costa Rica

---

## 1. CONTEXTO Y SOLICITUD AL REVISOR

Necesito que revises de forma exhaustiva la herramienta web "PNLQ — Gestión de
Jornadas Laborales" desarrollada para el Parque Nacional Los Quetzales (PNLQ),
dentro del Bloque Tapantí–Macizo de la Muerte del Sistema Nacional de Áreas de
Conservación (SINAC) de Costa Rica. Se requiere que entregues **observaciones,
recomendaciones y sugerencias en todos los aspectos posibles**: experiencia de
uso (UX), interfaz (UI), accesibilidad, arquitectura, modelo de datos, lógica
de negocio, coherencia normativa, ergonomía móvil, rendimiento, mantenibilidad,
internacionalización (es-CR), gestión de estado, organización del código y
patrones de React.

### Condición rectora (NO NEGOCIABLE)

> **No se puede perder ninguna alerta, ningún registro, ningún indicador
> visible, ningún dato ni ninguna funcionalidad existente.** Pueden cambiar
> de forma, estructura, agrupación, apariencia, tipografía, color, iconografía,
> ubicación o nombre, pero la información y las funciones deben permanecer
> íntegramente accesibles para el usuario. Toda recomendación que implique
> "ocultar" o "eliminar" debe sustituir la representación, nunca suprimirla.

### Objetivo de diseño

La herramienta debe quedar **muy intuitiva, fácil de usar, con estilo
moderno**, apta para uso operativo en campo (móvil) y administrativo
(escritorio), conservando el lenguaje institucional del SINAC.

---

## 2. DESCRIPCIÓN GENERAL DE LA HERRAMIENTA

### 2.1 Propósito

Aplicación web (PWA instalable, con soporte offline) para que el personal
administrativo y operativo del PNLQ pueda **planificar, visualizar, controlar
y alertar** sobre:

- Jornadas laborales y roles mensuales del personal (turnos, libres,
  vacaciones, incapacidades, otros).
- Cobertura operativa diaria por puesto (Orosi, Quetzales, Esperanza).
- Asignación de actividades a funcionarios (rutinarias y especiales).
- Detección de conflictos entre rol del día y actividades planificadas.
- Adelanto de viáticos para el mes siguiente (con regla de corte el día 15).
- Disponibilidad contractual (contratos de "disponibilidad") y sus
  vencimientos.
- Alertas administrativas, normativas y de cobertura.

La herramienta **registra y alerta**, **no ejecuta** decisiones automáticas
(no genera pagos, suspensiones, reposiciones ni derechos por sí misma). Es
una capa de soporte a la toma de decisiones humana.

### 2.2 Stack técnico

- **Framework**: React 18 (sin enrutador externo; navegación por estado
  `view`).
- **Build**: Vite 6.
- **Estilos**: Tailwind CSS 3 + PostCSS + Autoprefixer.
- **PWA**: `vite-plugin-pwa` + `workbox-window` (manifest, íconos maskable,
  banner de instalación, banner offline).
- **Idioma**: español (es-CR), con terminología institucional SINAC.
- **Persistencia**: estado en memoria de React (datos semilla); aún no hay
  capa de persistencia real (localStorage, IndexedDB o backend).

### 2.3 Datos semilla (mock) presentes

- **3 puestos operativos**: Puesto Orosi (OR, naranja claro), Puesto
  Quetzales (QZ, naranja fuerte), Puesto Esperanza (LE, celeste).
- **16 funcionarios** distribuidos entre los puestos, con atributos: cédula,
  correo, cargo institucional, condición (Propiedad / Interino /
  ONG-Invest-Volunt), jornada (Ordinaria / Acumulativa), modalidad
  (Horario administrativo L-V, 10x5, 12x6, 14x7, 16x8, 20x10), resolución
  acumulativa, disponibilidad (sí/no, contrato, vencimiento), autoridad de
  policía, brigada forestal, estado (Activo / Inactivo / De vacaciones /
  Incapacitado), observaciones.
- **5 actividades base** que ejemplifican: atención rutinaria de visitantes,
  mantenimiento, gira con viático y un caso de conflicto rol-vs-plan.

---

## 3. ESTRUCTURA DE NAVEGACIÓN

La herramienta tiene una navegación principal (sidebar en escritorio, bottom
nav en móvil con botón "Más" para vistas secundarias) organizada en tres
grupos:

### Grupo "Principal"
1. **Dashboard** (`🏠`) — Vista de inicio, KPIs y cobertura.
2. **Funcionarios** (`👥`) — CRUD del personal.

### Grupo "Jornadas"
3. **Detalle del día** (`📅`) — Vista granular por día.
4. **Roles** (`📊`) — Tabla mensual de roles por funcionario.
5. **Planificación general** (`🗓️`) — Calendario mensual de actividades.
6. **Planificación/Funcionario** (`📋`) — Vista por persona con sus días.
7. **Adelanto de viáticos** (`💵`) — Listado del mes siguiente.
8. **Disponibilidad** (`🛡️`) — Control de contratos.

### Grupo "Control"
9. **Alertas** (`🔔`) — Listado completo y semáforo normativo.

### Elementos transversales
- **Sidebar** verde oscuro (`bg-emerald-900`) con logo ACC, título BTMM y
  contador de alertas (badge rojo).
- **Topbar** sticky con migas (PNLQ / vista), título, navegador
  mes/año (← Mes anterior · selector mes · selector año · Mes siguiente →),
  toggle "Vista amplia/compacta" en Roles, e indicador "Activo".
- **BottomNav** móvil con 4 accesos directos (Inicio, Personal, Plan,
  Alertas) + botón "Más" que despliega Día, Roles, Plan/Func., Viáticos,
  Disponib.
- **PWAWrapper**: banner "Instalar PNLQ en este dispositivo" (con detalle
  "Acceso sin internet · Pantalla completa · Sin navegador") y banner
  "Sin conexión — mostrando datos en caché".

---

## 4. VISTAS — DETALLE FUNCIONAL

### 4.1 Dashboard
- **Tira de alertas críticas** (AlertStrip) con conteo y chips clicables
  que llevan a la vista Alertas.
- **4 KPIs**:
  - "Cobertura crítica" = días del mes sin atención rutinaria de visitantes
    en puestos que la requieren (Orosi y Quetzales).
  - "Sin actividad" = funcionarios en turno hoy sin actividad planificada.
  - "Por vencer" = disponibilidades con vencimiento ≤30 días.
  - "Personal activo" = activos / total.
- **Cobertura por puesto operativo** (calendario mensual interactivo):
  - Selector tipo "pill" por puesto, con badge `!` rojo si hay días sin
    Visit. o sin Plan.
  - Resumen del puesto activo (días sin Visit., días sin Plan, badge
    "Requiere Visit. diario" si aplica).
  - **Cada día** es un botón con: número de día, día de la semana
    abreviado, conteos "Turno" (rol activo) / "Plan" (programados) /
    "Visit." (asignados a atención rutinaria). Colores: rojo cuando
    falta Visit. obligatoria, ámbar cuando hay rol sin plan, verde
    cuando hay cobertura, blanco/neutro si nada.
  - Clic abre **CoberturaDetalleModal** con: 3 cards (Programados / En
    turno / Atención rutinaria), lista de asignados a Visit., lista
    de funcionarios en turno agrupados por puesto, posibilidad de
    agregar/editar actividades inline.
- **Alertas activas** (4 primeras) con botón "Ver todas".
- **Estado del personal** (7 primeros) con avatares, cargo, badge de
  estado, y atajo a "Funcionarios".
- **Marco normativo / control interno** (colapsable): chips de decretos
  y leyes (Dec. 28409-MINAE, Dec. 34885-MINAET, Dec. 40452-MINAE,
  CT arts. 135-144, Ley 8968, Ley 7575, Ley 6084, LGAP, Ley 8292) y
  recordatorio "Regla dura: el sistema registra y alerta; no genera
  pago, reposición, suspensión o derecho automático."

### 4.2 Detalle del día (DashboardDia)
- Barra de navegación de fecha: `← Anterior`, etiqueta del día de la
  semana + mes + año, input `type="date"`, `Siguiente →`.
- **5 KPIs**: En turno, Con actividad, Sin actividad, Fuera de turno,
  Con viático (todos con color contextual cuando hay valor).
- **Por puesto operativo**: 3 mini-tarjetas con conteos de turno,
  planificados y activos.
- **Actividades planificadas** del día: tarjetas con título, lugar,
  rango (si abarca varios días), badge `💵 Viático`, badge
  `⚠ N conflicto(s)`, botón Editar, listado de funcionarios con
  marca individual de conflicto.
- **En turno · con actividad**: avatar, rol, badges, puesto, chips de
  actividades.
- **En turno · sin actividad**: ícono `⚠️` cuando hay casos, botón
  `+ Asignar`.
- **Fuera de turno**: agrupados por categoría (Libre, Vacaciones,
  Incapacidad, Otro, Sin marcar) con su color.
- **Con viático este día**: lista cuando hay casos.

### 4.3 Funcionarios
- Barra de búsqueda por nombre/cédula/puesto/observación.
- **Filtros rápidos** tipo "pill": Todos, Guardaparques, Con
  disponibilidad, Acumulativa, ONG-Invest-Volunt, Sin resolución.
- Conteo `filtrados/total`.
- **Tabla** (min-width 1040px, scroll horizontal en móvil) con
  columnas: Funcionario (avatar + nombre + cédula/email), Cargo /
  puesto operativo (cargo, puesto operativo en verde, badges de
  condición y ONG), Jornada (badge ordinaria/acumulativa + modalidad,
  badge "🔵 Sin resolución" cuando aplica), Disponibilidad
  (sí/no + vencimiento), Atributos (Policía, Brigada), Estado
  (badge coloreado), Acciones (Editar, Eliminar).
- **Modal Editar/Agregar funcionario**: nombre, cédula, correo,
  cargo institucional, puesto operativo, condición, estado, jornada,
  modalidad, resolución, contrato, vencimiento, ingreso, checkboxes
  (Disponibilidad, Autoridad policía, Brigada, ONG-Invest-Volunt),
  observaciones.
- Confirmación de borrado en modal.
- Leyenda al pie: "🛡️ Autoridad de policía · 🔥 Brigada forestal ·
  🔵 Dato operativo por completar".

### 4.4 Roles (mensual)
- Botón **Restaurar mes** y badge "Edición por fila".
- **Leyenda de códigos**: T1 Turno (verde), L1 Libre (ámbar),
  V1 Vacaciones (azul), I1 Incapacidad (rojo), O1 Otro (violeta).
- **Una tarjeta por puesto operativo** con tabla de:
  - Columna sticky izquierda "Funcionario / edición": botón con
    candado 🔒/🔓 para activar edición y, cuando está abierto,
    selector de modalidad + botón "Aplicar" para generar el patrón
    automáticamente desde el primer día laboral del mes.
  - Columnas: días 1..N con encabezado coloreado (fin de semana
    en gris oscuro).
  - **RoleCell**: muestra el código (T1, L2, V1, I1, O1…), con
    color por categoría, anillo verde si es "INICIO" del primer
    día laboral en edición, anillo rojo pulsante si hay
    **conflicto** (actividad planificada en día sin turno).
  - Clic en celda en edición abre **MenuCelda** (Turno, Libre,
    Vacaciones, Incapacidad, Otro o Limpiar), y el sistema
    **renumera la fila** manteniendo consecutivos correctos
    (T1, T2…, L1, L2…) respetando la modalidad.
  - Clic en conflicto abre **ConflictoModal** con dos vías:
    "Modificar rol del día" o "Modificar actividad(es)".
  - Fila final "CANTIDAD EN TURNO" por día con conteo agregado
    del puesto.
- **Toggle "Vista amplia/compacta"** en Topbar reduce altura/tamaño
  de celdas.

### 4.5 Planificación general (mensual)
- Botón `+ Agregar actividad`.
- Leyenda: Programada (verde), Requiere viático (naranja), Fin de
  semana (gris), `👥 = en turno`.
- **Calendario mensual** 7 columnas (Domingo–Sábado) con header
  oscuro. Cada celda:
  - Botón de día (cuadrado oscuro) que lleva a "Detalle del día".
  - Indicadores: `👥 N` (en turno), `N act.` (actividades).
  - Tarjetas de actividad con título (line-clamp 2), funcionarios
    (3 + " +N"), lugar (📍), badge "VIÁTICO" (naranja) y, si hay
    conflicto, marco rojo + chip "⚠ ROL: nombres".
- **ModalActividad** (compartido con otras vistas): selector de
  "Actividad" (predefinida "Atención rutinaria de visitantes" o
  "Otra actividad"), fecha inicio, fecha fin, checkbox "Actividad
  de un solo día", checkbox "Requiere tramitar adelanto de
  viático", selector de Lugar (puestos + "Secretaría
  Ejecutiva/Dirección ACC" + Otro), agrupado por puesto operativo
  con avisos amarillos cuando el funcionario ya tiene actividad
  traslapada (con botones "Agregar de todos modos" / "Modificar
  actividad"), observaciones, botones Eliminar (si existente) /
  Cancelar / Guardar actividad.

### 4.6 Planificación/Funcionario
- Navegación local de mes/año + Expandir/Colapsar todo.
- Leyenda: Turno con actividad (verde), Falta asignar actividad
  (amarillo), Actividad no coincide con rol (rojo).
- **Tarjeta por funcionario** colapsable con resumen: días
  visibles, actividades, "N sin asignar", "N conflictos".
- Cada fila día muestra: fecha, badge de rol, actividades o
  "Falta asignar actividad", y botones contextuales:
  "Modificar actividad" / "Modificar rol" / "Asignar" / "Nueva".
- **AsignarActividadModal** permite crear nueva o agregar a una
  existente del mismo día.
- **ModificarRolModal** aplica un cambio puntual respetando la
  modalidad y recalcula consecutivos.

### 4.7 Adelanto de viáticos
- Cálculo automático del **mes objetivo** (mes siguiente al actual
  del navegador) y banner del **plazo**:
  - Plazo abierto (≤ día 15): borde verde.
  - Clausurado (> día 15): borde rojo. El listado sigue visible
    "para consulta".
- Dos vistas: **Por funcionario** (tarjetas con sus actividades
  con viático) y **Por actividad** (tarjeta con la actividad y sus
  participantes en chips).
- Estado vacío con mensaje claro.

### 4.8 Disponibilidad
- Dos cards: "Contratos activos — disponibilidad" y "Sin
  disponibilidad asignada".
- Cada item: avatar, nombre, contrato o puesto, vencimiento si
  existe, badge con días restantes (ámbar si ≤60).
- Mensaje fijo: "Control: la herramienta alerta; no ejecuta
  suspensiones automáticamente."

### 4.9 Alertas
- Listado completo de alertas con AlertItem (borde izquierdo
  coloreado): danger (rojo, 🚨/🩺), warn (amarillo, ⚠️/📄), ok
  (verde, ✅), info (azul).
- **Semáforo normativo** con 5 niveles: 🟢 Verificado · 🟡
  Confirmación interna · 🟠 Criterio RH/Jurídico · 🔴 No
  automatizar · 🔵 Dato pendiente.

---

## 5. LÓGICA DE NEGOCIO CLAVE

### 5.1 Reglas de cobertura
- **Atención rutinaria de visitantes** (`actividadRutinariaVisitantes`)
  es OBLIGATORIA cada día en **Puesto Orosi** y **Puesto Quetzales**.
  Si un día no tiene ningún funcionario asignado a esa actividad, se
  marca como **cobertura crítica** (rojo).
- Si hay rol activo (T) en un puesto pero no hay actividad planificada
  para ese día, se marca como **sin plan** (ámbar).

### 5.2 Modelo de roles
- Códigos: **T**(urno), **L**(ibre), **V**(acaciones),
  **I**(ncapacidad), **O**(tro), o vacío.
- Cada categoría se enumera consecutivamente al cambiar de categoría
  (T1, T2…; L1, L2…). El número se **calcula automáticamente** en
  toda la fila al editar una celda, respetando la modalidad del
  funcionario.
- Modalidades: Administrativo L-V (5 trabajo, 2 libre), 10x5, 12x6,
  14x7, 16x8, 20x10. El "primer día laboral" del mes (primer L-V)
  marca el inicio del ciclo (anillo verde "INICIO").

### 5.3 Conflictos rol vs. planificación
- Una actividad asignada a un funcionario en un día donde su rol
  no es activo (no inicia con T) genera **conflicto**. Se muestra
  con marcas rojas en: Roles (celda con anillo rojo pulsante +
  chip "!"), Planificación general (tarjeta con borde rojo + chip
  "⚠ ROL: nombres"), Planificación/Funcionario (fila roja +
  "NO COINCIDE CON ROL"), Detalle del día (badge "⚠ N conflictos").
- Resolución por dos vías: modificar el rol del día o modificar la
  actividad.

### 5.4 Alertas administrativas (función `alertas`)
- "Disponibilidad vencida" (danger 🚨) si días ≤ 0.
- "Disponibilidad por vencer" (warn ⚠️) si 0 < días ≤ 60.
- "Sin resolución acumulativa" (warn 📄) para jornada Acumulativa
  sin resolución ni marca ONG.
- "Revisar disponibilidad — Incapacitado con disponibilidad activa"
  (danger 🩺).
- Si no hay ninguna, alerta "ok ✅ Sin alertas críticas".

### 5.5 Adelanto de viáticos
- Solo se listan actividades del mes siguiente con `viatico: true`.
- Plazo de trámite: hasta el día 15 del mes anterior; pasada esa
  fecha el banner cambia a "Clausurado" pero el listado **NO se
  oculta**.

### 5.6 Marco normativo
Los chips informan el respaldo legal/normativo. La regla dura
("registra y alerta, no ejecuta") debe seguir siendo visible en
Dashboard y Disponibilidad.

---

## 6. SISTEMA VISUAL (estado actual)

- **Paleta principal**: emerald-800/900 (institucional), slate
  para neutros, semánticos amber/yellow (advertencia), red
  (crítico), sky (vacaciones), violet (otro), orange (viático).
- **Bordes redondeados** abundantes: `rounded-xl`, `rounded-2xl`,
  `rounded-3xl`. Sombras suaves `shadow-sm` / `shadow-2xl`.
- **Tipografía**: sans del sistema, pesos `font-semibold` /
  `font-bold` / `font-black` muy presentes en KPIs y badges.
- **Componentes reutilizables** internos: `Badge`, `Avatar`
  (iniciales con color según charCode), `Card`, `AlertItem`,
  `AlertStrip`, `RoleCell`, `MenuCelda`, `CoberturaDetalleModal`,
  `ConflictoModal`, `ActividadesDiaModal`, `ModalFuncionario`,
  `ModalActividad`, `ModificarRolModal`, `AsignarActividadModal`,
  `Sidebar`, `Topbar`, `BottomNav`, `PWAWrapper`.
- **Iconografía**: emojis (🏠 👥 📅 📊 🗓️ 📋 💵 🛡️ 🔔 📍 ⚠️ 🚨 🩺 📄 ✅
  🌲 📡 ⚖️ 🟢 🟡 🟠 🔴 🔵 ✕).

---

## 7. INDICADORES Y ALERTAS QUE DEBEN PRESERVARSE

Lista cerrada que **debe mantenerse íntegra** (puede cambiar la
representación visual, pero no el aviso ni el dato):

1. Badge contador de alertas en sidebar y bottom nav.
2. AlertStrip de "Requiere atención · N" con chips.
3. KPIs del Dashboard (Cobertura crítica, Sin actividad, Por
   vencer, Personal activo) con cambio de color cuando el valor
   exige atención.
4. KPIs del Detalle del día (En turno, Con actividad, Sin
   actividad, Fuera de turno, Con viático).
5. Calendario de cobertura por puesto con estados verde/ámbar/rojo
   y mini-conteos Turno/Plan/Visit. por día.
6. Pill por puesto con badge `!` cuando hay días sin Visit. o sin
   Plan.
7. Resumen del puesto (días sin Visit., días sin Plan) y badge
   "Requiere Visit. diario".
8. Anillo rojo pulsante + chip `!` en celdas de Roles con
   conflicto.
9. Anillo verde "INICIO" en la celda del primer día laboral
   editable.
10. Filas/tarjetas rojas con texto "NO COINCIDE CON ROL" en
    Planificación/Funcionario.
11. Marcas rojas y chip "⚠ ROL: nombres" en tarjetas de actividad
    del calendario.
12. Badge VIÁTICO naranja y borde naranja en actividades con
    `viatico: true`.
13. Banner verde/rojo del plazo de viáticos (≤15 vs >15).
14. Badge "🔵 Sin resolución" en jornada Acumulativa sin
    resolución.
15. Badges de Estado (Activo / Inactivo / De vacaciones /
    Incapacitado) con paleta consistente.
16. Badges de atributos (Policía, Brigada, ONG-Invest-Volunt).
17. Conteo "filtrados/total" en Funcionarios.
18. Banner "Sin conexión — mostrando datos en caché".
19. Banner "Instalar PNLQ en este dispositivo".
20. Avisos amarillos al asignar funcionario con actividad
    traslapada (con acciones "Agregar de todos modos" / "Modificar
    actividad").
21. Confirmaciones de eliminación (funcionario y actividad).
22. Mensaje fijo "Control: la herramienta alerta; no ejecuta
    suspensiones automáticamente."
23. Recordatorio "Regla dura" del marco normativo.
24. Semáforo normativo de 5 niveles.
25. Leyendas de colores en Roles, Planificación, Dashboard y
    Funcionarios.
26. Fila "CANTIDAD EN TURNO" por día en Roles.
27. Contadores `👥 N` y `N act.` en celdas de Planificación
    general.
28. Indicador "Activo" verde en Topbar.
29. Badge de mes/año en cabecera de cada puesto en Roles.
30. Mensajes de estado vacío (e.g., "No hay actividades del mes
    siguiente marcadas…", "Sin actividades planificadas para este
    día", "No hay funcionarios en turno…").

> Si alguna recomendación reorganiza estos elementos (por ejemplo,
> mover el marco normativo a un panel lateral o convertir el
> calendario de cobertura en un heatmap), **debe describir cómo se
> preserva el aviso/dato/función equivalente**.

---

## 8. EJES DE REVISIÓN SOLICITADOS

Por favor entrega observaciones, recomendaciones y propuestas
concretas (con prioridad alta/media/baja y esfuerzo estimado)
sobre los siguientes ejes:

### 8.1 Experiencia de usuario (UX)
- Jerarquía visual y orden de lectura de Dashboard.
- Curva de aprendizaje para personal no técnico.
- Flujos críticos: crear actividad, resolver conflicto, asignar
  Visit., revisar viáticos.
- Reducción de fricción en formularios largos (ModalFuncionario,
  ModalActividad).
- Estados vacíos, de carga y de error.

### 8.2 Interfaz (UI) y estilo moderno
- Coherencia tipográfica y de espaciados.
- Densidad de información (¿hay sobrecarga en Roles o
  Planificación?).
- Paleta institucional vs. paleta semántica; legibilidad de los
  colores actuales en exteriores y bajo luz solar (uso en campo).
- Modo oscuro opcional (si se propone, debe ser opcional y no
  perder lectura de códigos T/L/V/I/O).
- Uso de emojis como iconos: ¿migrar a librería SVG (lucide /
  heroicons) preservando significado?
- Microinteracciones (hover, focus, transiciones, animaciones
  sutiles) sin sacrificar rendimiento.

### 8.3 Accesibilidad (a11y)
- Contrastes WCAG AA/AAA en badges y celdas (especialmente
  rojo/amarillo).
- Roles ARIA y `aria-label` en modales y banners.
- Navegación por teclado en tablas, modales y selectores
  contextuales.
- Tamaño mínimo de toque en BottomNav y RoleCell (≥44×44 px).
- Lectores de pantalla en alertas y conteos.

### 8.4 Ergonomía móvil y campo
- Tablas anchas con scroll horizontal: ¿alternativa cards en
  móvil que mantenga TODA la información?
- Calendarios densos: ¿colapso/expansión por semana? ¿zoom?
- Banner offline y caché: ¿mostrar fecha del último sincronizado?
- Gestos (swipe entre días, pinch en calendario, etc.).

### 8.5 Arquitectura del código
- `App.jsx` monolítico (>700 líneas): ¿separar por feature
  (`features/roles`, `features/actividades`, `features/personas`)
  manteniendo la API pública?
- Funciones puras de dominio en módulo aparte (`rolKey`,
  `parseModalidad`, `generarValorPatron`, `codigoRolFuncionario`,
  `alertas`, etc.).
- Componentes reutilizables a su propio archivo.
- Constantes (puestos, opciones, fechas mock) a `src/data/` o
  `src/constants/`.
- Estado global: ¿`useReducer` + Context? ¿Zustand? ¿Jotai?
  Justificar el costo-beneficio (la app no es enorme).

### 8.6 Modelo de datos y persistencia
- Falta persistencia: roleData, personas y actividadesPlan se
  pierden al recargar. Proponer estrategia (localStorage como
  paso 0; IndexedDB con Dexie para offline serio; sincronía con
  backend SINAC en fase 2).
- Esquema JSON propuesto para exportación/importación
  (CSV/Excel para personal administrativo).
- Validaciones: rango de fechas, duplicados de actividad por
  funcionario/día, identidad de cédula, formato correo.
- Auditoría (quién creó/modificó cada registro) si se conecta
  con autenticación.

### 8.7 Lógica de negocio y coherencia normativa
- Revisar coherencia de `alertas()`: ¿faltan casos
  (e.g., vencimiento exacto = 0, brigada con incapacidad,
  ONG-Invest-Volunt con disponibilidad)?
- Renumeración de roles: ¿qué pasa al cambiar mes con datos
  mixtos? ¿al cambiar modalidad a mitad de mes?
- Cálculo de "primer día laboral": ¿debería respetar feriados
  oficiales de Costa Rica?
- Plazo de viáticos (corte día 15): ¿parametrizar fecha
  límite por área de conservación?
- Atención rutinaria de visitantes: ¿permitir definir por
  configuración qué puestos la requieren? (Hoy está en código).
- "Personal Apoyo ONG-Invest-Volunt" y "Brigada forestal":
  ¿reglas específicas que faltan?

### 8.8 Internacionalización y terminología
- ¿Convertir cadenas a un diccionario (i18n) preparando es-CR
  base?
- Validar terminología institucional (Visit., Plan, Rol,
  Acumulativa, etc.) con el área administrativa del PNLQ.

### 8.9 Rendimiento
- Recálculo de `alertas` y `codigoRolFuncionario` en cada
  render: memoización por día / por funcionario.
- Virtualización de tablas de roles para meses con muchos
  funcionarios.
- Carga diferida (lazy) de vistas pesadas (Roles,
  Planificación).
- Tamaño del bundle (Tailwind purge ya activo por defecto en
  Vite, pero revisar).

### 8.10 PWA y offline
- Estrategias de caché Workbox (network-first vs
  stale-while-revalidate por recurso).
- Indicador de "datos pendientes de sincronizar" cuando
  vuelva la conexión.
- Versionado del manifest y prompt de actualización.

### 8.11 Pruebas
- Plan de pruebas unitarias mínimo (funciones puras de
  dominio).
- Pruebas de integración en Roles (renumeración, conflictos)
  y Planificación (traslape, viáticos).
- Pruebas end-to-end (Playwright) para flujos críticos.

### 8.12 Mantenibilidad y documentación
- README del proyecto (hoy casi vacío): qué hace, cómo correr,
  cómo desplegar.
- Convenciones de commits, ramas, CI/CD.
- Documento de glosario operativo (Visit., turno, libre,
  resolución, ONG-Invest-Volunt…).

---

## 9. FORMATO DE ENTREGA SUGERIDO

Por cada observación, devolver:

```
[ID]  EJE  PRIORIDAD  ESFUERZO
TÍTULO
- Hallazgo: qué viste y dónde (vista / componente / línea).
- Impacto: a quién afecta y cómo (operativo / administrativo).
- Propuesta: cómo cambiar la representación o estructura.
- Conservación: cómo se preserva la alerta/registro/indicador
  asociado (cumpliendo la condición rectora).
- Riesgos: efectos colaterales potenciales.
```

Adicionalmente, incluir:
- **Resumen ejecutivo** (10–15 líneas) con las 5 mejoras de
  mayor impacto.
- **Maqueta o descripción visual** (texto, ASCII o componentes
  Tailwind) de la propuesta de Dashboard renovado y de la vista
  Roles renovada, demostrando que ningún indicador desaparece.
- **Checklist de verificación final** marcando los 30
  indicadores del punto 7 como "presente / reubicado / fusionado
  con X / ausente". El último estado (ausente) **invalida** la
  propuesta y debe corregirse.

---

## 10. RESTRICCIONES Y NO-OBJETIVOS

- **No** proponer eliminar la PWA, el soporte offline ni los
  banners de instalación / sin conexión.
- **No** sustituir Tailwind por otra librería de estilos sin
  justificar ahorro neto.
- **No** introducir dependencias pesadas que rompan la PWA
  liviana.
- **No** convertir la herramienta en sistema transaccional que
  ejecute pagos, suspensiones o aprobaciones automáticas.
- **No** quitar los recordatorios normativos ("Regla dura",
  "la herramienta alerta; no ejecuta…").
- **No** ocultar información detrás de paywalls de UX (menús
  muy escondidos, hover-only en móvil, etc.).

---

## 11. ENTREGABLES ESPERADOS

1. Documento de observaciones siguiendo el formato del punto 9.
2. Resumen ejecutivo y checklist de los 30 indicadores.
3. (Opcional) Pruebas de concepto en JSX/Tailwind de los
   componentes clave reestilizados.
4. (Opcional) Roadmap por fases: cosmética → reestructura →
   persistencia → backend.

---

## 12. CIERRE

La meta es una herramienta que el guardaparques pueda usar en
campo con guantes y bajo lluvia, que la administradora pueda
revisar en escritorio durante una reunión, y que la jefatura
pueda auditar normativamente sin perder un solo indicador. Toda
recomendación debe servir a esos tres usos simultáneamente,
manteniendo intacto el inventario de alertas, registros e
indicadores documentado arriba.
