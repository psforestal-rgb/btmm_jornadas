import { puestos } from "./puestos.js";

export const baseFuncionarios = puestos.flatMap((p, gi) =>
  p.funcionarios.map((nombre, pi) => {
    const n = gi * 10 + pi + 1;
    const esPablo = nombre === "Pablo Sánchez";
    const esAdmin = nombre === "Yolanda Elizondo";
    const esOng = nombre === "Carlos Cordero";
    const sinRes = ["Yeison Cortés", "Jetzelly Villalobos", "Guillermo Pérez"].includes(nombre);
    const estado =
      nombre === "Fabricio Carbonell"
        ? "De vacaciones"
        : nombre === "Guillermo Pérez"
        ? "Incapacitado"
        : "Activo";
    return {
      id: `f${n}`,
      nombre,
      cedula: `1-0000-${String(n).padStart(4, "0")}`,
      email: esPablo ? "psforestal@yahoo.com" : `${nombre.toLowerCase().replaceAll(" ", ".")}@sinac.go.cr`,
      puesto: esPablo
        ? "Técnico en Recursos Naturales"
        : esAdmin
        ? "Asistente Administrativo"
        : esOng
        ? "Personal Apoyo ONG-Invest-Volunt"
        : "Guardaparques",
      condicion: esOng ? "ONG-Invest-Volunt" : n % 5 === 0 ? "Interino" : "Propiedad",
      jornada: esPablo || esAdmin ? "Ordinaria" : "Acumulativa",
      modalidad:
        esPablo || esAdmin
          ? "Horario administrativo L-V"
          : n % 7 === 0
          ? "16x8"
          : n % 4 === 0
          ? "12x6"
          : "10x5",
      resolucion: sinRes
        ? ""
        : esOng
        ? "CONV-ONG-INV-VOL-2026"
        : esPablo || esAdmin
        ? ""
        : `RES-ACC-${String(n).padStart(3, "0")}-2026`,
      disponibilidad: !esPablo && !esAdmin && !esOng && n % 3 !== 0,
      contrato: !esPablo && !esAdmin && !esOng && n % 3 !== 0 ? `DISP-2026-${String(n).padStart(3, "0")}` : "",
      vencimiento: n % 5 === 0 ? "2026-05-30" : n % 4 === 0 ? "2026-06-30" : n % 3 !== 0 ? "2026-12-31" : "",
      policia: !esPablo && !esAdmin && !esOng && !sinRes,
      brigada: n % 4 === 2,
      ong: esOng,
      jefe: "Administración PNLQ",
      estado,
      ingreso: "2026-01-01",
      puestoOperativo: p.nombre,
      obs: `${p.nombre}${sinRes ? " · Dato pendiente: resolución acumulativa" : ""}`,
    };
  })
);
