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
      <div role="dialog" aria-modal="true" aria-label={t("menuCelda.titulo", { dia: data.dia, persona: data.persona })} className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-slate-300 md:hidden" />
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">{t("menuCelda.titulo", { dia: data.dia, persona: data.persona })}</h3>
            <p className="text-sm text-slate-600">{t("menuCelda.sub")}</p>
          </div>
          <button onClick={cerrar} aria-label={t("acciones.cerrar")} className="-mr-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {data.esInicio && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
              <strong>{t("menuCelda.primerDia")}</strong> {t("menuCelda.primerDiaSub")}
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {opciones.map(([cat, label, cls]) => (
              <button
                key={cat}
                className={`min-h-touch rounded-2xl border px-4 py-4 text-left text-sm font-semibold shadow-sm hover:brightness-95 ${cls}`}
                onClick={() => seleccionar(cat)}
              >
                <span className="block text-base">{label}</span>
                <span className="mt-1 block text-xs opacity-75">{t("menuCelda.sub2", { cat })}</span>
              </button>
            ))}
          </div>
          <button
            className="mt-3 min-h-touch w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => seleccionar("")}
          >
            {t("menuCelda.limpiar")}
          </button>
        </div>
      </div>
    </div>
  );
}
