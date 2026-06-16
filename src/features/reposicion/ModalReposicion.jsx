import { useState } from "react";
import { opcionesPuestoOperativo } from "../../data/puestos.js";
import { TIPOS_DIA, MOTIVOS } from "../../domain/reposicion.js";
import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";

export default function ModalReposicion({ valor, personas, cerrar, guardar, eliminar, reposiciones = [] }) {
  useEscapeClose(cerrar);
  const t = useT();
  const [r, setR] = useState(valor);
  const set = (k, v) => setR((p) => ({ ...p, [k]: v }));
  const cls =
    "w-full min-h-touch rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

  const esExistente = reposiciones.some((x) => x.id === r.id);
  const titulo = esExistente ? t("modalReposicion.editar") : t("modalReposicion.agregar");

  // Funcionarios agrupados por puesto operativo (los que no tienen puesto
  // operativo definido caen en un grupo "Otros").
  const porPuesto = opcionesPuestoOperativo.map((puesto) => ({
    puesto,
    items: personas.filter((p) => p.puestoOperativo === puesto),
  }));
  const sinPuesto = personas.filter((p) => !opcionesPuestoOperativo.includes(p.puestoOperativo));

  const magnitudes = [
    ["diaEntero", t("modalReposicion.magnitudDiaEntero")],
    ["medioDia", t("modalReposicion.magnitudMedioDia")],
    ["horas", t("modalReposicion.magnitudHoras")],
  ];

  const onGuardar = () => {
    if (!r.funcionario || !r.fecha) return;
    guardar({
      ...r,
      horas: r.magnitud === "horas" ? Number(r.horas) || 0 : 0,
      fechaReposicion: r.estado === "Repuesto" ? r.fechaReposicion : "",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[94vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold">{titulo}</h3>
            <p className="text-sm text-slate-600">{t("modalReposicion.sub")}</p>
          </div>
          <button
            onClick={cerrar}
            aria-label={t("acciones.cerrar")}
            className="-mr-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("modalReposicion.funcionario")}
              </span>
              <select className={cls} value={r.funcionario} onChange={(e) => set("funcionario", e.target.value)}>
                <option value="">{t("modalReposicion.seleccioneFuncionario")}</option>
                {porPuesto.map((g) => (
                  <optgroup key={g.puesto} label={g.puesto}>
                    {g.items.map((f) => (
                      <option key={f.id} value={f.nombre}>
                        {f.nombre}
                      </option>
                    ))}
                  </optgroup>
                ))}
                {sinPuesto.length > 0 && (
                  <optgroup label={t("modalReposicion.otrosFuncionarios")}>
                    {sinPuesto.map((f) => (
                      <option key={f.id} value={f.nombre}>
                        {f.nombre}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("modalReposicion.fecha")}
              </span>
              <input type="date" className={cls} value={r.fecha} onChange={(e) => set("fecha", e.target.value)} />
            </label>

            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("modalReposicion.tipoDia")}
              </span>
              <select className={cls} value={r.tipoDia} onChange={(e) => set("tipoDia", e.target.value)}>
                {TIPOS_DIA.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("modalReposicion.motivo")}
              </span>
              <select className={cls} value={r.motivo} onChange={(e) => set("motivo", e.target.value)}>
                {MOTIVOS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("modalReposicion.motivoDetalle")}
              </span>
              <input
                className={cls}
                value={r.motivoDetalle}
                onChange={(e) => set("motivoDetalle", e.target.value)}
                placeholder={t("modalReposicion.motivoDetallePlaceholder")}
              />
            </label>

            <div className="md:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("modalReposicion.magnitud")}
              </span>
              <div className="grid gap-2 sm:grid-cols-3">
                {magnitudes.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => set("magnitud", id)}
                    aria-pressed={r.magnitud === id}
                    className={`min-h-touch rounded-xl border px-3 py-2 text-sm font-bold ${
                      r.magnitud === id
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {r.magnitud === "horas" && (
                <label className="mt-2 block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("modalReposicion.horas")}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className={cls}
                    value={r.horas}
                    onChange={(e) => set("horas", e.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="md:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("modalReposicion.estado")}
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => set("estado", "Pendiente")}
                  aria-pressed={r.estado !== "Repuesto"}
                  className={`min-h-touch rounded-xl border px-3 py-2 text-sm font-bold ${
                    r.estado !== "Repuesto"
                      ? "border-amber-500 bg-amber-100 text-amber-950"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {t("modalReposicion.estadoPendiente")}
                </button>
                <button
                  type="button"
                  onClick={() => set("estado", "Repuesto")}
                  aria-pressed={r.estado === "Repuesto"}
                  className={`min-h-touch rounded-xl border px-3 py-2 text-sm font-bold ${
                    r.estado === "Repuesto"
                      ? "border-emerald-600 bg-emerald-100 text-emerald-950"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {t("modalReposicion.estadoRepuesto")}
                </button>
              </div>
              {r.estado === "Repuesto" && (
                <label className="mt-2 block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("modalReposicion.fechaReposicion")}
                  </span>
                  <input
                    type="date"
                    className={cls}
                    value={r.fechaReposicion}
                    onChange={(e) => set("fechaReposicion", e.target.value)}
                  />
                </label>
              )}
            </div>

            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("modalReposicion.obs")}
              </span>
              <textarea
                className={`${cls} min-h-24`}
                value={r.observaciones}
                onChange={(e) => set("observaciones", e.target.value)}
                placeholder={t("modalReposicion.obsPlaceholder")}
              />
            </label>
          </div>

          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{t("reposicion.nota")}</p>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div>
            {esExistente && (
              <button
                onClick={() => eliminar(r.id)}
                className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
              >
                {t("acciones.eliminar")}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={cerrar}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              {t("acciones.cancelar")}
            </button>
            <button
              onClick={onGuardar}
              disabled={!r.funcionario || !r.fecha}
              className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("modalReposicion.guardar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
