/**
 * Datos semilla para el registro de Reposición de tiempo.
 *
 * Cada registro documenta una jornada que la administración requirió
 * trabajar a un funcionario en día libre, feriado o fuera de turno
 * (emergencias, incendios, atención de denuncias, actividades
 * especiales, etc.) para luego reponerle el tiempo trabajado. La
 * magnitud puede ser por horas, medio día o día entero.
 */
export const baseReposiciones = [
  {
    id: "rep1",
    funcionario: "Errol Salazar",
    fecha: "2026-05-24",
    tipoDia: "Día libre",
    motivo: "Incendio forestal",
    motivoDetalle: "Apoyo en control de conato sector Orosi.",
    magnitud: "diaEntero",
    horas: 0,
    estado: "Pendiente",
    fechaReposicion: "",
    observaciones: "Llamado por la administración fuera de rol.",
  },
  {
    id: "rep2",
    funcionario: "Juan Pablo Granados",
    fecha: "2026-05-17",
    tipoDia: "Feriado",
    motivo: "Atención de denuncia",
    motivoDetalle: "Inspección por tala reportada en ingreso Quetzales.",
    magnitud: "horas",
    horas: 4,
    estado: "Pendiente",
    fechaReposicion: "",
    observaciones: "",
  },
  {
    id: "rep3",
    funcionario: "Mariano Solís",
    fecha: "2026-04-19",
    tipoDia: "Fuera de turno",
    motivo: "Actividad especial",
    motivoDetalle: "Atención de gira institucional.",
    magnitud: "medioDia",
    horas: 0,
    estado: "Repuesto",
    fechaReposicion: "2026-05-06",
    observaciones: "Tiempo repuesto en coordinación con la administración.",
  },
];
