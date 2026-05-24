import { fecha } from "../../domain/fechas.js";
import { actividadesEnDia } from "../../domain/actividades.js";

export default function AsignarActividadModal({ data, actividadesPlan, cerrar, crear, agregar }) {
  const existentes = actividadesEnDia(actividadesPlan, data.iso).filter((a) => !(a.funcionarios || []).includes(data.funcionario));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4">
      <div className="w-full max-w-2xl rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Asignar actividad</h3>
            <p className="text-sm text-slate-600">
              {data.funcionario} · {fecha(data.iso)}
            </p>
          </div>
          <button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        <button onClick={crear} className="mb-4 w-full rounded-2xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Crear actividad nueva para este funcionario
        </button>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Agregar a actividad existente del mismo día</div>
        <div className="mt-2 space-y-2">
          {existentes.length ? (
            existentes.map((a) => (
              <button
                key={a.id}
                onClick={() => agregar(a.id, data.funcionario)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold hover:bg-slate-100"
              >
                <div>{a.titulo}</div>
                <div className="mt-1 text-xs font-bold text-slate-500">
                  {a.lugar || "Sin lugar"} · {(a.funcionarios || []).join(", ") || "Sin funcionarios"}
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
              No hay actividades existentes ese día para otros funcionarios.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
