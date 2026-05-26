/**
 * Calendario de feriados de pago obligatorio en Costa Rica.
 *
 * Fuente base: Código de Trabajo art. 148 y comunicados del Ministerio de
 * Trabajo y Seguridad Social (MTSS). Se incluyen también los feriados de
 * pago no obligatorio (San Ramón, Anexión, Día de los Difuntos) para que
 * el administrador pueda decidir si afectan o no la rotación interna.
 *
 * Para los traslados anuales (Ley 9803 y modificaciones), se anotan las
 * fechas observadas según el comunicado MTSS del año en cuestión.
 *
 * Formato: ISO YYYY-MM-DD por año. El objeto es plano para facilitar
 * edición (CSV → JSON) e importación futura desde panel administrativo.
 */

export const FERIADOS_CR = {
  2025: [
    { fecha: "2025-01-01", nombre: "Año Nuevo", obligatorio: true },
    { fecha: "2025-04-11", nombre: "Juan Santamaría (trasladado a viernes)", obligatorio: true },
    { fecha: "2025-04-17", nombre: "Jueves Santo", obligatorio: true },
    { fecha: "2025-04-18", nombre: "Viernes Santo", obligatorio: true },
    { fecha: "2025-05-01", nombre: "Día del Trabajo", obligatorio: true },
    { fecha: "2025-07-25", nombre: "Anexión del Partido de Nicoya", obligatorio: false },
    { fecha: "2025-08-02", nombre: "Virgen de los Ángeles", obligatorio: true },
    { fecha: "2025-08-15", nombre: "Día de la Madre", obligatorio: true },
    { fecha: "2025-09-15", nombre: "Independencia", obligatorio: true },
    { fecha: "2025-12-01", nombre: "Abolición del Ejército", obligatorio: true },
    { fecha: "2025-12-25", nombre: "Navidad", obligatorio: true },
  ],
  2026: [
    { fecha: "2026-01-01", nombre: "Año Nuevo", obligatorio: true },
    { fecha: "2026-04-02", nombre: "Jueves Santo", obligatorio: true },
    { fecha: "2026-04-03", nombre: "Viernes Santo", obligatorio: true },
    { fecha: "2026-04-13", nombre: "Juan Santamaría (trasladado a lunes)", obligatorio: true },
    { fecha: "2026-05-01", nombre: "Día del Trabajo", obligatorio: true },
    { fecha: "2026-07-27", nombre: "Anexión del Partido de Nicoya (trasladado)", obligatorio: false },
    { fecha: "2026-08-02", nombre: "Virgen de los Ángeles", obligatorio: true },
    { fecha: "2026-08-17", nombre: "Día de la Madre (trasladado a lunes)", obligatorio: true },
    { fecha: "2026-09-14", nombre: "Independencia (trasladado a lunes)", obligatorio: true },
    { fecha: "2026-11-30", nombre: "Abolición del Ejército (trasladado a lunes)", obligatorio: true },
    { fecha: "2026-12-25", nombre: "Navidad", obligatorio: true },
  ],
  2027: [
    { fecha: "2027-01-01", nombre: "Año Nuevo", obligatorio: true },
    { fecha: "2027-03-25", nombre: "Jueves Santo", obligatorio: true },
    { fecha: "2027-03-26", nombre: "Viernes Santo", obligatorio: true },
    { fecha: "2027-04-12", nombre: "Juan Santamaría (trasladado a lunes)", obligatorio: true },
    { fecha: "2027-05-01", nombre: "Día del Trabajo", obligatorio: true },
    { fecha: "2027-07-26", nombre: "Anexión del Partido de Nicoya (trasladado)", obligatorio: false },
    { fecha: "2027-08-02", nombre: "Virgen de los Ángeles", obligatorio: true },
    { fecha: "2027-08-16", nombre: "Día de la Madre (trasladado a lunes)", obligatorio: true },
    { fecha: "2027-09-13", nombre: "Independencia (trasladado a lunes)", obligatorio: true },
    { fecha: "2027-11-29", nombre: "Abolición del Ejército (trasladado a lunes)", obligatorio: true },
    { fecha: "2027-12-25", nombre: "Navidad", obligatorio: true },
  ],
};

/**
 * Devuelve un Set de fechas ISO (YYYY-MM-DD) consideradas no laborales
 * para el año indicado. Por defecto solo los obligatorios; si se pasa
 * `incluirNoObligatorios=true`, también suma los de pago no obligatorio.
 */
export function feriadosDelAno(year, incluirNoObligatorios = false) {
  const lista = FERIADOS_CR[year] || [];
  return new Set(
    lista
      .filter((f) => incluirNoObligatorios || f.obligatorio)
      .map((f) => f.fecha),
  );
}

export function nombreFeriado(year, iso) {
  const lista = FERIADOS_CR[year] || [];
  return lista.find((f) => f.fecha === iso)?.nombre || null;
}
