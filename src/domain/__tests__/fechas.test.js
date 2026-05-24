import { describe, it, expect } from "vitest";
import { dim, pad2, isoFecha, fecha, faltan, primerDiaLaboral } from "../fechas.js";

describe("fechas.dim", () => {
  it("devuelve días del mes", () => {
    expect(dim(2026, 0)).toBe(31); // enero
    expect(dim(2026, 1)).toBe(28); // febrero 2026 (no bisiesto)
    expect(dim(2024, 1)).toBe(29); // febrero 2024 (bisiesto)
    expect(dim(2026, 3)).toBe(30); // abril
  });
});

describe("fechas.pad2", () => {
  it("rellena con cero a la izquierda", () => {
    expect(pad2(1)).toBe("01");
    expect(pad2(10)).toBe("10");
    expect(pad2(0)).toBe("00");
  });
});

describe("fechas.isoFecha", () => {
  it("genera YYYY-MM-DD", () => {
    expect(isoFecha(2026, 4, 19)).toBe("2026-05-19");
    expect(isoFecha(2026, 0, 1)).toBe("2026-01-01");
    expect(isoFecha(2026, 11, 31)).toBe("2026-12-31");
  });
});

describe("fechas.fecha", () => {
  it("formatea ISO como DD/MM/YYYY", () => {
    expect(fecha("2026-05-19")).toBe("19/05/2026");
    expect(fecha("")).toBe("—");
    expect(fecha(null)).toBe("—");
  });
});

describe("fechas.faltan", () => {
  it("calcula días restantes respecto al 2026-05-19 por defecto", () => {
    expect(faltan("2026-05-19")).toBe(0);
    expect(faltan("2026-05-20")).toBe(1);
    expect(faltan("2026-05-18")).toBe(-1);
    expect(faltan("")).toBeNull();
  });
});

describe("fechas.primerDiaLaboral", () => {
  it("encuentra el primer día L-V del mes", () => {
    // Mayo 2026: 1 viernes -> primer laboral es día 1
    expect(primerDiaLaboral(2026, 4)).toBe(1);
    // Noviembre 2026: 1 domingo -> primer laboral es día 2 (lunes)
    expect(primerDiaLaboral(2026, 10)).toBe(2);
  });
});
