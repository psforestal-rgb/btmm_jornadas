import { useState } from "react";
import Modal from "../../ui/Modal.jsx";
import Icon from "../../ui/Icon.jsx";
import { useT } from "../../i18n/useT.js";
import { plural } from "../../i18n/es-CR.js";

/**
 * Asistente de 2 pasos para resolver conflictos rol-vs-actividad.
 *  - Paso 1: el usuario elige qué desea corregir (rol o actividad).
 *  - Paso 2: confirmación con resumen del impacto y advertencia normativa.
 */
export default function ConflictoModal({ data, cerrar, onModificarRol, onModificarActividad }) {
  const t = useT();
  const [paso, setPaso] = useState(1);
  const [via, setVia] = useState(null);
  const n = data.acts.length;
  const pl = plural(n);

  const titulos = {
    1: t("conflicto.titulo1"),
    2: t("conflicto.titulo2"),
  };

  const descripciones = {
    1: t("conflicto.sub1"),
    2: via === "rol"
      ? t("conflicto.sub2Rol")
      : t("conflicto.sub2Act", { n, plural: pl }),
  };

  const confirmar = () => {
    if (via === "rol") onModificarRol();
    else if (via === "actividad") onModificarActividad();
  };

  const acciones =
    paso === 2 ? (
      <>
        <button
          type="button"
          onClick={() => setPaso(1)}
          className="inline-flex min-h-touch items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Icon name="chevronLeft" size={16} /> {t("conflicto.volver")}
        </button>
        <button
          type="button"
          onClick={confirmar}
          className="inline-flex min-h-touch items-center gap-1 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {t("conflicto.continuar")} <Icon name="chevronRight" size={16} />
        </button>
      </>
    ) : null;

  return (
    <Modal open onClose={cerrar} title={titulos[paso]} description={descripciones[paso]} size="md" actions={acciones}>
      <div className="rounded-xl border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-950">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-red-700"><Icon name="danger" size={18} /></span>
          <div>
            <p className="font-semibold">{t("conflicto.detalle", { persona: data.persona, dia: data.dia })}</p>
            <p className="mt-0.5 text-xs opacity-90">
              {t("conflicto.detalleSub", { valor: data.valor || "—", n, plural: pl })}
            </p>
          </div>
        </div>
      </div>

      {paso === 1 && (
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => { setVia("rol"); setPaso(2); }}
            className="flex min-h-touch items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <span className="mt-0.5 text-emerald-700"><Icon name="pencil" size={18} /></span>
            <div>
              <div className="text-sm font-semibold text-emerald-950">{t("conflicto.cambiarRol")}</div>
              <div className="mt-0.5 text-xs text-emerald-800/80">{t("conflicto.cambiarRolSub")}</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => { setVia("actividad"); setPaso(2); }}
            className="flex min-h-touch items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            <span className="mt-0.5 text-amber-700"><Icon name="alert" size={18} /></span>
            <div>
              <div className="text-sm font-semibold text-amber-950">
                {t("conflicto.cambiarActividad", { plural: n > 1 ? "es" : "" })}{" "}
                <span className="ml-1 rounded-full bg-amber-200 px-1.5 py-0.5 text-xs">{n}</span>
              </div>
              <div className="mt-0.5 text-xs text-amber-800/80">{t("conflicto.cambiarActividadSub")}</div>
            </div>
          </button>
        </div>
      )}

      {paso === 2 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-900">{t("conflicto.resumen")}</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-700">
            <li>
              <strong>{t("conflicto.antes")}</strong>{" "}
              {t("conflicto.antesValor", { valor: data.valor || "—", n, plural: pl })}
            </li>
            {via === "rol" && (
              <li><strong>{t("conflicto.despues")}</strong> {t("conflicto.despuesRol")}</li>
            )}
            {via === "actividad" && (
              <li><strong>{t("conflicto.despues")}</strong> {t("conflicto.despuesAct")}</li>
            )}
            <li className="text-slate-500">{t("conflicto.notaNoEjecuta")}</li>
          </ul>
        </div>
      )}
    </Modal>
  );
}
