import { describe, it, expect } from "vitest";
import { actividadesEnDia, esAtencionRutinaria } from "../actividades.js";

const plan = [
  { id: "a1", titulo: "Atención rutinaria de visitantes", inicio: "2026-05-06", fin: "2026-05-06", funcionarios: [] },
  { id: "a2", titulo: "Gira", inicio: "2026-05-12", fin: "2026-05-13", funcionarios: [] },
  { id: "a3", titulo: "Otro", inicio: "2026-05-10", fin: "2026-05-10", funcionarios: [] },
];

describe("actividades.actividadesEnDia", () => {
  it("filtra por rango inclusivo", () => {
    expect(actividadesEnDia(plan, "2026-05-06").map((a) => a.id)).toEqual(["a1"]);
    expect(actividadesEnDia(plan, "2026-05-12").map((a) => a.id)).toEqual(["a2"]);
    expect(actividadesEnDia(plan, "2026-05-13").map((a) => a.id)).toEqual(["a2"]);
    expect(actividadesEnDia(plan, "2026-05-15").map((a) => a.id)).toEqual([]);
  });
});

describe("actividades.esAtencionRutinaria", () => {
  it("reconoce atención rutinaria (case-insensitive, trim)", () => {
    expect(esAtencionRutinaria({ titulo: "Atención rutinaria de visitantes" })).toBe(true);
    expect(esAtencionRutinaria({ titulo: "  ATENCIÓN RUTINARIA DE VISITANTES  " })).toBe(true);
    expect(esAtencionRutinaria({ titulo: "Gira" })).toBe(false);
    expect(esAtencionRutinaria({})).toBe(false);
    expect(esAtencionRutinaria(null)).toBe(false);
  });
});
