import { feriadosDelAno } from "../data/feriadosCR.js";

/**
 * Construye el `Set<string>` de fechas ISO de feriados aplicables al año,
 * o `null` si la regla está desactivada. Devolver `null` (en lugar de Set
 * vacío) permite que las funciones de dominio reconozcan el caso "no
 * aplicar feriados" sin overhead.
 */
export function buildFeriadosSet(year, reglas) {
  if (!reglas?.aplicarFeriadosEnPrimerDiaLaboral) return null;
  return feriadosDelAno(year, false);
}
