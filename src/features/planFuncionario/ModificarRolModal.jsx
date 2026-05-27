import { fecha } from "../../domain/fechas.js";
import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";

export default function ModificarRolModal({ data, cerrar, aplicar }) {
  useEscapeClose(cerrar);
  const t = useT();
  const opciones = [
    ["T", t("modificarRol.cat.T"), "border-emerald-300 bg-emerald-100 text-emerald-950"],
    ["L", t("modificarRol.cat.L"), "border-amber-300 bg-amber-100 text-amber-950"],
    ["V", t("modificarRol.cat.V"), "border-sky-300 bg-sky-100 text-sky-950"],
    ["I", t("modificarRol.cat.I"), "border-rose-300 bg-rose-100 text-rose-950"],
    ["O", t("modificarRol.cat.O"), "border-violet-300 bg-violet-100 text-violet-950"],
  ];
  const tituloAria = t("modificarRol.titulo") + " · " + data.funcionario + " · " + fecha(data.iso);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={tituloAria} className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{t("modificarRol.titulo")}</h3>
            <p className="text-sm text-slate-600">
              {data.funcionario} · {fecha(data.iso)} · {t("modificarRol.sub", { funcionario: "", fecha: "", rol: data.rol || "—" }).match(/rol actual: .*/)?.[0] || `rol actual: ${data.rol || "—"}`}
            </p>
          </div>
          <button onClick={cerrar} aria-label={t("acciones.cerrar")} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {opciones.map(([cat, label, cls]) => (
            <button
              key={cat}
              onClick={() => aplicar({ ...data, categoria: cat })}
              className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold shadow-sm hover:brightness-95 ${cls}`}
            >
              {label}
              <span className="mt-1 block text-xs opacity-75">{t("modificarRol.catSub")}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => aplicar({ ...data, categoria: "" })}
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {t("modificarRol.limpiar")}
        </button>
      </div>
    </div>
  );
}
