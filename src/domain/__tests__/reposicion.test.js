import { describe, it, expect } from "vitest";
import {
  estaRepuesto,
  desglosePorUnidad,
  resumenReposiciones,
  ordenarPorFecha,
  folioNumero,
  siguienteFolio,
  indexarReposiciones,
  historialPorFuncionario,
  TIPOS_DIA,
  MOTIVOS,
  MAGNITUDES,
  ESTADOS,
} from "../reposicion.js";

const reg = (over = {}) => ({
  id: "x",
  funcionario: "Errol Salazar",
  fecha: "2026-05-10",
  tipoDia: "Día libre",
  motivo: "Emergencia",
  magnitud: "diaEntero",
  horas: 0,
  estado: "Pendiente",
  ...over,
});

describe("reposicion · constantes", () => {
  it("expone catálogos de opciones no vacíos", () => {
    expect(TIPOS_DIA.length).toBeGreaterThan(0);
    expect(MOTIVOS).toContain("Incendio forestal");
    expect(MAGNITUDES).toEqual(["diaEntero", "medioDia", "horas"]);
    expect(ESTADOS).toEqual(["Pendiente", "Repuesto"]);
  });
});

describe("reposicion · estaRepuesto", () => {
  it("true solo cuando estado === 'Repuesto'", () => {
    expect(estaRepuesto(reg({ estado: "Repuesto" }))).toBe(true);
    expect(estaRepuesto(reg({ estado: "Pendiente" }))).toBe(false);
    expect(estaRepuesto(undefined)).toBe(false);
  });
});

describe("reposicion · desglosePorUnidad", () => {
  it("cuenta días enteros, medios días y suma horas sueltas", () => {
    const d = desglosePorUnidad([
      reg({ magnitud: "diaEntero" }),
      reg({ magnitud: "diaEntero" }),
      reg({ magnitud: "medioDia" }),
      reg({ magnitud: "horas", horas: 4 }),
      reg({ magnitud: "horas", horas: 2.5 }),
    ]);
    expect(d).toEqual({ diasEnteros: 2, mediosDias: 1, horas: 6.5 });
  });

  it("lista vacía devuelve ceros", () => {
    expect(desglosePorUnidad([])).toEqual({ diasEnteros: 0, mediosDias: 0, horas: 0 });
  });
});

describe("reposicion · resumenReposiciones", () => {
  it("separa pendientes de repuestos con su desglose", () => {
    const r = resumenReposiciones([
      reg({ estado: "Pendiente", magnitud: "diaEntero" }),
      reg({ estado: "Pendiente", magnitud: "horas", horas: 3 }),
      reg({ estado: "Repuesto", magnitud: "medioDia" }),
    ]);
    expect(r.total).toBe(3);
    expect(r.pendientes).toBe(2);
    expect(r.repuestos).toBe(1);
    expect(r.pend).toEqual({ diasEnteros: 1, mediosDias: 0, horas: 3 });
    expect(r.rep).toEqual({ diasEnteros: 0, mediosDias: 1, horas: 0 });
  });
});

describe("reposicion · ordenarPorFecha", () => {
  it("ordena descendente sin mutar el arreglo original", () => {
    const orig = [reg({ fecha: "2026-05-01" }), reg({ fecha: "2026-05-20" }), reg({ fecha: "2026-05-10" })];
    const out = ordenarPorFecha(orig);
    expect(out.map((x) => x.fecha)).toEqual(["2026-05-20", "2026-05-10", "2026-05-01"]);
    expect(orig.map((x) => x.fecha)).toEqual(["2026-05-01", "2026-05-20", "2026-05-10"]);
  });
});

describe("reposicion · folios", () => {
  it("folioNumero extrae la parte numérica", () => {
    expect(folioNumero("REP-007")).toBe(7);
    expect(folioNumero("REP-012")).toBe(12);
    expect(folioNumero("")).toBe(null);
    expect(folioNumero(undefined)).toBe(null);
  });

  it("siguienteFolio toma el máximo + 1 con padding", () => {
    expect(siguienteFolio([])).toBe("REP-001");
    expect(siguienteFolio([reg({ folio: "REP-001" }), reg({ folio: "REP-004" })])).toBe("REP-005");
    expect(siguienteFolio([reg({ folio: "REP-009" })])).toBe("REP-010");
  });
});

describe("reposicion · indexarReposiciones", () => {
  it("indexa día trabajado siempre y día de reposición solo si está repuesto", () => {
    const items = [
      reg({ folio: "REP-001", funcionario: "Ana", fecha: "2026-05-10", estado: "Pendiente" }),
      reg({ folio: "REP-002", funcionario: "Ana", fecha: "2026-05-12", estado: "Repuesto", fechaReposicion: "2026-05-20" }),
    ];
    const { trabajadas, reposiciones } = indexarReposiciones(items);
    expect(trabajadas["Ana|2026-05-10"]?.folio).toBe("REP-001");
    expect(trabajadas["Ana|2026-05-12"]?.folio).toBe("REP-002");
    // Solo el repuesto genera marca en su fechaReposicion.
    expect(reposiciones["Ana|2026-05-20"]?.folio).toBe("REP-002");
    expect(Object.keys(reposiciones)).toHaveLength(1);
  });
});

describe("reposicion · historialPorFuncionario", () => {
  it("agrupa por funcionario y prioriza a quien tiene más pendientes", () => {
    const h = historialPorFuncionario([
      reg({ funcionario: "Ana", estado: "Repuesto", magnitud: "medioDia", fechaReposicion: "2026-05-20" }),
      reg({ funcionario: "Beto", estado: "Pendiente", magnitud: "diaEntero" }),
      reg({ funcionario: "Beto", estado: "Pendiente", magnitud: "horas", horas: 3 }),
    ]);
    expect(h).toHaveLength(2);
    expect(h[0].funcionario).toBe("Beto");
    expect(h[0].pendientes).toBe(2);
    expect(h[0].pend).toEqual({ diasEnteros: 1, mediosDias: 0, horas: 3 });
    expect(h[1].funcionario).toBe("Ana");
    expect(h[1].repuestos).toBe(1);
  });
});
