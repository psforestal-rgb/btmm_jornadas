import { describe, it, expect } from "vitest";
import { t, lookup, format, __DICT__ } from "../es-CR.js";

describe("i18n.lookup", () => {
  it("encuentra una clave anidada", () => {
    expect(lookup("view.dashboard")).toBe("Dashboard");
    expect(lookup("app.short")).toBe("PNLQ");
  });
  it("devuelve la clave si no existe (visible en QA)", () => {
    expect(lookup("no.existe")).toBe("no.existe");
    expect(lookup("view.inexistente")).toBe("view.inexistente");
  });
  it("clave que apunta a objeto devuelve el objeto (útil para grupos)", () => {
    const v = lookup("view");
    expect(typeof v).toBe("object");
    expect(v.dashboard).toBe("Dashboard");
  });
  it("clave que apunta a array devuelve el array (para listas)", () => {
    const v = lookup("datos.porQue");
    expect(Array.isArray(v)).toBe(true);
    expect(v.length).toBeGreaterThan(0);
  });
});

describe("i18n.format", () => {
  it("interpola variables {clave}", () => {
    expect(format("Hola {nombre}", { nombre: "X" })).toBe("Hola X");
  });
  it("plantilla sin vars devuelve igual", () => {
    expect(format("Hola", undefined)).toBe("Hola");
  });
  it("variables ausentes quedan como placeholder", () => {
    expect(format("Hola {nombre}", {})).toBe("Hola {nombre}");
  });
  it("interpola multiples claves", () => {
    expect(format("{a} y {b}", { a: 1, b: 2 })).toBe("1 y 2");
  });
});

describe("i18n.t", () => {
  it("combina lookup + format", () => {
    expect(t("dashboard.bloqueHoy", { dia: 19 })).toBe("Hoy · día 19");
    expect(t("alertas.requiereAtencion", { n: 3 })).toBe("Requiere atención · 3");
  });
  it("respeta la condición rectora: la 'Regla dura' es exactamente la del prompt", () => {
    expect(t("app.reglaDura")).toMatch(/registra y alerta/);
    expect(t("app.reglaDura")).toMatch(/no genera pago/);
  });
});

describe("i18n diccionario — completitud mínima", () => {
  it("cubre todas las vistas de la app", () => {
    const vistasEsperadas = [
      "dashboard",
      "dia",
      "funcionarios",
      "roles",
      "planificacion",
      "planFuncionario",
      "adelantos",
      "disponibilidad",
      "alertas",
      "datos",
      "configuracion",
    ];
    for (const v of vistasEsperadas) {
      expect(__DICT__.view).toHaveProperty(v);
      expect(typeof __DICT__.view[v]).toBe("string");
    }
  });
  it("cubre los 4 estados de personal", () => {
    expect(Object.keys(__DICT__.estados)).toEqual(expect.arrayContaining(["activo", "inactivo", "vacaciones", "incapacitado"]));
  });
});
