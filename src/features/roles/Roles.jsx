import { useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Icon from "../../ui/Icon.jsx";
import { meses } from "../../data/calendario.js";
import { puestos } from "../../data/puestos.js";
import { dim } from "../../domain/fechas.js";
import { useIsMobile } from "../../lib/responsive.js";
import { useT } from "../../i18n/useT.js";
import PuestoRolCard from "./PuestoRolCard.jsx";
import PuestoRolCardSemana from "./PuestoRolCardSemana.jsx";
import RolesPrintHeader, { RolesPrintFooter } from "./RolesPrintMatter.jsx";

export default function Roles({
  year,
  month,
  compact,
  roleData,
  setRoleData,
  personas,
  actividadesPlan,
  setActividadesPlan,
  reposiciones = [],
}) {
  const t = useT();
  const days = Array.from({ length: dim(year, month) }, (_, i) => i + 1);
  const gruposRoles = puestos.map((p) => ({
    ...p,
    funcionarios: personas
      .filter((f) => (f.puestoOperativo || "Puesto Quetzales") === p.nombre && f.estado !== "Inactivo")
      .map((f) => f.nombre),
  }));
  const limpiarMes = () => {
    const pref = `${year}-${month + 1}-`;
    setRoleData((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([k]) => !k.startsWith(pref) && !k.startsWith(`CFG-${year}-${month + 1}-`))
      )
    );
  };
  const isMobile = useIsMobile();
  const [vista, setVista] = useState(null);
  const vistaEfectiva = vista ?? (isMobile ? "semana" : "tabla");

  // La impresión siempre usa la tabla mensual (formato administrativo
  // tradicional), independientemente de la vista que el usuario tenga
  // activa en pantalla. Forzamos `vista=tabla` justo antes de imprimir.
  const handleImprimir = () => {
    if (vistaEfectiva !== "tabla") {
      setVista("tabla");
      // Esperar a que React re-renderice antes de abrir el diálogo.
      window.setTimeout(() => window.print(), 50);
    } else {
      window.print();
    }
  };

  return (
    <section className="space-y-4">
      <Card
        title={t("roles.titulo", { mes: meses[month], anio: year })}
        icon="📊"
        action={
          <div className="pnlq-no-print flex flex-wrap items-center gap-2">
            <div role="group" aria-label={t("roles.vistaAria")} className="inline-flex overflow-hidden rounded-xl border border-slate-300 bg-white">
              <button
                type="button"
                onClick={() => setVista("tabla")}
                aria-pressed={vistaEfectiva === "tabla"}
                className={`min-h-touch px-3 py-2 text-xs font-bold ${
                  vistaEfectiva === "tabla" ? "bg-emerald-800 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t("roles.vistaTabla")}
              </button>
              <button
                type="button"
                onClick={() => setVista("semana")}
                aria-pressed={vistaEfectiva === "semana"}
                className={`min-h-touch border-l border-slate-300 px-3 py-2 text-xs font-bold ${
                  vistaEfectiva === "semana" ? "bg-emerald-800 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t("roles.vistaSemana")}
              </button>
            </div>
            <button
              onClick={handleImprimir}
              className="inline-flex min-h-touch items-center gap-1 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
              title={t("print.imprimir")}
            >
              <Icon name="file" size={14} />
              <span className="hidden sm:inline">{t("print.imprimir")}</span>
              <span className="sm:hidden">{t("print.imprimirCorto")}</span>
            </button>
            <button
              onClick={limpiarMes}
              className="min-h-touch rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              {t("roles.restaurar")}
            </button>
            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">{t("roles.edicionFila")}</Badge>
          </div>
        }
      >
        <div className="pnlq-no-print mb-3 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-sm">
          <span className="rounded-lg border border-emerald-300 bg-emerald-200 px-2 py-1 text-emerald-950">{t("roles.leyenda.turno")}</span>
          <span className="rounded-lg border border-amber-300 bg-amber-200 px-2 py-1 text-amber-950">{t("roles.leyenda.libre")}</span>
          <span className="rounded-lg border border-sky-300 bg-sky-200 px-2 py-1 text-sky-950">{t("roles.leyenda.vacaciones")}</span>
          <span className="rounded-lg border border-rose-300 bg-rose-200 px-2 py-1 text-rose-950">{t("roles.leyenda.incapacidad")}</span>
          <span className="rounded-lg border border-violet-300 bg-violet-200 px-2 py-1 text-violet-950">{t("roles.leyenda.otro")}</span>
        </div>
        <div className="space-y-6">
          {gruposRoles.map((g, gi) => (
            <div key={`puesto-${g.nombre}`} className={`pnlq-print-page ${gi > 0 ? "pnlq-print-break-before" : ""}`}>
              <RolesPrintHeader mes={meses[month]} anio={year} puesto={g.nombre} />
              {vistaEfectiva === "semana" ? (
                <PuestoRolCardSemana
                  grupo={g}
                  year={year}
                  month={month}
                  roleData={roleData}
                  setRoleData={setRoleData}
                  personas={personas}
                  actividadesPlan={actividadesPlan}
                  setActividadesPlan={setActividadesPlan}
                  reposiciones={reposiciones}
                />
              ) : (
                <PuestoRolCard
                  grupo={g}
                  gi={gi}
                  days={days}
                  year={year}
                  month={month}
                  compact={compact}
                  roleData={roleData}
                  setRoleData={setRoleData}
                  personas={personas}
                  actividadesPlan={actividadesPlan}
                  setActividadesPlan={setActividadesPlan}
                  reposiciones={reposiciones}
                />
              )}
              <RolesPrintFooter />
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
