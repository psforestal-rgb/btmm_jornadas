import { describe, it, expect } from "vitest";
import { alertas } from "../alertas.js";

const base = {
  id: "f1",
  nombre: "X User",
  cedula: "1-0000-0001",
  email: "x@y.cr",
  puesto: "Guardaparques",
  condicion: "Propiedad",
  jornada: "Ordinaria",
  modalidad: "10x5",
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

describe("alertas Fase 6 — vencimiento exactamente HOY", () => {
  it("genera danger 'vence HOY' (no 'por vencer')", () => {
    const r = alertas([
      { ...base, disponibilidad: true, contrato: "D-1", vencimiento: "2026-05-19" },
    ]);
    expect(r.some((a) => a.t === "danger" && /vence HOY/i.test(a.msg))).toBe(true);
    expect(r.some((a) => /por vencer/i.test(a.msg))).toBe(false);
  });
});

describe("alertas — tiempo pendiente de reponer", () => {
  const repo = (over = {}) => ({
    id: "r1",
    folio: "REP-001",
    funcionario: "X User",
    fecha: "2026-05-10",
    tipoDia: "Día libre",
    motivo: "Incendio forestal",
    magnitud: "diaEntero",
    horas: 0,
    estado: "Pendiente",
    fechaReposicion: "",
    ...over,
  });

  it("dispara warn por funcionario con saldo pendiente", () => {
    const r = alertas([base], { reposiciones: [repo()] });
    expect(r.some((a) => a.t === "warn" && /Tiempo por reponer — X User/.test(a.msg))).toBe(true);
  });

  it("no dispara si la reposición ya está repuesta", () => {
    const r = alertas([base], { reposiciones: [repo({ estado: "Repuesto", fechaReposicion: "2026-05-20" })] });
    expect(r.some((a) => /Tiempo por reponer/.test(a.msg))).toBe(false);
  });

  it("respeta el flag alertaReposicionPendiente=false", () => {
    const r = alertas([base], { reposiciones: [repo()], flags: { alertaReposicionPendiente: false } });
    expect(r.some((a) => /Tiempo por reponer/.test(a.msg))).toBe(false);
  });
});

describe("alertas Fase 6 — persona inactiva con actividad futura", () => {
  it("dispara warn", () => {
    const r = alertas(
      [{ ...base, nombre: "Inactivo", estado: "Inactivo" }],
      { actividadesPlan: [{ id: "a1", inicio: "2026-06-01", fin: "2026-06-01", funcionarios: ["Inactivo"] }] },
    );
    expect(r.some((a) => a.t === "warn" && /Inactivo con actividad/i.test(a.msg))).toBe(true);
  });
  it("no dispara si no hay actividad futura", () => {
    const r = alertas(
      [{ ...base, nombre: "Inactivo", estado: "Inactivo" }],
      { actividadesPlan: [{ id: "a1", inicio: "2026-04-01", fin: "2026-04-01", funcionarios: ["Inactivo"] }] },
    );
    expect(r.some((a) => /Inactivo con actividad/i.test(a.msg))).toBe(false);
  });
  it("se puede desactivar vía flags", () => {
    const r = alertas(
      [{ ...base, nombre: "Inactivo", estado: "Inactivo" }],
      {
        actividadesPlan: [{ id: "a1", inicio: "2026-06-01", fin: "2026-06-01", funcionarios: ["Inactivo"] }],
        flags: { alertaInactivoConActividad: false },
      },
    );
    expect(r.some((a) => /Inactivo con actividad/i.test(a.msg))).toBe(false);
  });
});

describe("alertas Fase 6 — incapacitado con actividad futura", () => {
  it("dispara danger", () => {
    const r = alertas(
      [{ ...base, nombre: "Incap", estado: "Incapacitado" }],
      { actividadesPlan: [{ id: "a1", inicio: "2026-06-01", funcionarios: ["Incap"] }] },
    );
    expect(r.some((a) => a.t === "danger" && /Incapacitado con actividad/i.test(a.msg))).toBe(true);
  });
});

describe("alertas Fase 6 — acumulativa sin modalidad", () => {
  it("dispara warn", () => {
    const r = alertas([{ ...base, jornada: "Acumulativa", modalidad: "", resolucion: "R-1" }]);
    expect(r.some((a) => a.t === "warn" && /sin modalidad/i.test(a.msg))).toBe(true);
  });
  it("no dispara si modalidad presente", () => {
    const r = alertas([{ ...base, jornada: "Acumulativa", modalidad: "10x5", resolucion: "R-1" }]);
    expect(r.some((a) => /sin modalidad/i.test(a.msg))).toBe(false);
  });
});

describe("alertas — backward compat (firma de 1 argumento)", () => {
  it("alertas(personas) sigue funcionando", () => {
    const r = alertas([{ ...base }]);
    expect(r).toHaveLength(1);
    expect(r[0].t).toBe("ok");
  });
});
