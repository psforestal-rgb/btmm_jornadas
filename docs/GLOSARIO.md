# Glosario operativo PNLQ

Términos que usa la herramienta y su significado preciso en el contexto
del **Parque Nacional Los Quetzales** (PNLQ), **Bloque Tapantí · Macizo
de la Muerte** (BTMM), SINAC · Área de Conservación Central.

> **Regla dura:** la herramienta **registra y alerta**; no genera pagos,
> reposiciones, suspensiones ni derechos automáticos. Cada cambio
> normativo o de cobertura debe pasar por validación administrativa.

---

## Conceptos centrales

### Visit. (Atención rutinaria de visitantes)
Actividad operativa diaria que debe estar asignada a al menos un
funcionario en los puestos que la requieren. Si un día un puesto
requiere Visit. y no tiene nadie asignado, el sistema marca
**cobertura crítica** (rojo) en el Dashboard.

Puestos que requieren Visit. diario por configuración default:
- **Puesto Orosi**
- **Puesto Quetzales**

(Configurable desde *Configuración → Cobertura*.)

### Plan
Cualquier actividad planificada (no solo Visit.). Una actividad
queda "en plan" cuando aparece en `actividadesPlan` con su rango
de fechas y lista de funcionarios. Si un puesto tiene
funcionarios en turno pero ninguna actividad planificada para el
día, se marca *sin Plan* (ámbar).

### Turno
Rol activo de un funcionario en un día. Un funcionario está en
turno cuando su código de rol comienza con `T` (T1, T2, T3, ...).
Otros códigos: `L` Libre, `V` Vacaciones, `I` Incapacidad, `O`
Otro.

### INICIO
Marca visual (anillo verde en `RoleCell` + chip "INICIO") sobre
el **primer día laboral del mes** desde el cual se calcula la
rotación T/L con la modalidad del funcionario. Si la regla
*aplicar feriados* está activa, salta los feriados oficiales CR.

### Conflicto rol vs. actividad
Un funcionario está asignado a una actividad un día en el que su
rol **no es activo** (no empieza con T). Se marca:
- Roles: anillo rojo pulsante + chip "!" en la celda.
- Planificación: marco rojo + chip "⚠ ROL: nombres" en la tarjeta.
- Plan/Funcionario: fila roja + texto "NO COINCIDE CON ROL".

Resolución en dos vías (asistente Fase 3):
1. **Modificar rol del día** — cambia la categoría y renumera la fila.
2. **Modificar actividad** — quita al funcionario o ajusta la actividad.

---

## Jornadas y modalidades

### Jornada
Tipo de jornada laboral del funcionario.
- **Ordinaria** — horario administrativo L-V.
- **Acumulativa** — turno por ciclos NxM. Requiere número de
  resolución (excepto personal ONG-Invest-Volunt).

### Modalidad
Define la rotación de turno + libre dentro de la jornada
acumulativa. Formato `NxM` donde N = días de trabajo, M = días
libres.

| Modalidad | Trabajo | Libre |
|---|---|---|
| Horario administrativo L-V | 5 (L-V) | 2 (S-D) |
| 10x5 | 10 | 5 |
| 12x6 | 12 | 6 |
| 14x7 | 14 | 7 |
| 16x8 | 16 | 8 |
| 20x10 | 20 | 10 |

Al editar una celda en *Roles → Edición por fila*, el sistema
**renumera automáticamente** los consecutivos T/L de toda la fila
respetando la modalidad.

---

## Condición y atributos del personal

### Condición
- **Propiedad** — funcionario nombrado en propiedad.
- **Interino** — funcionario interino.
- **ONG-Invest-Volunt** — personal de apoyo externo (organizaciones
  no gubernamentales, investigadores, voluntarios). Régimen
  especial: no requiere resolución acumulativa, puede tener
  convenio en lugar de contrato.

### Disponibilidad
Contrato administrativo que habilita al funcionario para ser
llamado fuera de horario regular. Tiene:
- **Contrato** — identificador (ej. `DISP-2026-007`).
- **Vencimiento** — fecha ISO YYYY-MM-DD.

Alertas asociadas:
- 🚨 **Vencida** (`faltan < 0`).
- 🚨 **Vence HOY** (`faltan === 0`).
- ⚠️ **Por vencer** (`0 < faltan ≤ 60`).

### Atributos
- 🛡️ **Policía** — funcionario con autoridad de policía.
- 🔥 **Brigada** — miembro de brigada forestal.
- 🔵 **Sin resolución** — jornada acumulativa sin número de
  resolución (dato pendiente, no automatizar efectos).

### Estado
- **Activo** (verde).
- **De vacaciones** (azul).
- **Incapacitado** (rojo).
- **Inactivo** (gris).

Alertas Fase 6:
- ⚠️ Inactivo con actividad futura.
- 🩺 Incapacitado con actividad futura.
- 🩺 Incapacitado con disponibilidad activa.

---

## Viáticos

### Adelanto de viáticos
Pago anticipado para gastos de gira del **mes objetivo**. Por
default `mesObjetivoViaticos = "siguiente"` (mes próximo).

### Día de corte
Día del mes (default 15, editable 1–28) que cierra el plazo
administrativo para tramitar adelantos. Tras el corte:
- Si `permitirConsultaDespuesCierre = true` (default): banner rojo
  "Clausurado", listado sigue visible para consulta.
- Si `permitirConsultaDespuesCierre = false`: listado oculto.

### Requiere viático
Atributo booleano de una actividad (`actividad.viatico = true`).
Se marca con badge naranja "💵 VIÁTICO" en Planificación, y la
actividad aparece en *Adelanto de viáticos* del mes objetivo.

---

## Indicadores visuales preservados

La condición rectora del proyecto es que **ningún indicador, alerta o
registro se pierde** entre fases. Los 30 indicadores documentados en
`PROMPT_REVISION.md` (sección 7) deben mantenerse íntegros — pueden
cambiar de forma, color o posición, pero nunca desaparecer.

Trazabilidad por fase:
- **Fase 1** — banner offline (#18) enriquecido con timestamp.
- **Fase 2** — sin cambios visuales (refactor estructural).
- **Fase 3** — emojis migrados a SVG (lucide), tres temas, "Hoy vs Mes",
  asistente de conflicto.
- **Fase 4** — vistas alternas móvil (tabla/tarjetas), swipe.
- **Fase 5** — vista "Datos · respaldo" con export/import/reset.
- **Fase 6** — vista "Configuración" + reglas editables + feriados CR.
- **Fase 7** — sin cambios visuales (rendimiento).
- **Fase 8** — sin cambios visuales (tests + i18n + docs).

---

## Marco normativo aplicable

| Norma | Aspecto |
|---|---|
| Código de Trabajo arts. 135–144 | Jornadas y descansos |
| Código de Trabajo art. 148 | Feriados de pago obligatorio |
| Dec. 28409-MINAE / Dec. 34885-MINAET / Dec. 40452-MINAE | Áreas silvestres protegidas |
| Ley 6084 | Parques Nacionales |
| Ley 7575 | Forestal |
| Ley 8968 | Protección de la persona frente al tratamiento de datos |
| Ley 8292 | Control interno |
| LGAP | Ley General de Administración Pública |
| Ley 9803 | Traslados de feriados |

> Estas referencias son orientativas. La herramienta no aplica
> automáticamente ningún derecho derivado de ellas.
