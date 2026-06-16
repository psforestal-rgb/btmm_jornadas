import { describe, it, expect } from "vitest";
import {
  estaRepuesto,
  estadoReposicion,
  horasDeMagnitud,
  horasTrabajadas,
  horasRepuestas,
  saldoHoras,
  cuotasDe,
  resumenReposiciones,
  ordenarPorFecha,
  folioNumero,
  siguienteFolio,
  indexarReposiciones,
  historialPorFuncionario,
  saldoFuncionario,
  registrosConSaldoDe,
  TIPOS_DIA,
  MOTIVOS,
  MAGNITUDES,
  ESTADOS,
} from "../reposicion.js";

const reg = (over = {}) => ({
  id: "x",
  folio: "REP-000",
  funcionario: "Errol Salazar",
  fecha: "2026-05-10",
  tipoDia: "Día libre",
  motivo: "Emergencia",
  magnitud: "diaEntero",
  horas: 0,
  cuotas: [],
  ...over,
});

const cuota = (over = {}) => ({ id: "c", fecha: "2026-05-20", magnitud: "diaEntero", horas: 0, ...over });

describe("reposicion · constantes", () => {
  it("expone catálogos de opciones", () => {
    expect(TIPOS_DIA.length).toBeGreaterThan(0);
    expect(MOTIVOS).toContain("Incendio forestal");
    expect(MAGNITUDES).toEqual(["diaEntero", "medioDia", "horas"]);
    expect(ESTADOS).toEqual(["Pendiente", "Parcial", "Repuesto"]);
  });
});

describe("reposicion · conversión a horas", () => {
  it("horasDeMagnitud usa la jornada para día/medio y el valor para horas", () => {
    expect(horasDeMagnitud("diaEntero", 0, 8)).toBe(8);
    expect(horasDeMagnitud("medioDia", 0, 8)).toBe(4);
    expect(horasDeMagnitud("horas", 3.5, 8)).toBe(3.5);
    expect(horasDeMagnitud("diaEntero", 0, 12)).toBe(12);
  });
});

describe("reposicion · saldo parcial", () => {
  it("día completo trabajado y medio día repuesto deja saldo de medio día (Parcial)", () => {
    const r = reg({ magnitud: "diaEntero", cuotas: [cuota({ magnitud: "medioDia" })] });
    expect(horasTrabajadas(r, 8)).toBe(8);
    expect(horasRepuestas(r, 8)).toBe(4);
    expect(saldoHoras(r, 8)).toBe(4);
    expect(estadoReposicion(r, 8)).toBe("Parcial");
    expect(estaRepuesto(r, 8)).toBe(false);
  });

  it("sin cuotas: Pendiente con saldo completo", () => {
    const r = reg({ magnitud: "diaEntero" });
    expect(estadoReposicion(r, 8)).toBe("Pendiente");
    expect(saldoHoras(r, 8)).toBe(8);
  });

  it("cuotas que cubren el total: Repuesto, saldo 0", () => {
    const r = reg({ magnitud: "diaEntero", cuotas: [cuota({ magnitud: "medioDia" }), cuota({ id: "c2", magnitud: "medioDia" })] });
    expect(estadoReposicion(r, 8)).toBe("Repuesto");
    expect(saldoHoras(r, 8)).toBe(0);
    expect(estaRepuesto(r, 8)).toBe(true);
  });

  it("la jornada configurable cambia la equivalencia", () => {
    const r = reg({ magnitud: "diaEntero", cuotas: [cuota({ magnitud: "horas", horas: 6 })] });
    expect(saldoHoras(r, 12)).toBe(6); // día = 12h, repuesto 6h
    expect(saldoHoras(r, 8)).toBe(2); // día = 8h, repuesto 6h
  });
});

describe("reposicion · cuotasDe (compatibilidad)", () => {
  it("migra datos antiguos (estado Repuesto sin cuotas) a una cuota equivalente", () => {
    const legacy = { id: "L", magnitud: "medioDia", estado: "Repuesto", fechaReposicion: "2026-05-06" };
    const c = cuotasDe(legacy);
    expect(c).toHaveLength(1);
    expect(c[0].fecha).toBe("2026-05-06");
    expect(estadoReposicion(legacy, 8)).toBe("Repuesto");
  });

  it("datos antiguos pendientes no generan cuotas", () => {
    expect(cuotasDe({ id: "L", magnitud: "diaEntero", estado: "Pendiente" })).toEqual([]);
  });
});

