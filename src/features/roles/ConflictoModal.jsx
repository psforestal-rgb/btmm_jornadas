export default function ConflictoModal({ data, cerrar, onModificarRol, onModificarActividad }) {
  const n = data.acts.length;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4">
      <div className="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">Resolver incoherencia</h3>
          <button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        <div className="mb-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-950">
          <strong>{data.persona}</strong> · día {data.dia}
          <br />
          <span className="text-xs opacity-80">
            Rol <strong>{data.valor || "—"}</strong> (no en turno) con {n} actividad{n !== 1 ? "es" : ""} planificada{n !== 1 ? "s" : ""}.
          </span>
        </div>
        <div className="grid gap-2">
          <button onClick={onModificarRol} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left hover:bg-emerald-100">
            <div className="text-sm font-semibold text-emerald-950">Modificar rol del día</div>
            <div className="mt-0.5 text-xs text-emerald-700">Cambiar la categoría de turno para este funcionario</div>
          </button>
          <button onClick={onModificarActividad} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-left hover:bg-amber-100">
            <div className="text-sm font-semibold text-amber-950">
              Modificar actividad{n > 1 ? "es" : ""}{" "}
              <span className="ml-1 rounded-full bg-amber-200 px-1.5 py-0.5 text-xs">{n}</span>
            </div>
            <div className="mt-0.5 text-xs text-amber-700">Ver, editar o quitar al funcionario de las actividades del día</div>
          </button>
        </div>
        <button
          onClick={cerrar}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
