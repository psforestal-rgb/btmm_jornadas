import { useState } from "react";
import Badge from "../../ui/Badge.jsx";
import { opcionesPuestoOperativo } from "../../data/puestos.js";
import { opcionesLugarActividad, opcionesActividadBase, actividadRutinariaVisitantes } from "../../data/opciones.js";
import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";

export default function ModalActividad({ valor, personas, cerrar, guardar, eliminar, actividadesPlan = [] }) {
  useEscapeClose(cerrar);
  const t = useT();
  const [a, setA] = useState(valor);
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const cls = "w-full min-h-touch rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";
  const porPuesto = opcionesPuestoOperativo.map((puesto) => ({ puesto, items: personas.filter((p) => p.puestoOperativo === puesto) }));
  const lugarModo = opcionesLugarActividad.includes(a.lugar) ? a.lugar : "Otro";
  const esExistente = actividadesPlan.some((x) => x.id === a.id);
  const finActividad = a.unDia ? a.inicio : a.fin || a.inicio;
  const traslapa = (x) => x.id !== a.id && x.inicio <= finActividad && (x.fin || x.inicio) >= a.inicio;
  const actividadesFuncionario = (nombre) => actividadesPlan.filter((x) => traslapa(x) && (x.funcionarios || []).includes(nombre));
  const agregarFuncionario = (nombre) => {
    if (!a.funcionarios.includes(nombre)) set("funcionarios", [...a.funcionarios, nombre]);
  };
  const quitarFuncionario = (nombre) => set("funcionarios", a.funcionarios.filter((x) => x !== nombre));
  const toggleFuncionario = (nombre) => (a.funcionarios.includes(nombre) ? quitarFuncionario(nombre) : agregarFuncionario(nombre));
  const modificarActividadExistente = (act) => setA({ ...act });
  const titulo = esExistente ? t("modalActividad.editar") : t("modalActividad.agregar");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className="max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold">{titulo}</h3>
            <p className="text-sm text-slate-600">{t("modalActividad.sub")}</p>
          </div>
          <button onClick={cerrar} aria-label={t("acciones.cerrar")} className="-mr-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("modalActividad.titulo")}</span>
              <div className="grid gap-2 md:grid-cols-[260px_1fr]">
                <select
                  className={cls}
                  value={a.titulo === actividadRutinariaVisitantes ? actividadRutinariaVisitantes : "Otra"}
                  onChange={(e) => set("titulo", e.target.value === "Otra" ? "" : e.target.value)}
                >
                  {opcionesActividadBase.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                  <option value="Otra">{t("modalActividad.otra")}</option>
                </select>
                <input
                  className={cls}
                  value={a.titulo}
                  onChange={(e) => set("titulo", e.target.value)}
                  placeholder={t("modalActividad.placeholderTitulo")}
                />
              </div>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("modalActividad.fechaInicio")}</span>
              <input type="date" className={cls} value={a.inicio} onChange={(e) => set("inicio", e.target.value)} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("modalActividad.fechaFinal")}</span>
              <input type="date" className={cls} value={a.unDia ? a.inicio : a.fin} disabled={a.unDia} onChange={(e) => set("fin", e.target.value)} />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 p-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={a.unDia}
                onChange={(e) => setA((p) => ({ ...p, unDia: e.target.checked, fin: e.target.checked ? p.inicio : p.fin }))}
              />
              {t("modalActividad.unDia")}
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 p-3 text-sm font-semibold text-orange-950">
              <input type="checkbox" checked={a.viatico} onChange={(e) => set("viatico", e.target.checked)} />
              {t("modalActividad.requiereViatico")}
            </label>
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("modalActividad.lugar")}</span>
              <div className="grid gap-2">
                <select className={cls} value={lugarModo} onChange={(e) => set("lugar", e.target.value === "Otro" ? "" : e.target.value)}>
                  {opcionesLugarActividad.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                  <option value="Otro">{t("modalActividad.otro")}</option>
                </select>
                {lugarModo === "Otro" && (
                  <input
                    className={cls}
                    value={a.lugar}
                    onChange={(e) => set("lugar", e.target.value)}
                    placeholder={t("modalActividad.placeholderLugar")}
                  />
                )}
              </div>
            </label>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("modalActividad.participantes")}</span>
              <Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">{t("modalActividad.seleccionados", { n: a.funcionarios.length })}</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {porPuesto.map((g) => (
                <div key={g.puesto} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{g.puesto}</div>
                  <div className="space-y-1.5">
                    {g.items.map((f) => {
                      const avisos = actividadesFuncionario(f.nombre);
                      const seleccionado = a.funcionarios.includes(f.nombre);
                      return (
                        <div
                          key={f.id}
                          className={`rounded-xl border px-2 py-2 text-xs font-bold ${
                            seleccionado
                              ? "border-emerald-300 bg-emerald-100 text-emerald-950"
                              : avisos.length
                              ? "border-yellow-300 bg-yellow-50 text-yellow-950"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={seleccionado} onChange={() => toggleFuncionario(f.nombre)} />
                            {f.nombre}
                          </label>
                          {avisos.length > 0 && (
                            <div className="mt-2 rounded-lg border border-yellow-300 bg-yellow-100 p-2 text-[11px] leading-snug text-yellow-950">
                              <div className="font-bold">{t("modalActividad.avisoTraslape")}</div>
                              <div className="mt-1 font-bold">{avisos.map((x) => x.titulo).join(" · ")}</div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => agregarFuncionario(f.nombre)}
                                  className="rounded-lg bg-yellow-700 px-2 py-1 text-[10px] font-bold text-white hover:bg-yellow-800"
                                >
                                  {t("modalActividad.agregarAunAsi")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => modificarActividadExistente(avisos[0])}
                                  className="rounded-lg border border-yellow-700 bg-white px-2 py-1 text-[10px] font-bold text-yellow-900 hover:bg-yellow-50"
                                >
                                  {t("modalActividad.modificarActividad")}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <label className="mt-5 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("modalActividad.obs")}</span>
            <textarea
              className={`${cls} min-h-24`}
              value={a.observaciones}
              onChange={(e) => set("observaciones", e.target.value)}
              placeholder={t("modalActividad.placeholderObs")}
            />
          </label>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div>
            {esExistente && (
              <button
                onClick={() => eliminar(a.id)}
                className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
              >
                {t("acciones.eliminar")}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={cerrar} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              {t("acciones.cancelar")}
            </button>
            <button onClick={() => guardar(a)} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              {t("modalActividad.guardarActividad")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
