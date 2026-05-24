import { describe, it, expect } from "vitest";
import { puestoRequiereAtencionRutinaria } from "../cobertura.js";

describe("cobertura.puestoRequiereAtencionRutinaria", () => {
  it("Orosi y Quetzales requieren Visit. diario", () => {
    expect(puestoRequiereAtencionRutinaria("Puesto Orosi")).toBe(true);
    expect(puestoRequiereAtencionRutinaria("Puesto Quetzales")).toBe(true);
  });
  it("Esperanza no requiere", () => {
    expect(puestoRequiereAtencionRutinaria("Puesto Esperanza")).toBe(false);
  });
  it("Otros puestos no requieren", () => {
    expect(puestoRequiereAtencionRutinaria("Otro")).toBe(false);
    expect(puestoRequiereAtencionRutinaria("")).toBe(false);
  });
});
