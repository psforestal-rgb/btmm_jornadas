import { fecha } from "../../domain/fechas.js";
import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";

export default function CoberturaDetalleModal({ data, cerrar, onNuevaActividad, onEditarActividad }) {
  useEscapeClose(cerrar);
  const t = useT();
  const agrupadosTurno = data.turno.reduce((acc, f) => {
    const puesto = f.puestoOperativo || t("funcionarios.sinPuesto");
    if (!acc[puesto]) acc[puesto] = [];
    acc[puesto].push(f);
    return acc;
  }, {});
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={`${t("cobertura.titulo")} ${data.puesto} ${fecha(data.fecha)}`} className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold">{t("cobertura.titulo")}</h3>
            <p className="text-sm font-bold text-slate-600">
              {data.puesto} · {fecha(data.fecha)}
            </p>
          </div>
          <button onClick={cerrar} aria-label={t("acciones.cerrar")} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        <div className="max-h-[76vh] overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">{t("cobertura.programados")}</div>
              <div className="mt-1 text-3xl font-bold">{data.programados.length}</div>
            </div>
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-950">
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">{t("cobertura.enTurnoRol")}</div>
              <div className="mt-1 text-3xl font-bold">{data.rol}</div>
            </div>
            <div
              className={`rounded-2xl border p-4 ${
                data.requiereAtencionRutinaria && !data.atencionRutinaria.length
                  ? "border-red-300 bg-red-100 text-red-950 ring-2 ring-red-400"
                  : "border-blue-200 bg-blue-50 text-blue-950"
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">{t("cobertura.atencionVisit")}</div>
              <div className="mt-1 text-3xl font-bold">{data.atencionRutinaria.length}</div>
              {data.requiereAtencionRutinaria && !data.atencionRutinaria.length && (
                <div className="mt-1 text-xs font-bold">{t("cobertura.alertaSinAtencion")}</div>
              )}
            </div>
          </div>
          {data.atencionRutinaria.length > 0 && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-blue-950">
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">{t("cobertura.asignadosVisit")}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.atencionRutinaria.map((n) => (
                  <span key={n} className="rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-bold">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-5">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{t("cobertura.enTurnoSegunRol")}</div>
            {data.turno.length ? (
              <div className="space-y-4">
                {Object.entries(agrupadosTurno).map(([puesto, items]) => (
                  <div key={puesto} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{puesto}</div>
                    <div className="space-y-2">
                      {items.map((f) => {
                        const sinActividad = !f.actividades.length;
                        return (
                          <div
                            key={f.id}
                            className={`rounded-2xl border p-3 ${
                              sinActividad
                                ? "border-yellow-300 bg-yellow-100 text-yellow-950"
                                : "border-emerald-200 bg-white text-slate-950"
                            }`}
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="font-semibold">{f.nombre}</div>
                                <div className="text-xs font-bold opacity-80">
                                  {t("cobertura.rolPrefix", { rol: f.rol, puesto: f.puesto })}
                                </div>
                              </div>
                              {sinActividad ? (
                                <button
                                  onClick={() => onNuevaActividad(f.nombre, data.fecha, data.puesto)}
                                  className="rounded-xl bg-yellow-700 px-3 py-2 text-xs font-bold text-white hover:bg-yellow-800"
                                >
                                  {t("cobertura.agregarActividad")}
                                </button>
                              ) : (
                                <button
                                  onClick={() => onEditarActividad(f.actividades[0])}
                                  className="rounded-xl bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                                >
                                  {t("cobertura.editarActividad")}
                                </button>
                              )}
                            </div>
                            {sinActividad ? (
                              <div className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold">
                                {t("cobertura.sinActividad")}
                              </div>
                            ) : (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {f.actividades.map((a) => (
                                  <button
                                    key={a.id}
                                    onClick={() => onEditarActividad(a)}
                                    className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100"
                                  >
                                    {a.titulo} · {a.lugar || t("dia.sinLugar")}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                {t("cobertura.sinTurno")}
              </div>
            )}
          </div>
          <div className="mt-5">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("cobertura.programadosLugar")}
            </div>
            {data.programados.length ? (
              <div className="space-y-2">
                {data.programados.map((item) => (
                  <div key={item.nombre} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="font-semibold text-slate-950">{item.nombre}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.actividades.map((a, idx) => (
                        <span
                          key={`${item.nombre}-${idx}`}
                          className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-900"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                {t("cobertura.sinProgramados")}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4">
          <button onClick={cerrar} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            {t("acciones.cerrar")}
          </button>
        </div>
      </div>
    </div>
  );
}
