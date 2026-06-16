import { describe, it, expect } from "vitest";
import {
  estaRepuesto,
  desglosePorUnidad,
  resumenReposiciones,
  ordenarPorFecha,
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
