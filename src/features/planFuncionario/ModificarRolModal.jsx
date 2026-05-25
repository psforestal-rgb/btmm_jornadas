import { fecha } from "../../domain/fechas.js";
import { useEscapeClose } from "../../lib/a11y.js";

export default function ModificarRolModal({ data, cerrar, aplicar }) {
  useEscapeClose(cerrar);
  const opciones = [
    ["T", "Turno", "border-emerald-300 bg-emerald-100 text-emerald-950"],
    ["L", "Libre", "border-amber-300 bg-amber-100 text-amber-950"],
    ["V", "Vacaciones", "border-sky-300 bg-sky-100 text-sky-950"],
    ["I", "Incapacidad", "border-rose-300 bg-rose-100 text-rose-950"],
    ["O", "Otro", "border-violet-300 bg-violet-100 text-violet-950"],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={`Modificar rol de ${data.funcionario} en ${fecha(data.iso)}`} className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Modificar rol</h3>
            <p className="text-sm text-slate-600">
              {data.funcionario} · {fecha(data.iso)} · rol actual: <strong>{data.rol || "—"}</strong>
            </p>
          </div>
          <button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {opciones.map(([cat, label, cls]) => (
            <button
              key={cat}
              onClick={() => aplicar({ ...data, categoria: cat })}
              className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold shadow-sm hover:brightness-95 ${cls}`}
            >
              {label}
              <span className="mt-1 block text-xs opacity-75">Recalcula consecutivos de la fila</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => aplicar({ ...data, categoria: "" })}
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Limpiar rol del día
        </button>
      </div>
    </div>
  );
}
