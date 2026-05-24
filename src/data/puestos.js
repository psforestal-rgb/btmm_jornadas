export const puestos = [
  {
    nombre: "Puesto Orosi",
    tag: "OR",
    color: "bg-orange-100 text-orange-950",
    funcionarios: ["Errol Salazar", "Mayra Espinoza", "Yeison Cortés", "Kenneth Mena", "Fabricio Carbonell"],
  },
  {
    nombre: "Puesto Quetzales",
    tag: "QZ",
    color: "bg-orange-500 text-white",
    funcionarios: ["Juan Pablo Granados", "Karen Valle", "Josué Brenes", "Laura Valverde", "Diana Tencio", "Jetzelly Villalobos", "Pablo Sánchez"],
  },
  {
    nombre: "Puesto Esperanza",
    tag: "LE",
    color: "bg-sky-100 text-sky-950",
    funcionarios: ["Yolanda Elizondo", "Mariano Solís", "Guillermo Pérez", "Carlos Cordero"],
  },
];

export const opcionesPuestoOperativo = puestos.map((p) => p.nombre);
