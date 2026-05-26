/**
 * Diccionario es-CR de la herramienta. Cada clave usa notación punteada
 * (`grupo.subgrupo.clave`). Los valores admiten plantillas estilo
 * `{nombre}` que el hook `useT()` interpola con un objeto.
 *
 * Convenciones:
 * - terminología institucional SINAC/PNLQ:
 *   "Visit." = atención rutinaria de visitantes
 *   "Acumulativa" = jornada acumulativa por turno
 *   "ONG-Invest-Volunt" = personal de apoyo externo
 * - "Regla dura": la herramienta solo registra y alerta.
 */
const dict = {
  app: {
    name: "PNLQ — Gestión de Jornadas Laborales",
    short: "PNLQ",
    estado: "Activo",
    reglaDura:
      "Regla dura: el sistema registra y alerta; no genera pago, reposición, suspensión o derecho automático.",
  },
  view: {
    dashboard: "Dashboard",
    dia: "Detalle del día",
    funcionarios: "Funcionarios",
    roles: "Roles",
    planificacion: "Planificación general",
    planFuncionario: "Planificación/Funcionario",
    adelantos: "Adelanto de viáticos",
    disponibilidad: "Disponibilidad",
    alertas: "Alertas",
    datos: "Datos · respaldo",
    configuracion: "Configuración",
  },
  topbar: {
    mesAnterior: "Mes anterior",
    mesSiguiente: "Mes siguiente",
    mes: "Mes",
    anio: "Año",
    vistaCompacta: "Vista compacta",
    vistaAmplia: "Vista amplia",
  },
  dashboard: {
    bloqueHoy: "Hoy · día {dia}",
    bloqueMes: "Este mes · {mes} {anio}",
    verDia: "Ver detalle del día →",
    badgeHoy: "Hoy",
    badgeMes: "Mes",
    coberturaTitulo: "Cobertura por puesto operativo — {mes} {anio}",
    leyendaTurno: "Turno = rol activo",
    leyendaPlan: "Plan = actividad",
    leyendaVisit: "Visit. = atención visitantes",
    sinVisit: "{n} días sin Visit.",
    visitCubierta: "Visit. cubierta",
    sinPlan: "{n} días sin Plan",
    planCompleto: "Plan completo",
    requiereVisitDiario: "Requiere Visit. diario",
  },
  kpi: {
    coberturaCritica: "Cobertura crítica",
    coberturaCriticaSub: "días sin Visit. asignada",
    sinActividad: "Sin actividad",
    sinActividadSub: "en turno hoy sin planificar",
    porVencer: "Por vencer",
    porVencerSub: "disponibilidades ≤30 días",
    personalActivo: "Personal activo",
    enTurno: "En turno",
    conActividad: "Con actividad",
    fueraDeTurno: "Fuera de turno",
    conViatico: "Con viático",
  },
  alertas: {
    requiereAtencion: "Requiere atención · {n}",
    sinCriticas: "Sin alertas críticas",
    sinCriticasSub: "No se observan vencimientos o bloqueos críticos en los datos visibles.",
    venceHoy: "Disponibilidad vence HOY — {nombre}",
    vencida: "Disponibilidad vencida — {nombre}",
    porVencer: "Disponibilidad por vencer — {nombre}",
    sinResolucion: "Sin resolución acumulativa — {nombre}",
    sinModalidad: "Acumulativa sin modalidad definida — {nombre}",
    incapaConDisp: "Revisar disponibilidad — {nombre}",
    incapaConActividad: "Incapacitado con actividad planificada — {nombre}",
    inactivoConActividad: "Inactivo con actividad planificada — {nombre}",
  },
  acciones: {
    aceptar: "Aceptar",
    cancelar: "Cancelar",
    cerrar: "Cerrar",
    guardar: "Guardar",
    eliminar: "Eliminar",
    agregar: "Agregar",
    editar: "Editar",
    confirmar: "Confirmar",
    restaurar: "Restaurar",
    exportar: "Exportar JSON",
    importar: "Importar JSON…",
    reiniciar: "Reiniciar datos semilla",
    aplicarCambios: "Aplicar cambios…",
    actualizarAhora: "Actualizar ahora",
    verLuego: "Ver luego",
  },
  estados: {
    activo: "Activo",
    inactivo: "Inactivo",
    vacaciones: "De vacaciones",
    incapacitado: "Incapacitado",
  },
  modal: {
    nuevaVersion: "Nueva versión disponible",
    versionDesactualizada: "Versión desactualizada",
    instalarTitulo: "Instalar PNLQ en este dispositivo",
    instalarSub: "Acceso sin internet · Pantalla completa · Sin navegador",
    sinConexion: "Sin conexión — mostrando datos en caché",
    ultimaCarga: "Última carga local: {fecha}",
  },
};

/**
 * Interpola `{clave}` con valores de `vars`. Si la clave no existe,
 * devuelve el placeholder inalterado para detectarlo en QA.
 */
export function format(plantilla, vars) {
  if (!plantilla || !vars) return plantilla;
  return plantilla.replace(/\{(\w+)\}/g, (m, key) => (vars[key] !== undefined ? String(vars[key]) : m));
}

/**
 * Busca la cadena por ruta punteada en el diccionario. Devuelve la
 * propia clave si no se encuentra, para que en pantalla quede visible
 * qué texto falta traducir.
 */
export function lookup(path) {
  const partes = String(path || "").split(".");
  let cur = dict;
  for (const p of partes) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

/**
 * API principal: `t("dashboard.bloqueHoy", { dia: 19 })`.
 * Es función directa (no hook) para que pueda usarse en módulos no React.
 */
export function t(path, vars) {
  return format(lookup(path), vars);
}

export const __DICT__ = dict;
