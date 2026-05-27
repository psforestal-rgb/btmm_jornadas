import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";

export default function MenuCelda({ data, cerrar, seleccionar }) {
  useEscapeClose(cerrar);
  const t = useT();
  const opciones = [
    ["T", t("menuCelda.cat.T"), "border-emerald-300 bg-emerald-100 text-emerald-950"],
    ["L", t("menuCelda.cat.L"), "border-amber-300 bg-amber-100 text-amber-950"],
    ["V", t("menuCelda.cat.V"), "border-sky-300 bg-sky-100 text-sky-950"],
    ["I", t("menuCelda.cat.I"), "border-rose-300 bg-rose-100 text-rose-950"],
    ["O", t("menuCelda.cat.O"), "border-violet-300 bg-violet-100 text-violet-950"],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={t("menuCelda.titulo", { dia: data.dia, persona: data.persona })} className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{t("menuCelda.titulo", { dia: data.dia, persona: data.persona })}</h3>
            <p className="text-sm text-slate-600">{t("menuCelda.sub")}</p>
          </div>
          <button onClick={cerrar} aria-label={t("acciones.cerrar")} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        {data.esInicio && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
            <strong>{t("menuCelda.primerDia")}</strong> {t("menuCelda.primerDiaSub")}
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
              <span className="mt-1 block text-xs opacity-75">{t("menuCelda.sub2", { cat })}</span>
            </button>
          ))}
        </div>
        <button
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => seleccionar("")}
        >
          {t("menuCelda.limpiar")}
        </button>
      </div>
    </div>
  );
}
