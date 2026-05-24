import { faltan, fecha } from "./fechas.js";

export function alertas(personas) {
  const r = [];
  personas.forEach((f) => {
    const d = faltan(f.vencimiento);
    if (f.disponibilidad && d !== null && d <= 60) {
      r.push({
        t: d < 0 ? "danger" : "warn",
        icon: d < 0 ? "🚨" : "⚠️",
        msg: `${d < 0 ? "Disponibilidad vencida" : "Disponibilidad por vencer"} — ${f.nombre}`,
        sub: `${f.contrato} · vence ${fecha(f.vencimiento)}. Requiere revisión administrativa.`,
      });
    }
    if (f.jornada === "Acumulativa" && !f.resolucion && !f.ong) {
      r.push({
        t: "warn",
        icon: "📄",
        msg: `Sin resolución acumulativa — ${f.nombre}`,
        sub: "Dato pendiente: no automatizar efectos hasta confirmar respaldo interno.",
      });
    }
    if (f.estado === "Incapacitado" && f.disponibilidad) {
      r.push({
        t: "danger",
        icon: "🩺",
        msg: `Revisar disponibilidad — ${f.nombre}`,
        sub: "Verificar días naturales de ausencia y criterio RH.",
      });
    }
  });
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
