/**
 * Reglas de negocio configurables por el administrador.
 *
 * Todas estas reglas eran constantes hardcoded en versiones previas. Ahora
 * viven en un objeto único que el AppContext expone y el usuario puede
 * editar desde la vista "Configuración". Los cambios se persisten en
 * localStorage junto con el resto del estado (campo `reglas`).
 *
 * Filosofía: la herramienta sigue siendo "registra y alerta, no ejecuta".
 * Cambiar una regla solo afecta el cómo se generan las alertas y se calcula
 * la cobertura/viáticos; nunca produce un derecho económico automático.
 */

import { opcionesPuestoOperativo } from "../data/puestos.js";

export const REGLAS_DEFAULT = Object.freeze({
  /**
   * Puestos operativos que requieren "Atención rutinaria de visitantes"
   * todos los días. Si un día no tiene a nadie asignado a esa actividad
   * en uno de estos puestos, se marca cobertura crítica (rojo).
   */
  puestosRequierenVisitantesDiario: ["Puesto Orosi", "Puesto Quetzales"],

  /**
   * Día del mes (1..28) que cierra el plazo administrativo para tramitar
   * adelantos de viático del mes siguiente.
   */
  diaCorteViaticos: 15,

  /**
   * "siguiente" (mes próximo) o "actual" (mismo mes). El default sigue la
   * directriz vigente del SINAC: viáticos se tramitan para el mes siguiente.
   */
  mesObjetivoViaticos: "siguiente",

  /**
   * Si es true, después del corte el listado de viáticos sigue siendo
   * consultable (con banner clausurado en rojo). Si es false, se oculta.
   * Por defecto true para no perder visibilidad.
   */
  permitirConsultaDespuesCierre: true,

  /**
   * Considera feriados oficiales al calcular el "primer día laboral" del
   * mes para iniciar la rotación de turnos.
   */
  aplicarFeriadosEnPrimerDiaLaboral: true,

  /**
   * Activar alertas adicionales sobre estados especiales del personal.
   */
  alertaInactivoConActividad: true,
  alertaIncapacitadoConActividad: true,
  alertaAcumulativaSinModalidad: true,
});

export const VIATICOS_OBJETIVO_OPCIONES = ["siguiente", "actual"];

/**
 * Mezcla un objeto de reglas parcial con los defaults, asegurando que
 * todos los campos existan aún si la versión persistida es más antigua.
 */
export function mergeReglas(parcial = {}) {
  return { ...REGLAS_DEFAULT, ...parcial };
}

/**
 * Validación liviana de un objeto de reglas. Devuelve un arreglo de
 * mensajes de advertencia (no bloqueante). El llamador decide qué hacer.
 */
export function validarReglas(r) {
  const w = [];
  if (!Array.isArray(r.puestosRequierenVisitantesDiario)) {
    w.push("La lista de puestos con Visit. diario debe ser un arreglo.");
  } else {
    const desconocidos = r.puestosRequierenVisitantesDiario.filter(
      (p) => !opcionesPuestoOperativo.includes(p),
    );
    if (desconocidos.length) {
      w.push(`Puesto(s) no reconocido(s) en la lista de Visit. diaria: ${desconocidos.join(", ")}`);
    }
  }
  const dc = Number(r.diaCorteViaticos);
  if (!Number.isInteger(dc) || dc < 1 || dc > 28) {
    w.push("Día de corte de viáticos debe ser un entero entre 1 y 28.");
  }
  if (!VIATICOS_OBJETIVO_OPCIONES.includes(r.mesObjetivoViaticos)) {
    w.push(`mesObjetivoViaticos debe ser uno de: ${VIATICOS_OBJETIVO_OPCIONES.join(", ")}.`);
  }
  return w;
}
