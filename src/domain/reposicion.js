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
