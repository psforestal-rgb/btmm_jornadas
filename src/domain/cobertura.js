const DEFAULT_PUESTOS_REQUIEREN = ["Puesto Orosi", "Puesto Quetzales"];

/**
 * Devuelve true si el puesto operativo requiere "Atención rutinaria de
 * visitantes" todos los días. La lista se acepta como argumento para
 * permitir parametrización desde la configuración del administrador
 * (Fase 6). Si no se pasa nada, mantiene el comportamiento histórico.
 */
export function puestoRequiereAtencionRutinaria(puesto, puestosRequieren) {
  const lista = puestosRequieren || DEFAULT_PUESTOS_REQUIEREN;
  return lista.includes(puesto);
}
