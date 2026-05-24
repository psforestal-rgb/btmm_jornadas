import { actividadRutinariaVisitantes } from "../data/opciones.js";

export function actividadesEnDia(actividadesPlan, iso) {
  return actividadesPlan.filter((a) => iso >= a.inicio && iso <= (a.fin || a.inicio));
}

export function esAtencionRutinaria(a) {
  return String(a?.titulo || "").trim().toLowerCase() === actividadRutinariaVisitantes.toLowerCase();
}
