/**
 * Etiquetas de presentación para la magnitud y el saldo de una
 * reposición. Se separan de la vista para reutilizarlas en la
 * tabla/historial, las marcas sobre la matriz de roles y los diálogos.
 *
 * Reciben `t` (de useT o del import directo de es-CR) para no acoplar el
 * dominio con la capa de i18n.
 */

/** Formatea un número de horas sin decimales superfluos: 4 → "4", 2.5 → "2.5". */
export function formatNum(n) {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
}

/** Etiqueta de una magnitud o cuota (día/medio día/horas). */
export function magnitudLabel(r, t) {
  if (r?.magnitud === "horas") return t("reposicion.horasN", { n: formatNum(r.horas) });
  if (r?.magnitud === "medioDia") return t("modalReposicion.magnitudMedioDia");
  return t("modalReposicion.magnitudDiaEntero");
}

/** Variante en minúscula para frases ("trabajó día completo"). */
export function magnitudLabelCorta(r, t) {
  if (r?.magnitud === "horas") return t("reposicion.horasN", { n: formatNum(r.horas) });
  if (r?.magnitud === "medioDia") return t("reposicion.magnitudCorta.medioDia");
  return t("reposicion.magnitudCorta.diaEntero");
}

/**
 * Texto legible para un saldo en horas, expresándolo en días cuando calza
 * con la jornada (1 día, ½ día) y en horas en caso contrario.
 */
export function saldoTexto(horas, hj = 8) {
  const h = Math.round((Number(horas) || 0) * 100) / 100;
  if (h <= 0) return "0 h";
  const dias = h / hj;
  if (Number.isInteger(dias)) return dias === 1 ? "1 día" : `${dias} días`;
  if (h === hj / 2) return "½ día";
  return `${formatNum(h)} h`;
}
