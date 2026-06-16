import { faltan, fecha } from "./fechas.js";
import { historialPorFuncionario } from "./reposicion.js";

const HOY_DEFAULT = new Date(2026, 4, 19);

/**
 * Genera el listado de alertas administrativas para el personal.
 *
 * Firma:
 *   alertas(personas)                             // compat con versiones previas
 *   alertas(personas, { actividadesPlan, hoy, flags })
 *
 * `flags` controla qué reglas amplificadas (Fase 6) se evalúan. Permite al
 * administrador desactivar individualmente si tiene falsos positivos.
 */
export function alertas(personas, opts = {}) {
  const {
    actividadesPlan = [],
    reposiciones = [],
    hoy = HOY_DEFAULT,
    flags = {},
  } = opts;
  const {
    alertaInactivoConActividad = true,
    alertaIncapacitadoConActividad = true,
    alertaAcumulativaSinModalidad = true,
    alertaReposicionPendiente = true,
  } = flags;

  const r = [];
  const isoHoy = toISO(hoy);

  personas.forEach((f) => {
    // 1. Disponibilidad — distingue vencido (<0), vence HOY (=0) y por vencer.
    if (f.disponibilidad) {
      const d = faltan(f.vencimiento, hoy);
      if (d !== null && d < 0) {
        r.push({
          t: "danger",
          icon: "🚨",
          msg: `Disponibilidad vencida — ${f.nombre}`,
          sub: `${f.contrato} · venció ${fecha(f.vencimiento)} (hace ${Math.abs(d)} día${Math.abs(d) !== 1 ? "s" : ""}). Requiere revisión administrativa.`,
        });
      } else if (d !== null && d === 0) {
        r.push({
          t: "danger",
          icon: "🚨",
          msg: `Disponibilidad vence HOY — ${f.nombre}`,
          sub: `${f.contrato} · vencimiento ${fecha(f.vencimiento)}. Coordinar renovación o suspensión administrativa.`,
        });
      } else if (d !== null && d > 0 && d <= 60) {
        r.push({
          t: "warn",
          icon: "⚠️",
          msg: `Disponibilidad por vencer — ${f.nombre}`,
          sub: `${f.contrato} · vence ${fecha(f.vencimiento)} (en ${d} día${d !== 1 ? "s" : ""}). Requiere revisión administrativa.`,
        });
      }
    }

    // 2. Acumulativa sin resolución (no ONG).
    if (f.jornada === "Acumulativa" && !f.resolucion && !f.ong) {
      r.push({
        t: "warn",
        icon: "📄",
        msg: `Sin resolución acumulativa — ${f.nombre}`,
        sub: "Dato pendiente: no automatizar efectos hasta confirmar respaldo interno.",
      });
    }

    // 3. Acumulativa sin modalidad (Fase 6).
    if (alertaAcumulativaSinModalidad && f.jornada === "Acumulativa" && !f.modalidad) {
      r.push({
        t: "warn",
        icon: "📄",
        msg: `Acumulativa sin modalidad definida — ${f.nombre}`,
        sub: "Definir modalidad (10x5, 12x6, 14x7, 16x8, 20x10) para calcular roles correctamente.",
      });
    }

    // 4. Incapacitado con disponibilidad activa.
    if (f.estado === "Incapacitado" && f.disponibilidad) {
      r.push({
        t: "danger",
        icon: "🩺",
        msg: `Revisar disponibilidad — ${f.nombre}`,
        sub: "Funcionario incapacitado con disponibilidad activa. Verificar criterio RH.",
      });
    }

    // 5. Incapacitado con actividad futura (Fase 6).
    if (alertaIncapacitadoConActividad && f.estado === "Incapacitado") {
      const futuras = actividadesFuturasDe(actividadesPlan, f.nombre, isoHoy);
      if (futuras.length) {
        r.push({
          t: "danger",
          icon: "🩺",
          msg: `Incapacitado con actividad planificada — ${f.nombre}`,
          sub: `${futuras.length} actividad${futuras.length !== 1 ? "es" : ""} a partir de ${fecha(isoHoy)}. Coordinar reasignación.`,
        });
      }
    }

    // 6. Persona inactiva con actividad futura (Fase 6).
    if (alertaInactivoConActividad && f.estado === "Inactivo") {
      const futuras = actividadesFuturasDe(actividadesPlan, f.nombre, isoHoy);
      if (futuras.length) {
        r.push({
          t: "warn",
          icon: "⚠️",
          msg: `Inactivo con actividad planificada — ${f.nombre}`,
          sub: `${futuras.length} actividad${futuras.length !== 1 ? "es" : ""} a partir de ${fecha(isoHoy)}. Verificar si debe reactivarse o reasignarse.`,
        });
      }
    }
  });

  // 7. Tiempo trabajado en día libre/feriado/fuera de turno pendiente de
  //    reponer. Una alerta por funcionario con saldo pendiente, para que
  //    la administración no pierda de vista la reposición.
  if (alertaReposicionPendiente && reposiciones.length) {
    for (const fila of historialPorFuncionario(reposiciones)) {
      if (fila.pendientes === 0) continue;
      const piezas = [];
      if (fila.pend.diasEnteros) piezas.push(`${fila.pend.diasEnteros} día${fila.pend.diasEnteros !== 1 ? "s" : ""} completo${fila.pend.diasEnteros !== 1 ? "s" : ""}`);
      if (fila.pend.mediosDias) piezas.push(`${fila.pend.mediosDias} medio${fila.pend.mediosDias !== 1 ? "s" : ""} día${fila.pend.mediosDias !== 1 ? "s" : ""}`);
      if (fila.pend.horas) piezas.push(`${fila.pend.horas} h`);
      r.push({
        t: "warn",
        icon: "⟳",
        msg: `Tiempo por reponer — ${fila.funcionario}`,
        sub: `${fila.pendientes} registro${fila.pendientes !== 1 ? "s" : ""} de trabajo fuera de rol sin reponer${piezas.length ? ` (${piezas.join(", ")})` : ""}. Coordinar la reposición del tiempo.`,
      });
    }
  }

  return r.length
    ? r
    : [
        {
          t: "ok",
          icon: "✅",
          msg: "Sin alertas críticas",
          sub: "No se observan vencimientos o bloqueos críticos en los datos visibles.",
        },
      ];
}

function actividadesFuturasDe(actividadesPlan, nombre, isoHoy) {
  return (actividadesPlan || []).filter((a) => {
    if (!a || !a.inicio) return false;
    const fin = a.fin || a.inicio;
    if (fin < isoHoy) return false;
    return (a.funcionarios || []).includes(nombre);
  });
}

function toISO(d) {
  if (typeof d === "string") return d;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
