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
 * Cada registro acumula una o varias CUOTAS de reposición (`cuotas`),
 * de modo que el tiempo puede reponerse en partes (día completo, medio día
 * u horas) en distintas fechas hasta saldar. El saldo se calcula en horas
 * usando la duración de jornada configurada (`horasJornada`, def. 8).
 *
 * Regla dura: la herramienta solo registra y controla; la reposición
 * efectiva la autoriza la administración según la normativa vigente.
 */

export const HORAS_JORNADA_DEFAULT = 8;

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

// Magnitud del tiempo (trabajado o repuesto). `horas` se usa solo cuando
// la magnitud es "horas"; día entero / medio día se derivan de la jornada.
export const MAGNITUDES = ["diaEntero", "medioDia", "horas"];

export const ESTADOS = ["Pendiente", "Parcial", "Repuesto"];

/** Redondea a 2 decimales para evitar polvo de coma flotante. */
function r2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

/** Convierte una magnitud (día/medio/horas) a horas según la jornada. */
export function horasDeMagnitud(magnitud, horas, hj = HORAS_JORNADA_DEFAULT) {
  if (magnitud === "diaEntero") return hj;
  if (magnitud === "medioDia") return hj / 2;
  return Number(horas) || 0;
}

/**
 * Cuotas de reposición de un registro. Normaliza datos antiguos (que solo
 * tenían `estado`/`fechaReposicion`) a una cuota equivalente, sin mutar.
 */
export function cuotasDe(r) {
  if (Array.isArray(r?.cuotas)) return r.cuotas;
  if (r?.estado === "Repuesto") {
    return [{ id: `i-${r.id || "x"}`, fecha: r.fechaReposicion || r.fecha, magnitud: r.magnitud, horas: r.horas || 0 }];
  }
  return [];
}

export function horasTrabajadas(r, hj = HORAS_JORNADA_DEFAULT) {
  return r2(horasDeMagnitud(r?.magnitud, r?.horas, hj));
}

export function horasRepuestas(r, hj = HORAS_JORNADA_DEFAULT) {
  return r2(cuotasDe(r).reduce((acc, c) => acc + horasDeMagnitud(c.magnitud, c.horas, hj), 0));
}

export function saldoHoras(r, hj = HORAS_JORNADA_DEFAULT) {
  return r2(Math.max(0, horasTrabajadas(r, hj) - horasRepuestas(r, hj)));
}

/** Estado derivado: Pendiente (nada repuesto) · Parcial · Repuesto (saldo 0). */
export function estadoReposicion(r, hj = HORAS_JORNADA_DEFAULT) {
  const rep = horasRepuestas(r, hj);
  if (rep <= 0) return "Pendiente";
  if (saldoHoras(r, hj) <= 0) return "Repuesto";
  return "Parcial";
}

export function estaRepuesto(r, hj = HORAS_JORNADA_DEFAULT) {
  return estadoReposicion(r, hj) === "Repuesto";
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
 * "trabajado" (día trabajado) o de "reposición" (día/cuota en que se
 * repuso). No muta los roles: es solo una capa de señalización derivada.
 */
export function indexarReposiciones(items = [], hj = HORAS_JORNADA_DEFAULT) {
  const trabajadas = {};
  const reposiciones = {};
  for (const r of items) {
    if (r.funcionario && r.fecha) {
      trabajadas[`${r.funcionario}|${r.fecha}`] = { ...r, estadoCalc: estadoReposicion(r, hj), saldo: saldoHoras(r, hj) };
    }
    if (r.funcionario) {
      for (const c of cuotasDe(r)) {
        if (c.fecha) reposiciones[`${r.funcionario}|${c.fecha}`] = { ...r, cuota: c };
      }
    }
  }
  return { trabajadas, reposiciones };
}

/**
 * Resumen general: totales por estado y saldo total pendiente (en horas).
 */
export function resumenReposiciones(items = [], hj = HORAS_JORNADA_DEFAULT) {
  let pendientes = 0;
  let parciales = 0;
  let repuestos = 0;
  let saldo = 0;
  for (const r of items) {
    const est = estadoReposicion(r, hj);
    saldo += saldoHoras(r, hj);
    if (est === "Repuesto") repuestos += 1;
    else {
      pendientes += 1;
      if (est === "Parcial") parciales += 1;
    }
  }
  return { total: items.length, pendientes, parciales, repuestos, saldoHoras: r2(saldo) };
}

/** Ordena por fecha trabajada descendente (lo más reciente primero). */
export function ordenarPorFecha(items = []) {
  return [...items].sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
}

/** Suma el saldo pendiente (en horas) de un funcionario. */
export function saldoFuncionario(items = [], nombre, hj = HORAS_JORNADA_DEFAULT) {
  return r2(
    items
      .filter((r) => r.funcionario === nombre)
      .reduce((acc, r) => acc + saldoHoras(r, hj), 0),
  );
}

/** Registros de un funcionario con saldo pendiente, del más antiguo al más nuevo. */
export function registrosConSaldoDe(items = [], nombre, hj = HORAS_JORNADA_DEFAULT) {
  return items
    .filter((r) => r.funcionario === nombre && saldoHoras(r, hj) > 0)
    .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")));
}

/**
 * Agrupa los registros por funcionario con sus estadísticas (total,
 * pendientes, parciales, repuestos y saldo en horas), priorizando a quien
 * tiene más saldo pendiente.
 */
export function historialPorFuncionario(items = [], hj = HORAS_JORNADA_DEFAULT) {
  const porNombre = new Map();
  for (const r of items) {
    const nombre = r.funcionario || "—";
    if (!porNombre.has(nombre)) porNombre.set(nombre, []);
    porNombre.get(nombre).push(r);
  }
  const filas = [];
  for (const [funcionario, registros] of porNombre.entries()) {
    filas.push({ funcionario, registros: ordenarPorFecha(registros), ...resumenReposiciones(registros, hj) });
  }
  filas.sort((a, b) => b.saldoHoras - a.saldoHoras || b.total - a.total || a.funcionario.localeCompare(b.funcionario));
  return filas;
}
