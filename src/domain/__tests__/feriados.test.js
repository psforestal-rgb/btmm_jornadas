import { describe, it, expect } from "vitest";
import { feriadosDelAno, nombreFeriado, FERIADOS_CR } from "../../data/feriadosCR.js";
import { buildFeriadosSet } from "../feriados.js";
import { primerDiaLaboral } from "../fechas.js";

describe("data.feriadosCR", () => {
  it("incluye 2025, 2026 y 2027", () => {
    expect(Object.keys(FERIADOS_CR)).toEqual(expect.arrayContaining(["2025", "2026", "2027"]));
  });
  it("feriadosDelAno devuelve un Set con ISO YYYY-MM-DD", () => {
    const s = feriadosDelAno(2026);
    expect(s instanceof Set).toBe(true);
    expect(s.has("2026-01-01")).toBe(true);
    expect(s.has("2026-12-25")).toBe(true);
  });
  it("por defecto excluye feriados no obligatorios", () => {
    const s = feriadosDelAno(2026);
    // Anexión de Nicoya 2026 está marcado como obligatorio=false (trasladado).
    expect(s.has("2026-07-25")).toBe(false);
    expect(s.has("2026-07-27")).toBe(false);
  });
  it("incluirNoObligatorios=true los incluye", () => {
    const s = feriadosDelAno(2026, true);
    expect(s.has("2026-07-27")).toBe(true);
  });
  it("nombreFeriado devuelve el nombre o null", () => {
    expect(nombreFeriado(2026, "2026-12-25")).toMatch(/Navidad/);
    expect(nombreFeriado(2026, "2026-02-15")).toBeNull();
  });
});

describe("domain.feriados.buildFeriadosSet", () => {
  it("devuelve null cuando la regla está desactivada", () => {
    expect(buildFeriadosSet(2026, { aplicarFeriadosEnPrimerDiaLaboral: false })).toBeNull();
  });
  it("devuelve Set cuando la regla está activa", () => {
    const s = buildFeriadosSet(2026, { aplicarFeriadosEnPrimerDiaLaboral: true });
    expect(s instanceof Set).toBe(true);
    expect(s.has("2026-01-01")).toBe(true);
  });
  it("reglas null/undefined devuelve null (seguro)", () => {
    expect(buildFeriadosSet(2026, null)).toBeNull();
    expect(buildFeriadosSet(2026, undefined)).toBeNull();
  });
});

describe("fechas.primerDiaLaboral con feriados", () => {
  it("sin feriados: primer día L-V de enero 2026 es jueves 1", () => {
    expect(primerDiaLaboral(2026, 0)).toBe(1);
  });
  it("con feriados que incluyen el 1 de enero: salta al día 2 (viernes)", () => {
    const feriados = new Set(["2026-01-01"]);
    expect(primerDiaLaboral(2026, 0, feriados)).toBe(2);
  });
  it("encadena: si 1 y 2 son feriados o no-laborales, devuelve el lunes 5", () => {
    const feriados = new Set(["2026-01-01", "2026-01-02"]);
    expect(primerDiaLaboral(2026, 0, feriados)).toBe(5);
  });
});
