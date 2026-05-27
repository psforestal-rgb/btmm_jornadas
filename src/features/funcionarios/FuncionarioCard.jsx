import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import Icon from "../../ui/Icon.jsx";
import { estadoCls } from "../../ui/styles.js";
import { fecha } from "../../domain/fechas.js";
import { useT } from "../../i18n/useT.js";

/**
 * Vista en tarjeta de un funcionario. Reproduce toda la información de la
 * fila de la tabla. Optimizada para uso en campo: tamaños táctiles ≥ 48 px.
 */
export default function FuncionarioCard({ f, onEditar, onBorrar }) {
  const t = useT();
  return (
    <article className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <header className="flex items-start gap-3">
        <Avatar name={f.nombre} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-950">{f.nombre}</h3>
          <p className="truncate text-xs text-slate-500">{f.cedula} · {f.email}</p>
        </div>
        <Badge className={estadoCls(f.estado)}>{f.estado}</Badge>
      </header>

      <section className="mt-3 rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("funcionarios.card.cargo")}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">{f.puesto}</p>
        <p className="mt-1 text-xs font-bold text-emerald-800">{f.puestoOperativo || t("funcionarios.sinPuesto")}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge className="border-slate-200 bg-slate-50 text-slate-700">{f.condicion}</Badge>
          {f.ong && <Badge className="border-orange-200 bg-orange-100 text-orange-900">{t("funcionarios.filtroOng")}</Badge>}
        </div>
      </section>

      <section className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("funcionarios.card.jornada")}</p>
          <Badge
            className={`mt-1 ${
              f.jornada === "Acumulativa"
                ? "border-blue-200 bg-blue-100 text-blue-900"
                : "border-slate-200 bg-slate-100 text-slate-700"
            }`}
          >
            {f.jornada}
          </Badge>
          <p className="mt-1 text-[11px] font-semibold text-slate-700">{f.modalidad}</p>
          {f.jornada === "Acumulativa" && !f.resolucion && !f.ong && (
            <div className="mt-1">
              <Badge className="border-yellow-300 bg-yellow-100 text-yellow-900">{t("funcionarios.sinResolucion")}</Badge>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("funcionarios.card.disponibilidad")}</p>
          {f.disponibilidad ? (
            <>
              <Badge className="mt-1 border-emerald-200 bg-emerald-100 text-emerald-900">{t("funcionarios.si")}</Badge>
              <p className="mt-1 text-[11px] text-slate-500">{t("funcionarios.card.venceCorto", { fecha: fecha(f.vencimiento) })}</p>
            </>
          ) : (
            <Badge className="mt-1 border-slate-200 bg-slate-100 text-slate-600">{t("funcionarios.no")}</Badge>
          )}
        </div>
      </section>

      <section className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t("funcionarios.card.atributos")}</span>
        {f.policia && <Badge className="border-emerald-200 bg-emerald-50 text-emerald-900">Policía</Badge>}
        {f.brigada && <Badge className="border-orange-200 bg-orange-50 text-orange-900">Brigada</Badge>}
        {!f.policia && !f.brigada && <span className="text-xs text-slate-400">—</span>}
      </section>

      <footer className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={onEditar}
          aria-label={`${t("acciones.editar")} ${f.nombre}`}
          className="inline-flex min-h-touch items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
        >
          <Icon name="pencil" size={14} />
          {t("acciones.editar")}
        </button>
        <button
          type="button"
          onClick={onBorrar}
          aria-label={`${t("acciones.eliminar")} ${f.nombre}`}
          className="inline-flex min-h-touch items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
        >
          <Icon name="trash" size={14} />
          {t("acciones.eliminar")}
        </button>
      </footer>
    </article>
  );
}
