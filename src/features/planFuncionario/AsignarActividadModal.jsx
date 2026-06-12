import { fecha } from "../../domain/fechas.js";
import { actividadesEnDia } from "../../domain/actividades.js";
import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";

export default function AsignarActividadModal({ data, actividadesPlan, cerrar, crear, agregar }) {
  useEscapeClose(cerrar);
  const t = useT();
  const existentes = actividadesEnDia(actividadesPlan, data.iso).filter((a) => !(a.funcionarios || []).includes(data.funcionario));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={t("asignarActividad.titulo") + " · " + data.funcionario + " · " + fecha(data.iso)} className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-slate-300 md:hidden" />
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">{t("asignarActividad.titulo")}</h3>
            <p className="text-sm text-slate-600">{t("asignarActividad.sub", { funcionario: data.funcionario, fecha: fecha(data.iso) })}</p>
          </div>
          <button onClick={cerrar} aria-label={t("acciones.cerrar")} className="-mr-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button onClick={crear} className="mb-4 min-h-touch w-full rounded-2xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
            {t("asignarActividad.crear")}
          </button>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("asignarActividad.agregar")}</div>
          <div className="mt-2 space-y-2">
            {existentes.length ? (
              existentes.map((a) => (
                <button
                  key={a.id}
                  onClick={() => agregar(a.id, data.funcionario)}
                  className="min-h-touch w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold hover:bg-slate-100"
                >
                  <div className="break-words">{a.titulo}</div>
                  <div className="mt-1 break-words text-xs font-bold text-slate-500">
                    {a.lugar || t("dia.sinLugar")} · {(a.funcionarios || []).join(", ") || "Sin funcionarios"}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                {t("asignarActividad.sinExistentes")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
