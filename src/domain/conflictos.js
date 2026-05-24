import { dim, isoFecha } from "./fechas.js";
import { codigoRolFuncionario, esRolActivo } from "./roles.js";

export function conflictosActividadDia(actividad, dia, year, month, personas, roleData) {
  return (actividad.funcionarios || []).filter(
    (nombre) => !esRolActivo(codigoRolFuncionario(personas, roleData, year, month, nombre, dia))
  );
}

export function actividadTieneConflictoMes(actividad, year, month, personas, roleData) {
  for (let d = 1; d <= dim(year, month); d++) {
    const iso = isoFecha(year, month, d);
    if (
      iso >= actividad.inicio &&
      iso <= (actividad.fin || actividad.inicio) &&
      conflictosActividadDia(actividad, d, year, month, personas, roleData).length
    )
      return true;
  }
  return false;
}
