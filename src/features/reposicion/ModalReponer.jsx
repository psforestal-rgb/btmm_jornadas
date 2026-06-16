import { useState } from "react";
import { fecha } from "../../domain/fechas.js";
import { horasDeMagnitud, horasTrabajadas, horasRepuestas, saldoHoras, cuotasDe } from "../../domain/reposicion.js";
import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";
import { magnitudLabel, saldoTexto } from "./etiquetas.js";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Registra una CUOTA de reposición de un registro: permite elegir si se
 * repone día completo, medio día u horas, en una fecha editable, mostrando
 * el saldo antes y después. El tiempo puede reponerse en varias partes
 * hasta saldar.
 */
export default function ModalReponer({ registro, hj, cerrar, guardar }) {
  useEscapeClose(cerrar);
  const t = useT();
  const [magnitud, setMagnitud] = useState("diaEntero");
  const [horas, setHoras] = useState("");
  const [fechaRep, setFechaRep] = useState(hoyISO());

  const cls =
    "w-full min-h-touch rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

  const saldoActual = saldoHoras(registro, hj);
  const cuotaHoras = horasDeMagnitud(magnitud, horas, hj);
  const saldoDespues = Math.max(0, Math.round((saldoActual - cuotaHoras) * 100) / 100);
  const excede = cuotaHoras > saldoActual + 0.001;
  const cuotaInvalida = cuotaHoras <= 0 || !fechaRep;

  const magnitudes = [
    ["diaEntero", t("modalReposicion.magnitudDiaEntero")],
    ["medioDia", t("modalReposicion.magnitudMedioDia")],
    ["horas", t("modalReposicion.magnitudHoras")],
  ];

  const onGuardar = () => {
    if (cuotaInvalida) return;
    const cuota = {
      id: `c${Date.now()}`,
      fecha: fechaRep,
      magnitud,
      horas: magnitud === "horas" ? Number(horas) || 0 : 0,
    };
    guardar({ ...registro, cuotas: [...cuotasDe(registro), cuota] });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("reponer.titulo")}
        className="max-h-[94vh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">{t("reponer.titulo")}</h3>
              {registro.folio && (
                <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                  {registro.folio}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">
              {registro.funcionario} · {magnitudLabel(registro, t)} · {fecha(registro.fecha)}
            </p>
          </div>
          <button
            onClick={cerrar}
            aria-label={t("acciones.cerrar")}
            className="-mr-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* Saldo antes / después */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">{t("reponer.saldoActual")}</div>
              <div className="text-lg font-semibold text-amber-950">{saldoTexto(saldoActual, hj)}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">{t("reponer.saldoDespues")}</div>
              <div className="text-lg font-semibold text-emerald-950">{saldoTexto(saldoDespues, hj)}</div>
            </div>
          </div>

          {/* Magnitud a reponer */}
          <div className="mb-4">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("reponer.cuanto")}</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {magnitudes.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMagnitud(id)}
                  aria-pressed={magnitud === id}
                  className={`min-h-touch rounded-xl border px-3 py-2 text-sm font-bold ${
                    magnitud === id
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {magnitud === "horas" && (
              <label className="mt-2 block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("modalReposicion.horas")}</span>
                <input type="number" min="0" step="0.5" className={cls} value={horas} onChange={(e) => setHoras(e.target.value)} />
              </label>
            )}
          </div>

          {/* Fecha editable */}
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("reponer.fecha")}</span>
            <input type="date" className={cls} value={fechaRep} onChange={(e) => setFechaRep(e.target.value)} />
          </label>

          {excede && (
            <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-xs font-semibold text-amber-900">
              {t("reponer.excede")}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button onClick={cerrar} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            {t("acciones.cancelar")}
          </button>
          <button
            onClick={onGuardar}
            disabled={cuotaInvalida}
            className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("reponer.registrar")}
          </button>
        </div>
      </div>
    </div>
  );
}
