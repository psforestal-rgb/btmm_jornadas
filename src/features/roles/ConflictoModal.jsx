import { useState } from "react";
import Modal from "../../ui/Modal.jsx";
import Icon from "../../ui/Icon.jsx";

/**
 * Asistente de 2 pasos para resolver conflictos rol-vs-actividad.
 *  - Paso 1: el usuario elige qué desea corregir (rol o actividad).
 *  - Paso 2: confirmación con resumen del impacto y advertencia normativa.
 *
 * Mantiene los dos caminos originales (Modificar rol / Modificar actividad)
 * y agrega claridad sobre la consecuencia, sin tomar decisiones automáticas.
 */
export default function ConflictoModal({ data, cerrar, onModificarRol, onModificarActividad }) {
  const [paso, setPaso] = useState(1);
  const [via, setVia] = useState(null);
  const n = data.acts.length;

  const titulos = {
    1: "Resolver incoherencia · paso 1 de 2",
    2: `Confirmar acción · paso 2 de 2`,
  };

  const descripciones = {
    1: "Seleccione cuál registro corregir. La herramienta solo actualiza el dato visible: no genera pagos ni decisiones administrativas.",
    2: via === "rol"
      ? "Se modificará el rol de este día y se recalcularán los consecutivos T/L/V/I/O de toda la fila respetando la modalidad."
      : `Se abrirá el listado de ${n} actividad${n !== 1 ? "es" : ""} de este día para que pueda quitar al funcionario o ajustar la planificación.`,
  };

  const confirmar = () => {
    if (via === "rol") onModificarRol();
    else if (via === "actividad") onModificarActividad();
  };

  return (
    <Modal open onClose={cerrar} title={titulos[paso]} description={descripciones[paso]} size="md">
      <div className="rounded-xl border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-950">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-red-700"><Icon name="danger" size={18} /></span>
          <div>
            <p className="font-semibold">{data.persona} · día {data.dia}</p>
            <p className="mt-0.5 text-xs opacity-90">
              Rol <strong>{data.valor || "—"}</strong> (no en turno) con {n} actividad{n !== 1 ? "es" : ""} planificada{n !== 1 ? "s" : ""}.
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
              <div className="text-sm font-semibold text-emerald-950">Modificar rol del día</div>
              <div className="mt-0.5 text-xs text-emerald-800/80">Cambiar la categoría de turno para este funcionario.</div>
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
                Modificar actividad{n > 1 ? "es" : ""}{" "}
                <span className="ml-1 rounded-full bg-amber-200 px-1.5 py-0.5 text-xs">{n}</span>
              </div>
              <div className="mt-0.5 text-xs text-amber-800/80">Ver, editar o quitar al funcionario de las actividades del día.</div>
            </div>
          </button>
        </div>
      )}

      {paso === 2 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-900">Resumen del impacto</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-700">
            <li><strong>Antes:</strong> rol <em>{data.valor || "—"}</em> · {n} actividad{n !== 1 ? "es" : ""}.</li>
            {via === "rol" && (
              <li><strong>Después:</strong> elegirá una nueva categoría (T/L/V/I/O) y se renumerará toda la fila.</li>
            )}
            {via === "actividad" && (
              <li><strong>Después:</strong> podrá quitar al funcionario o editar/eliminar la actividad.</li>
            )}
            <li className="text-slate-500">La herramienta solo registra; no genera pago, reposición ni derecho automático.</li>
          </ul>
        </div>
      )}

      {paso === 2 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPaso(1)}
            className="inline-flex min-h-touch items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Icon name="chevronLeft" size={16} /> Volver
          </button>
          <button
            type="button"
            onClick={confirmar}
            className="inline-flex min-h-touch items-center gap-1 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Continuar <Icon name="chevronRight" size={16} />
          </button>
        </div>
      )}
    </Modal>
  );
}
