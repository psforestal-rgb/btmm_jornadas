import { fecha } from "../../domain/fechas.js";
import { etiquetaRol } from "../../domain/roles.js";
import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";
import { saldoTexto } from "../reposicion/etiquetas.js";

/**
 * Diálogo que aparece al asignar una actividad a un funcionario que ese
 * día está libre, de vacaciones o fuera de turno. Ofrece resolver la
 * incoherencia: modificar el rol, registrar el tiempo como reposición
 * pendiente, reponer tiempo a favor (si lo tiene), editar la fecha de la
 * actividad o cancelar la asignación.
 */
export default function AsignacionLibreModal({ data, hj, cerrar, onModificarRol, onReposicion, onReponer, onEditarFecha }) {
  useEscapeClose(cerrar);
  const t = useT();
  const { funcionario, iso, rol, saldo = 0 } = data;

  const Opcion = ({ onClick, tono, titulo, desc }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm hover:brightness-95 ${tono}`}
    >
      <span className="block text-sm font-semibold">{titulo}</span>
      <span className="mt-0.5 block text-xs opacity-80">{desc}</span>
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={t("asignacionLibre.titulo")} className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold">{t("asignacionLibre.titulo")}</h3>
            <p className="text-sm text-slate-600">
              {t("asignacionLibre.sub", { funcionario, fecha: fecha(iso), rol: etiquetaRol(rol) })}
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

        <div className="space-y-2 p-5">
          <Opcion
            onClick={onModificarRol}
            tono="border-emerald-300 bg-emerald-50 text-emerald-950"
            titulo={t("asignacionLibre.modificarRol")}
            desc={t("asignacionLibre.modificarRolDesc")}
          />
          <Opcion
            onClick={onReposicion}
            tono="border-amber-300 bg-amber-50 text-amber-950"
            titulo={t("asignacionLibre.reposicion")}
            desc={t("asignacionLibre.reposicionDesc")}
          />
          {saldo > 0 && (
            <Opcion
              onClick={onReponer}
              tono="border-sky-300 bg-sky-50 text-sky-950"
              titulo={t("asignacionLibre.reponer", { saldo: saldoTexto(saldo, hj) })}
              desc={t("asignacionLibre.reponerDesc")}
            />
          )}
          <Opcion
            onClick={onEditarFecha}
            tono="border-slate-300 bg-slate-50 text-slate-800"
            titulo={t("asignacionLibre.editarFecha")}
            desc={t("asignacionLibre.editarFechaDesc")}
          />
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button onClick={cerrar} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            {t("acciones.cancelar")}
          </button>
        </div>
      </div>
    </div>
  );
}
