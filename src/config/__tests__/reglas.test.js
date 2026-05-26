import { describe, it, expect } from "vitest";
import { REGLAS_DEFAULT, mergeReglas, validarReglas, VIATICOS_OBJETIVO_OPCIONES } from "../reglas.js";

describe("reglas — defaults", () => {
  it("incluye Orosi y Quetzales en Visit. diaria", () => {
    expect(REGLAS_DEFAULT.puestosRequierenVisitantesDiario).toEqual(["Puesto Orosi", "Puesto Quetzales"]);
  });
  it("día de corte 15, mes objetivo siguiente, consulta permitida", () => {
    expect(REGLAS_DEFAULT.diaCorteViaticos).toBe(15);
    expect(REGLAS_DEFAULT.mesObjetivoViaticos).toBe("siguiente");
    expect(REGLAS_DEFAULT.permitirConsultaDespuesCierre).toBe(true);
  });
});

describe("reglas — mergeReglas", () => {
  it("rellena campos faltantes con defaults", () => {
    const r = mergeReglas({ diaCorteViaticos: 10 });
    expect(r.diaCorteViaticos).toBe(10);
    expect(r.mesObjetivoViaticos).toBe("siguiente");
    expect(r.puestosRequierenVisitantesDiario).toEqual(REGLAS_DEFAULT.puestosRequierenVisitantesDiario);
  });
  it("acepta objeto vacío", () => {
    expect(mergeReglas({})).toEqual({ ...REGLAS_DEFAULT });
  });
  it("acepta undefined", () => {
    expect(mergeReglas()).toEqual({ ...REGLAS_DEFAULT });
  });
});

describe("reglas — validarReglas", () => {
  it("defaults pasan sin advertencias", () => {
    expect(validarReglas(REGLAS_DEFAULT)).toEqual([]);
  });
  it("día de corte fuera de rango falla", () => {
    expect(validarReglas({ ...REGLAS_DEFAULT, diaCorteViaticos: 0 })).toEqual(expect.arrayContaining([expect.stringMatching(/Día de corte/)]));
    expect(validarReglas({ ...REGLAS_DEFAULT, diaCorteViaticos: 30 })).toEqual(expect.arrayContaining([expect.stringMatching(/Día de corte/)]));
  });
  it("mesObjetivo desconocido falla", () => {
    expect(validarReglas({ ...REGLAS_DEFAULT, mesObjetivoViaticos: "raro" })).toEqual(expect.arrayContaining([expect.stringMatching(/mesObjetivoViaticos/)]));
  });
  it("lista de puestos con valores desconocidos genera aviso", () => {
    const w = validarReglas({ ...REGLAS_DEFAULT, puestosRequierenVisitantesDiario: ["Marte"] });
    expect(w.some((m) => /no reconocido/i.test(m))).toBe(true);
  });
  it("puestosRequieren no-array falla", () => {
    expect(validarReglas({ ...REGLAS_DEFAULT, puestosRequierenVisitantesDiario: "noEsArray" }).length).toBeGreaterThan(0);
  });
});

describe("VIATICOS_OBJETIVO_OPCIONES", () => {
  it("contiene exactamente 'siguiente' y 'actual'", () => {
    expect(VIATICOS_OBJETIVO_OPCIONES).toEqual(["siguiente", "actual"]);
  });
});