describe("reposicion · resumenReposiciones", () => {
  it("cuenta por estado y suma el saldo en horas", () => {
    const r = resumenReposiciones(
      [
        reg({ magnitud: "diaEntero" }), // pendiente 8h
        reg({ magnitud: "diaEntero", cuotas: [cuota({ magnitud: "medioDia" })] }), // parcial 4h
        reg({ magnitud: "medioDia", cuotas: [cuota({ magnitud: "medioDia" })] }), // repuesto 0
      ],
      8,
    );
    expect(r.total).toBe(3);
    expect(r.pendientes).toBe(2);
    expect(r.parciales).toBe(1);
    expect(r.repuestos).toBe(1);
    expect(r.saldoHoras).toBe(12);
  });
});

describe("reposicion · ordenarPorFecha", () => {
  it("ordena descendente sin mutar el original", () => {
    const orig = [reg({ fecha: "2026-05-01" }), reg({ fecha: "2026-05-20" }), reg({ fecha: "2026-05-10" })];
    expect(ordenarPorFecha(orig).map((x) => x.fecha)).toEqual(["2026-05-20", "2026-05-10", "2026-05-01"]);
    expect(orig.map((x) => x.fecha)).toEqual(["2026-05-01", "2026-05-20", "2026-05-10"]);
  });
});

describe("reposicion · folios", () => {
  it("folioNumero extrae la parte numérica", () => {
    expect(folioNumero("REP-007")).toBe(7);
    expect(folioNumero("")).toBe(null);
  });
  it("siguienteFolio toma el máximo + 1 con padding", () => {
    expect(siguienteFolio([])).toBe("REP-001");
    expect(siguienteFolio([reg({ folio: "REP-001" }), reg({ folio: "REP-004" })])).toBe("REP-005");
  });
});

describe("reposicion · indexarReposiciones", () => {
  it("indexa el día trabajado y cada cuota de reposición", () => {
    const items = [
      reg({ folio: "REP-001", funcionario: "Ana", fecha: "2026-05-10", magnitud: "diaEntero",
        cuotas: [cuota({ fecha: "2026-05-20", magnitud: "medioDia" }), cuota({ id: "c2", fecha: "2026-05-22", magnitud: "medioDia" })] }),
    ];
    const { trabajadas, reposiciones } = indexarReposiciones(items, 8);
    expect(trabajadas["Ana|2026-05-10"]?.folio).toBe("REP-001");
    expect(trabajadas["Ana|2026-05-10"]?.estadoCalc).toBe("Repuesto");
    expect(reposiciones["Ana|2026-05-20"]?.folio).toBe("REP-001");
    expect(reposiciones["Ana|2026-05-22"]?.folio).toBe("REP-001");
  });
});

describe("reposicion · historial y saldo por funcionario", () => {
  it("agrupa y prioriza por saldo pendiente", () => {
    const items = [
      reg({ funcionario: "Ana", magnitud: "medioDia", cuotas: [cuota({ magnitud: "medioDia" })] }), // saldo 0
      reg({ funcionario: "Beto", magnitud: "diaEntero" }), // saldo 8
      reg({ funcionario: "Beto", magnitud: "horas", horas: 3 }), // saldo 3
    ];
    const h = historialPorFuncionario(items, 8);
    expect(h[0].funcionario).toBe("Beto");
    expect(h[0].saldoHoras).toBe(11);
    expect(h[1].funcionario).toBe("Ana");
    expect(h[1].repuestos).toBe(1);
    expect(saldoFuncionario(items, "Beto", 8)).toBe(11);
    expect(registrosConSaldoDe(items, "Beto", 8)).toHaveLength(2);
    expect(registrosConSaldoDe(items, "Ana", 8)).toHaveLength(0);
  });
});
