# Testing — PNLQ Gestión de Jornadas

## Niveles cubiertos

| Nivel | Herramienta | Cobertura actual |
|---|---|---|
| Unitario (dominio) | Vitest | **97 tests** sobre `src/domain/*` y `src/config/*` |
| Unitario (storage / a11y / i18n) | Vitest + jsdom | **26 tests** |
| Integración (UI) | Vitest + jsdom + React Testing Library | **12 tests** sobre `EmptyState` y `Funcionarios` |
| End-to-end | Playwright | **Diferido** (ver abajo) |

Total: **126 tests verde** corriendo en ~6 s.

## Cómo correr

```bash
npm test              # corre todo, una vez
npm run test:watch    # vitest en watch mode
```

## Estructura

```
src/
├── domain/__tests__/
│   ├── fechas.test.js          # 6 — dim, isoFecha, fecha, faltan, primerDiaLaboral
│   ├── roles.test.js           # 15 — parseModalidad, generarValorPatron, renumerarFila…
│   ├── actividades.test.js     # 2 — actividadesEnDia, esAtencionRutinaria
│   ├── cobertura.test.js       # 3 — puestoRequiereAtencionRutinaria con lista
│   ├── conflictos.test.js      # 3 — conflictosActividadDia, actividadTieneConflictoMes
│   ├── alertas.test.js         # 7 — casos clásicos (vencida, por vencer, sin resol, incap+disp)
│   ├── alertas-extended.test.js # 8 — Fase 6 (vence HOY, inactivo/incap con actividad, sin modal)
│   ├── feriados.test.js        # 11 — feriadosDelAno, primerDiaLaboral con feriados
│   └── validaciones.test.js    # 22 — cédula, correo, fechas, traslapes, funcionario, actividad
├── config/__tests__/
│   └── reglas.test.js          # 11 — defaults, mergeReglas, validarReglas
├── lib/__tests__/
│   ├── storage.test.js         # 10 — load/save/clear, snapshot import/export, backup auto
│   └── a11y.test.js            # 5 — pila Esc topmost, unmount cleanup
├── i18n/__tests__/
│   └── es-CR.test.js           # 11 — lookup, format, t, completitud del diccionario
├── ui/__tests__/
│   └── EmptyState.test.jsx     # 4 — render, CTA, tonos
└── features/funcionarios/__tests__/
    └── Funcionarios.test.jsx   # 8 — filtros, búsqueda, toggle tabla/tarjetas, eliminación
```

## Plan E2E con Playwright (diferido)

Cuatro flujos críticos que cubrir cuando se instale Playwright:

### 1. Flujo de planificación mensual
```
1. Abrir Dashboard.
2. Verificar AlertStrip y KPIs.
3. Navegar a Roles → editar fila → cambiar día 5 a "Libre".
4. Verificar renumeración automática de consecutivos.
5. Navegar a Planificación → crear actividad para el día 10.
6. Verificar que aparezca en Dashboard como "Plan".
```

### 2. Resolución de conflictos
```
1. Crear actividad para un funcionario en día Libre.
2. Verificar marca roja en Roles + chip "!" pulsante.
3. Abrir asistente de conflicto.
4. Paso 1: elegir "Modificar rol del día".
5. Paso 2: confirmar.
6. Verificar que el conflicto desaparece.
```

### 3. Viáticos antes y después del corte
```
1. Configurar diaCorteViaticos = 15.
2. Mockear fecha actual al día 10 → banner verde "Plazo abierto".
3. Mockear fecha actual al día 20 → banner rojo "Clausurado".
4. Verificar que el listado sigue visible (permitirConsultaDespuesCierre).
5. Cambiar regla a false → verificar que el listado se oculta.
```

### 4. Persistencia y recarga
```
1. Crear funcionario con cédula 1-0000-9999.
2. Recargar página (sin importar el snapshot).
3. Verificar que el funcionario sigue ahí (localStorage).
4. Exportar JSON → guardar archivo.
5. Reiniciar a datos semilla → confirmar.
6. Importar el JSON guardado → verificar que el funcionario regresa.
```

### Instalación cuando se decida ejecutar
```bash
npm install --save-dev @playwright/test
npx playwright install --with-deps
```

Recomendación: ejecutar Playwright en CI solo en releases (cada
3–6 meses) por el peso de los browsers (~200 MB).

## Cobertura de indicadores

Cada uno de los 30 indicadores documentados en `PROMPT_REVISION.md`
sección 7 debería tener al menos un test que verifique su presencia.
Cobertura actual aproximada:

| Indicador | Test |
|---|---|
| #5 Calendario cobertura | Dashboard test (pendiente RTL) |
| #8 Anillo rojo + chip ! | `roles.test.js` (lógica) — falta RTL |
| #9 Anillo verde INICIO | `roles.test.js` — falta RTL |
| #14 Sin resolución | `alertas.test.js` ✓ |
| #15 Badges Estado | `Funcionarios.test.jsx` ✓ |
| #16 Badges Policía/Brigada/ONG | `Funcionarios.test.jsx` ✓ |
| #17 Conteo filtrados/total | `Funcionarios.test.jsx` ✓ |
| #18 Banner offline | Manual (jsdom no simula `navigator.onLine` fácilmente) |
| #21 Confirmaciones eliminación | `Funcionarios.test.jsx` ✓ |
| #30 EmptyState | `EmptyState.test.jsx` + `Funcionarios.test.jsx` ✓ |

Se irá completando con cada fase de mantenimiento.

## Convenciones

- Test files: `*.test.js` para dominio puro, `*.test.jsx` para componentes.
- `@vitest-environment jsdom` en la cabecera de archivos que necesitan DOM.
- `cleanup` de RTL después de cada test (configurado en `afterEach`).
- Mock data inline o usar `data/seed*.js` solo si la estructura completa importa.
