import { dim, primerDiaLaboral } from "./fechas.js";

export function rolKey(year, month, puesto, persona, dia) {
  return `${year}-${month + 1}-${puesto}-${persona}-${dia}`;
}

export function rolCfgKey(year, month, puesto, persona) {
  return `CFG-${year}-${month + 1}-${puesto}-${persona}`;
}

export function parseModalidad(modalidad) {
  const texto = String(modalidad || "10x5").toLowerCase();
  if (texto.includes("administrativo")) return { trabajo: 5, libre: 2, administrativo: true };
  const p = texto.split("x");
  return { trabajo: Number(p[0]) || 10, libre: Number(p[1]) || 5, administrativo: false };
}

export function codigo(pi, d, gi) {
  const s = (pi * 5 + d + gi * 7) % 36;
  if (s === 0) return "I1";
  if (s === 1) return "O1";
  if (s === 2) return "O2";
  if (s >= 3 && s <= 7) return `L${s - 2}`;
  if (s >= 28 && s <= 34) return `V${s - 27}`;
  return `T${((s + pi) % 20) + 1}`;
}

export function defaultRolValue(year, month, gi, pi, dia) {
  return codigo(gi * 10 + pi + month + year, dia, gi);
}

export function generarValorPatron(modalidad, dia, inicio, year, month) {
  const cfg = parseModalidad(modalidad);
  if (cfg.administrativo) {
    const dow = new Date(year, month, dia).getDay();
    if (dow >= 1 && dow <= 5) return `T${dow}`;
    if (dow === 6) return "L1";
    return "L2";
  }
  const ciclo = cfg.trabajo + cfg.libre;
  const pos = (dia - inicio) % ciclo;
  if (dia < inicio) return "";
  if (pos < cfg.trabajo) return `T${pos + 1}`;
  return `L${pos - cfg.trabajo + 1}`;
}

export function esRolActivo(v) {
  const x = String(v || "").toUpperCase();
  return x.startsWith("T");
}

export function etiquetaRol(v) {
  const x = String(v || "").toUpperCase();
  if (x.startsWith("T")) return "Turno";
  if (x.startsWith("L")) return "Libre";
  if (x.startsWith("V")) return "Vacaciones";
  if (x.startsWith("I")) return "Incapacidad";
  if (x.startsWith("O")) return "Otro";
  if (!x) return "Sin marcar";
  return "Turno";
}

export function categoriaDe(v) {
  const x = String(v || "").toUpperCase();
  if (x.startsWith("T")) return "T";
  if (x.startsWith("L")) return "L";
  if (x.startsWith("V")) return "V";
  if (x.startsWith("I")) return "I";
  if (x.startsWith("O")) return "O";
  return "";
}

export function formatearCategoria(cat, consecutivo, modalidad) {
  const c = String(cat || "").toUpperCase();
  if (!c) return "";
  const cfg = parseModalidad(modalidad);
  if (c === "T") return `T${((consecutivo - 1) % cfg.trabajo) + 1}`;
  if (c === "L") return `L${((consecutivo - 1) % cfg.libre) + 1}`;
  return `${c}${consecutivo}`;
}

export function funcionarioPorNombre(personas, nombre) {
  return personas.find((f) => f.nombre === nombre);
}

export function modalidadFuncionario(personas, roleData, year, month, nombre) {
  const f = funcionarioPorNombre(personas, nombre);
  if (!f) return "10x5";
  return roleData[rolCfgKey(year, month, f.puestoOperativo || "Puesto Quetzales", nombre)] || f.modalidad || "10x5";
}

export function codigoRolFuncionario(personas, roleData, year, month, nombre, dia) {
  const f = funcionarioPorNombre(personas, nombre);
  if (!f) return "";
  const puesto = f.puestoOperativo || "Puesto Quetzales";
  const inicio = primerDiaLaboral(year, month);
  return (
    roleData[rolKey(year, month, puesto, nombre, dia)] ??
    generarValorPatron(modalidadFuncionario(personas, roleData, year, month, nombre), dia, inicio, year, month)
  );
}

// Renumera consecutivamente toda una fila tras un cambio puntual de categoría.
// `days` es el listado de días del mes; `categorias[d]` la categoría destino por día.
export function renumerarFila({ days, categorias, modalidad }) {
  const resultado = {};
  let categoriaAnterior = null;
  let consecutivo = 0;
  days.forEach((d) => {
    const cat = categorias[d] || "";
    if (!cat) {
      categoriaAnterior = null;
      consecutivo = 0;
      resultado[d] = "";
      return;
    }
    if (cat !== categoriaAnterior) {
      categoriaAnterior = cat;
      consecutivo = 1;
    } else {
      consecutivo += 1;
    }
    resultado[d] = formatearCategoria(cat, consecutivo, modalidad);
  });
  return resultado;
}

// Asegura el uso de `dim` por referencia (validación de import).
export { dim };
