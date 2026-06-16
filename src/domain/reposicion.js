/**
 * Dominio: Reposición de tiempo trabajado.
 *
 * Registra los casos en que la administración requiere poner a trabajar
 * a un funcionario en un día libre, fuera de turno, feriado o similar
 * (emergencias, incendios, atención de denuncias, actividades
 * especiales, etc.) para llevar el control y reponerle posteriormente
 * el tiempo trabajado. La magnitud puede ser por horas, medio día o
 * día entero.
 *
 * Regla dura: la herramienta solo registra y controla; la reposición
 * efectiva la autoriza la administración según la normativa vigente.
 */

// Tipo de día en que se requirió trabajar al funcionario.
export const TIPOS_DIA = ["Día libre", "Fuera de turno", "Feriado", "Vacaciones interrumpidas", "Otro"];

// Motivo institucional que originó el llamado a trabajar.
export const MOTIVOS = [
  "Emergencia",
  "Incendio forestal",
  "Atención de denuncia",
  "Actividad especial",
  "Operativo de control",
  "Otro",
];

// Magnitud del tiempo trabajado. `horas` se completa solo cuando la
// magnitud es "horas"; para medio día / día entero queda como referencia.
export const MAGNITUDES = ["diaEntero", "medioDia", "horas"];

export const ESTADOS = ["Pendiente", "Repuesto"];

export function estaRepuesto(r) {
  return r?.estado === "Repuesto";
}

/** Extrae la parte numérica de un folio "REP-007" → 7 (o null). */
export function folioNumero(folio) {
  const m = String(folio || "").match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Genera el siguiente folio consecutivo "REP-###" a partir de los existentes. */
export function siguienteFolio(items = []) {
  const max = items.reduce((mx, r) => Math.max(mx, folioNumero(r.folio) || 0), 0);
  return `REP-${String(max + 1).padStart(3, "0")}`;
}

/**
 * Indexa los registros por celda (funcionario + fecha ISO) para que la
 * matriz de roles pueda consultar en O(1) si un día tiene marca de
 * "trabajado" (día trabajado) o de "reposición" (día en que se repuso).
 * No muta los roles: es solo una capa de señalización derivada.
 */
export function indexarReposiciones(items = []) {
  const trabajadas = {};
  const reposiciones = {};
  for (const r of items) {
    if (r.funcionario && r.fecha) trabajadas[`${r.funcionario}|${r.fecha}`] = r;
    if (r.funcionario && estaRepuesto(r) && r.fechaReposicion) {
      reposiciones[`${r.funcionario}|${r.fechaReposicion}`] = r;
    }
  }
  return { trabajadas, reposiciones };
}

/**
 * Suma los registros por unidad sin asumir una duración fija de jornada
 * (la jornada acumulativa varía según modalidad). Devuelve la cantidad
 * de días enteros, medios días y la suma de horas sueltas.
 */
export function desglosePorUnidad(items = []) {
  return items.reduce(
    (acc, r) => {
      if (r.magnitud === "diaEntero") acc.diasEnteros += 1;
      else if (r.magnitud === "medioDia") acc.mediosDias += 1;
      else acc.horas += Number(r.horas) || 0;
      return acc;
    },
    { diasEnteros: 0, mediosDias: 0, horas: 0 },
  );
}

/**
 * Resumen general para el encabezado de la vista: totales y desglose por
 * unidad de lo pendiente de reponer y de lo ya repuesto.
 */
export function resumenReposiciones(items = []) {
  const pendientesArr = items.filter((r) => !estaRepuesto(r));
  const repuestosArr = items.filter((r) => estaRepuesto(r));
  return {
    total: items.length,
    pendientes: pendientesArr.length,
    repuestos: repuestosArr.length,
    pend: desglosePorUnidad(pendientesArr),
    rep: desglosePorUnidad(repuestosArr),
  };
}

/** Ordena por fecha trabajada descendente (lo más reciente primero). */
export function ordenarPorFecha(items = []) {
  return [...items].sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
}

/**
 * Agrupa los registros por funcionario y devuelve, por cada uno, sus
 * estadísticas (total, pendientes, repuestos y desglose por unidad de lo
 * pendiente y lo repuesto) más la lista de registros ordenada por fecha.
 * El resultado se ordena por cantidad de pendientes (desc) y luego por
 * total (desc) para priorizar a quienes tienen tiempo sin reponer.
 */
export function historialPorFuncionario(items = []) {
  const porNombre = new Map();
  for (const r of items) {
    const nombre = r.funcionario || "—";
    if (!porNombre.has(nombre)) porNombre.set(nombre, []);
    porNombre.get(nombre).push(r);
  }
  const filas = [];
  for (const [funcionario, registros] of porNombre.entries()) {
    filas.push({ funcionario, registros: ordenarPorFecha(registros), ...resumenReposiciones(registros) });
  }
  filas.sort((a, b) => b.pendientes - a.pendientes || b.total - a.total || a.funcionario.localeCompare(b.funcionario));
  return filas;
}
