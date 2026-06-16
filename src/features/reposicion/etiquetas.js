/**
 * Etiquetas de presentación para la magnitud del tiempo de una
 * reposición. Se separan de la vista para reutilizarlas tanto en la
 * tabla/historial como en las marcas sobre la matriz de roles.
 *
 * Reciben `t` (de useT o del import directo de es-CR) para no acoplar el
 * dominio con la capa de i18n.
 */
export function magnitudLabel(r, t) {
  if (r?.magnitud === "horas") return t("reposicion.horasN", { n: r.horas });
  if (r?.magnitud === "medioDia") return t("modalReposicion.magnitudMedioDia");
  return t("modalReposicion.magnitudDiaEntero");
}

/** Variante en minúscula para frases ("trabajó día completo"). */
export function magnitudLabelCorta(r, t) {
  if (r?.magnitud === "horas") return t("reposicion.horasN", { n: r.horas });
  if (r?.magnitud === "medioDia") return t("reposicion.magnitudCorta.medioDia");
  return t("reposicion.magnitudCorta.diaEntero");
}
