/**
 * Validadores puros para datos de entrada. Devuelven `null` si el valor es
 * válido o un string con la descripción del problema.
 *
 * Filosofía: las validaciones sirven para mostrar advertencias y guiar al
 * usuario, NO para bloquear el guardado. La operación de campo siempre
 * debe poder registrar el dato; las advertencias quedan visibles.
 */

/** Cédula CR formato 1-XXXX-XXXX (también acepta 9 dígitos sin guiones). */
export function validarCedula(s) {
  if (!s) return null // opcional, no se exige aquí
  const v = String(s).trim()
  if (/^\d-\d{4}-\d{4}$/.test(v)) return null
  if (/^\d{9}$/.test(v)) return null
  return "Cédula con formato inesperado (use 1-XXXX-XXXX o 9 dígitos).";
}

/** Email simple: presencia de @ y dominio con punto. */
export function validarCorreo(s) {
  if (!s) return null
  const v = String(s).trim()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null
  return "Correo con formato inesperado.";
}

/** Devuelve null si fin ≥ inicio. Ambas en YYYY-MM-DD. */
export function validarRangoFechas(inicio, fin) {
  if (!inicio || !fin) return null
  if (fin < inicio) return "Fecha final anterior a fecha de inicio."
  return null
}

/**
 * Detecta traslapes de actividades para un mismo funcionario.
 * Considera el rango [inicio, fin] inclusivo. Devuelve la lista de
 * actividades que se solapan (excluyendo la propia por id).
 */
export function detectarTraslape(actividadNueva, todas) {
  const ini = actividadNueva.inicio
  const fin = actividadNueva.fin || actividadNueva.inicio
  const funcs = new Set(actividadNueva.funcionarios || [])
  if (!ini || funcs.size === 0) return []
  return todas.filter((a) => {
    if (a.id === actividadNueva.id) return false
    const aIni = a.inicio
    const aFin = a.fin || a.inicio
    if (!aIni) return false
    if (aFin < ini || aIni > fin) return false
    return (a.funcionarios || []).some((n) => funcs.has(n))
  })
}

/**
 * Resumen de validaciones para un funcionario antes de guardar. Devuelve
 * un arreglo de mensajes (puede estar vacío). El llamador decide si
 * mostrarlos como advertencia o bloqueante.
 */
export function validarFuncionario(f) {
  const w = []
  if (!f?.nombre?.trim()) w.push("Nombre obligatorio.")
  const c = validarCedula(f?.cedula)
  if (c) w.push(c)
  const e = validarCorreo(f?.email)
  if (e) w.push(e)
  if (f?.disponibilidad && !f?.vencimiento) w.push("Disponibilidad activada sin fecha de vencimiento.")
  if (f?.jornada === "Acumulativa" && !f?.resolucion && !f?.ong) {
    w.push("Jornada acumulativa sin número de resolución (puede operar; revisar respaldo).")
  }
  return w
}

/**
 * Validación equivalente para actividades.
 */
export function validarActividad(a, todas = []) {
  const w = []
  if (!a?.titulo?.trim()) w.push("Título obligatorio.")
  if (!a?.inicio) w.push("Fecha de inicio obligatoria.")
  const r = validarRangoFechas(a?.inicio, a?.fin || a?.inicio)
  if (r) w.push(r)
  if (!a?.funcionarios || a.funcionarios.length === 0) w.push("Sin funcionarios asignados.")
  const tras = detectarTraslape(a, todas)
  if (tras.length) {
    const titulos = tras.map((x) => x.titulo).join(" · ")
    w.push(`Traslape con ${tras.length} actividad${tras.length > 1 ? "es" : ""}: ${titulos}`)
  }
  return w
}
