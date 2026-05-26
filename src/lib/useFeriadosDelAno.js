import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { buildFeriadosSet } from "../domain/feriados.js";

/**
 * Devuelve el Set de feriados aplicables al año, o null si la regla
 * `aplicarFeriadosEnPrimerDiaLaboral` está desactivada. Memoizado por
 * (year, reglas).
 */
export function useFeriadosDelAno(year) {
  const { reglas } = useApp();
  return useMemo(() => buildFeriadosSet(year, reglas), [year, reglas]);
}
