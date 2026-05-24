export default function MenuCelda({ data, cerrar, seleccionar }) {
  const opciones = [
    ["T", "Turno", "border-emerald-300 bg-emerald-100 text-emerald-950"],
    ["L", "Libre", "border-amber-300 bg-amber-100 text-amber-950"],
    ["V", "Vacaciones", "border-sky-300 bg-sky-100 text-sky-950"],
    ["I", "Incapacidad", "border-rose-300 bg-rose-100 text-rose-950"],
    ["O", "Otro", "border-violet-300 bg-violet-100 text-violet-950"],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 md:items-center md:p-4">
      <div className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Editar día {data.dia} · {data.persona}</h3>
            <p className="text-sm text-slate-600">
              Seleccione únicamente la categoría. El número consecutivo se recalcula automáticamente en toda la fila.
            </p>
          </div>
          <button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        {data.esInicio && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
            <strong>Primer día laboral del mes.</strong> La modalidad del funcionario define el reinicio de los consecutivos de turno y libre.
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {opciones.map(([cat, label, cls]) => (
            <button
              key={cat}
              className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold shadow-sm hover:brightness-95 ${cls}`}
              onClick={() => seleccionar(cat)}
            >
              <span className="block text-base">{label}</span>
              <span className="mt-1 block text-xs opacity-75">Se mostrará como {cat}1, {cat}2...</span>
            </button>
          ))}
        </div>
        <button
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => seleccionar("")}
        >
          Limpiar celda
        </button>
      </div>
    </div>
  );
}
