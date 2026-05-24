export function iniciales(n) {
  return n.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase();
}

export function avatar(n) {
  return [
    "bg-emerald-100 text-emerald-900",
    "bg-sky-100 text-sky-900",
    "bg-rose-100 text-rose-900",
    "bg-amber-100 text-amber-900",
    "bg-purple-100 text-purple-900",
  ][n.charCodeAt(0) % 5];
}

export function estadoCls(e) {
  return (
    {
      Activo: "bg-emerald-100 text-emerald-900 border-emerald-200",
      "De vacaciones": "bg-sky-100 text-sky-900 border-sky-200",
      Incapacitado: "bg-red-100 text-red-900 border-red-200",
      Inactivo: "bg-slate-100 text-slate-700 border-slate-200",
    }[e] || "bg-slate-100 text-slate-700 border-slate-200"
  );
}

export function codigoCls(c, finde) {
  const v = String(c || "").toUpperCase();
  if (v.startsWith("T")) return "bg-emerald-200 text-emerald-950 border-emerald-300";
  if (v.startsWith("I")) return "bg-rose-200 text-rose-950 border-rose-300";
  if (v.startsWith("V")) return "bg-sky-200 text-sky-950 border-sky-300";
  if (v.startsWith("L")) return "bg-amber-200 text-amber-950 border-amber-300";
  if (v.startsWith("O")) return "bg-violet-200 text-violet-950 border-violet-300";
  if (!v) return finde ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-400 border-slate-200";
  return finde ? "bg-slate-200 text-slate-950 border-slate-300" : "bg-emerald-100 text-emerald-950 border-emerald-200";
}
