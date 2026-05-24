import { describe, it, expect } from "vitest";
import { alertas } from "../alertas.js";

const base = {
  id: "f1",
  nombre: "Test User",
  cedula: "1-0000-0001",
  email: "test@sinac.go.cr",
  puesto: "Guardaparques",
  condicion: "Propiedad",
  jornada: "Ordinaria",
  modalidad: "Horario administrativo L-V",
  resolucion: "",
  disponibilidad: false,
  contrato: "",
  vencimiento: "",
  policia: false,
  brigada: false,
  ong: false,
  estado: "Activo",
  obs: "",
};

describe("alertas — sin condiciones críticas", () => {
  it("retorna OK cuando no hay vencimientos ni incoherencias", () => {
    const r = alertas([{ ...base }]);
    expect(r).toHaveLength(1);
    expect(r[0].t).toBe("ok");
    expect(r[0].msg).toMatch(/Sin alertas críticas/);
  });
});

describe("alertas — disponibilidad", () => {
  it("vencida (días < 0) genera danger", () => {
    const r = alertas([
      {
        ...base,
        disponibilidad: true,
        contrato: "DISP-01",
        vencimiento: "2026-05-01", // antes de la fecha de referencia 2026-05-19
      },
    ]);
    expect(r.some((a) => a.t === "danger" && /Disponibilidad vencida/.test(a.msg))).toBe(true);
  });
  it("por vencer (0 ≤ días ≤ 60) genera warn", () => {
    const r = alertas([
      {
        ...base,
        disponibilidad: true,
        contrato: "DISP-02",
        vencimiento: "2026-05-30",
      },
    ]);
    expect(r.some((a) => a.t === "warn" && /por vencer/i.test(a.msg))).toBe(true);
  });
  it("> 60 días no alerta", () => {
    const r = alertas([
      {
        ...base,
        disponibilidad: true,
        contrato: "DISP-03",
        vencimiento: "2026-12-31",
      },
    ]);
    expect(r.every((a) => !/Disponibilidad/.test(a.msg))).toBe(true);
  });
});

describe("alertas — resolución acumulativa", () => {
  it("Acumulativa sin resolución (no ONG) genera warn", () => {
    const r = alertas([
      { ...base, jornada: "Acumulativa", resolucion: "", ong: false },
    ]);
    expect(r.some((a) => a.t === "warn" && /Sin resolución acumulativa/.test(a.msg))).toBe(true);
  });
  it("ONG no dispara la alerta de resolución", () => {
    const r = alertas([
      { ...base, jornada: "Acumulativa", resolucion: "", ong: true },
    ]);
    expect(r.every((a) => !/Sin resolución acumulativa/.test(a.msg))).toBe(true);
  });
});

describe("alertas — incapacidad con disponibilidad activa", () => {
  it("dispara danger", () => {
    const r = alertas([
      {
        ...base,
        estado: "Incapacitado",
        disponibilidad: true,
        contrato: "DISP-04",
        vencimiento: "2026-12-31",
      },
    ]);
    expect(r.some((a) => a.t === "danger" && /Revisar disponibilidad/.test(a.msg))).toBe(true);
  });
});
