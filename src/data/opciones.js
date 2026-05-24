import { opcionesPuestoOperativo } from "./puestos.js";

export const opcionesPuesto = [
  "Administrador de ASP",
  "Guardaparques",
  "Asistente Administrativo",
  "Técnico en Recursos Naturales",
  "Personal Apoyo ONG-Invest-Volunt",
];

export const opcionesEstado = ["Activo", "Inactivo", "De vacaciones", "Incapacitado"];

export const opcionesCondicion = ["Propiedad", "Interino", "ONG-Invest-Volunt"];

export const opcionesModalidad = [
  "Horario administrativo L-V",
  "10x5",
  "12x6",
  "14x7",
  "16x8",
  "20x10",
];

export const opcionesLugarActividad = [
  ...opcionesPuestoOperativo,
  "Secretaría Ejecutiva/Dirección ACC",
];

export const actividadRutinariaVisitantes = "Atención rutinaria de visitantes";

export const opcionesActividadBase = [actividadRutinariaVisitantes];
