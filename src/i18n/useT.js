import { useCallback } from "react";
import { t } from "./es-CR.js";

/**
 * Hook delgado: devuelve la función `t(path, vars)` estable por render.
 * Pensado para usarse desde componentes; si necesita traducir fuera de
 * React, importe `t` directamente de "./es-CR.js".
 */
export function useT() {
  return useCallback((path, vars) => t(path, vars), []);
}
