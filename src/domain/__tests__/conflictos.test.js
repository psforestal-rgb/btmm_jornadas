import { describe, it, expect } from "vitest";
import { conflictosActividadDia, actividadTieneConflictoMes } from "../conflictos.js";

const personas = [
  { id: "f1", nombre: "Errol Salazar", puestoOperativo: "Puesto Orosi", modalidad: "10x5" },
];

describe("conflictos", () => {
  it("reporta nombres con rol no-activo", () => {
    // primer día laboral 2026-05 es viernes 1 → T1; mayo 12 cae en T (día 12: T12) — todavía en turno con 10x5
    // mayo 16 cae en L1 (día 11 → L1)
    const actividad = {
      id: "a1",
      titulo: "X",
      inicio: "2026-05-13",
      fin: "2026-05-13",
      funcionarios: ["Errol Salazar"],
    };
    // 13 mayo: día 13 - inicio 1 = 12 % 15 = 12 → trabajo 10, libre 5 → 12 >= 10 → L3 (no activo)
    const conf = conflictosActividadDia(actividad, 13, 2026, 4, personas, {});
    expect(conf).toEqual(["Errol Salazar"]);
  });
  it("vacío si todos están en turno", () => {
    const actividad = {
      id: "a2",
      titulo: "Y",
      inicio: "2026-05-05",
      fin: "2026-05-05",
      funcionarios: ["Errol Salazar"],
    };
    // 5 mayo: día 5 - inicio 1 = 4 % 15 = 4 < 10 → T5 (activo)
    const conf = conflictosActividadDia(actividad, 5, 2026, 4, personas, {});
    expect(conf).toEqual([]);
  });
  it("actividadTieneConflictoMes detecta conflicto en al menos un día", () => {
    const actividad = {
      id: "a3",
      titulo: "Z",
      inicio: "2026-05-11",
      fin: "2026-05-15",
      funcionarios: ["Errol Salazar"],
    };
    expect(actividadTieneConflictoMes(actividad, 2026, 4, personas, {})).toBe(true);
  });
});
