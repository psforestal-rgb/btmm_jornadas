import { useMemo, useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Icon from "../../ui/Icon.jsx";
import { useApp } from "../../context/AppContext.jsx";
import { opcionesPuestoOperativo } from "../../data/puestos.js";
import { VIATICOS_OBJETIVO_OPCIONES, validarReglas, REGLAS_DEFAULT } from "../../config/reglas.js";
import { FERIADOS_CR } from "../../data/feriadosCR.js";
import { useT } from "../../i18n/useT.js";
import { plural } from "../../i18n/es-CR.js";

/**
 * Editor administrativo de reglas duras configurables. Cada cambio se
 * confirma explícitamente para evitar apagar alertas por error.
 */
export default function Configuracion() {
  const t = useT();
  const { reglas, setReglas, resetReglas } = useApp();
  const [draft, setDraft] = useState(reglas);
  const [confirmar, setConfirmar] = useState(false);

  const sucia = JSON.stringify(draft) !== JSON.stringify(reglas);
  const advertencias = useMemo(() => validarReglas(draft), [draft]);
  const aniosDisponibles = useMemo(
    () => Object.keys(FERIADOS_CR).sort().map(Number),
    [],
  );

  const togglePuesto = (puesto) => {
    setDraft((prev) => {
      const incluye = prev.puestosRequierenVisitantesDiario.includes(puesto);
      const lista = incluye
        ? prev.puestosRequierenVisitantesDiario.filter((p) => p !== puesto)
        : [...prev.puestosRequierenVisitantesDiario, puesto];
      return { ...prev, puestosRequierenVisitantesDiario: lista };
    });
  };

  const setCampo = (clave, valor) => setDraft((prev) => ({ ...prev, [clave]: valor }));
  const aplicar = () => { setReglas(draft); setConfirmar(false); };
  const descartar = () => setDraft(reglas);
  const onResetTotal = () => {
    if (confirm(t("configuracion.restaurarConfirm"))) {
      resetReglas();
      setDraft(REGLAS_DEFAULT);
    }
  };

  return (
    <section className="space-y-4">
      <Card
        title={t("configuracion.titulo")}
        icon="🚦"
        action={
          sucia ? (
            <Badge className="border-amber-300 bg-amber-100 text-amber-900">{t("configuracion.badgeSucia")}</Badge>
          ) : (
            <Badge className="border-emerald-300 bg-emerald-100 text-emerald-900">{t("configuracion.badgeOk")}</Badge>
          )
        }
      >
        <div className="mb-4 rounded-xl border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-950">
          {t("configuracion.reglaDuraIntro")}
        </div>

        {/* Cobertura */}
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            {t("configuracion.coberturaTitulo")}
          </h3>
          <p className="mb-2 text-xs text-slate-500">{t("configuracion.coberturaSub")}</p>
          <div className="flex flex-wrap gap-2">
            {opcionesPuestoOperativo.map((p) => {
              const activo = draft.puestosRequierenVisitantesDiario.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePuesto(p)}
                  aria-pressed={activo}
                  className={`min-h-touch rounded-xl border px-3 py-2 text-xs font-bold ${
                    activo
                      ? "border-red-300 bg-red-50 text-red-900"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {activo && <Icon name="alert" size={14} className="mr-1 inline" />}
                  {p}
                </button>
              );
            })}
          </div>
        </section>

        {/* Viáticos */}
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            {t("configuracion.viaticosTitulo")}
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-500">{t("configuracion.diaCorte")}</span>
              <input
                type="number"
                min="1"
                max="28"
                value={draft.diaCorteViaticos}
                onChange={(e) => setCampo("diaCorteViaticos", Number(e.target.value))}
                className="min-h-touch w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-500">{t("configuracion.mesObjetivo")}</span>
              <select
                value={draft.mesObjetivoViaticos}
                onChange={(e) => setCampo("mesObjetivoViaticos", e.target.value)}
                className="min-h-touch w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700"
              >
                {VIATICOS_OBJETIVO_OPCIONES.map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 p-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.permitirConsultaDespuesCierre}
                onChange={(e) => setCampo("permitirConsultaDespuesCierre", e.target.checked)}
              />
              {t("configuracion.permitirConsulta")}
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">{t("configuracion.permitirConsultaSub")}</p>
        </section>

        {/* Feriados */}
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            {t("configuracion.feriadosTitulo")}
          </h3>
          <label className="flex items-start gap-2 rounded-xl border border-slate-300 p-3 text-sm">
            <input
              type="checkbox"
              checked={draft.aplicarFeriadosEnPrimerDiaLaboral}
              onChange={(e) => setCampo("aplicarFeriadosEnPrimerDiaLaboral", e.target.checked)}
              className="mt-1"
            />
            <span>
              <strong className="block font-semibold">{t("configuracion.feriadosCheckTitle")}</strong>
              <span className="block text-xs text-slate-500">{t("configuracion.feriadosCheckSub")}</span>
            </span>
          </label>
          <details className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <summary className="cursor-pointer font-semibold text-slate-700">
              {t("configuracion.feriadosVer", { n: aniosDisponibles.length, plural: plural(aniosDisponibles.length) })}
            </summary>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {aniosDisponibles.map((ano) => (
                <div key={ano} className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                  <p className="text-xs font-bold text-slate-700">{ano}</p>
                  <ul className="mt-1 space-y-0.5 text-[10px] text-slate-600">
                    {FERIADOS_CR[ano].map((f) => (
                      <li key={f.fecha} className="flex justify-between">
                        <span>{f.fecha}</span>
                        <span className={f.obligatorio ? "" : "italic opacity-70"}>{f.nombre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </section>

        {/* Alertas adicionales */}
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            {t("configuracion.alertasTitulo")}
          </h3>
          <div className="grid gap-2 md:grid-cols-3">
            {[
              ["alertaInactivoConActividad", t("configuracion.alertaInactivo")],
              ["alertaIncapacitadoConActividad", t("configuracion.alertaIncapacitado")],
              ["alertaAcumulativaSinModalidad", t("configuracion.alertaSinModalidad")],
            ].map(([k, label]) => (
              <label key={k} className="flex items-start gap-2 rounded-xl border border-slate-300 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={!!draft[k]}
                  onChange={(e) => setCampo(k, e.target.checked)}
                  className="mt-1"
                />
                <span className="text-xs font-semibold text-slate-700">{label}</span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">{t("configuracion.alertasNota")}</p>
        </section>

        {advertencias.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950" role="alert">
            <p className="font-semibold">{t("configuracion.advertenciasTitulo")}</p>
            <ul className="mt-1 list-inside list-disc">
              {advertencias.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={onResetTotal}
            className="min-h-touch rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-50"
          >
            {t("configuracion.restaurarPredet")}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={descartar}
              disabled={!sucia}
              className="min-h-touch rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {t("configuracion.descartar")}
            </button>
            {!confirmar ? (
              <button
                type="button"
                onClick={() => setConfirmar(true)}
                disabled={!sucia}
                className="min-h-touch rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-emerald-700"
              >
                {t("configuracion.aplicar")}
              </button>
            ) : (
              <button
                type="button"
                onClick={aplicar}
                className="min-h-touch rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                {t("configuracion.confirmarAplicar")}
              </button>
            )}
          </div>
        </footer>
      </Card>
    </section>
  );
}
