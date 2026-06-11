import { useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import { meses, diasLargos } from "../../data/calendario.js";
import { dim, pad2 } from "../../domain/fechas.js";
import { codigoRolFuncionario, esRolActivo } from "../../domain/roles.js";
import { conflictosActividadDia } from "../../domain/conflictos.js";
import { useFeriadosDelAno } from "../../lib/useFeriadosDelAno.js";
import { useT } from "../../i18n/useT.js";
import ModalActividad from "../actividades/ModalActividad.jsx";

export default function Planificacion({
  year,
  month,
  personas,
  actividadesPlan,
  setActividadesPlan,
  roleData,
  setView,
  setDiaVista,
}) {
  const t = useT();
  const [modal, setModal] = useState(null);
  const feriados = useFeriadosDelAno(year);
  const days = Array.from({ length: dim(year, month) }, (_, i) => i + 1);
  const blanks = Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => i);
  const isoDia = (d) => `${year}-${pad2(month + 1)}-${pad2(d)}`;
  const personasActivas = personas.filter((p) => p.estado !== "Inactivo");
  const nuevo = (fechaIso) => ({
    id: `a${Date.now()}`,
    titulo: "",
    inicio: fechaIso,
    fin: fechaIso,
    unDia: true,
    funcionarios: [],
    lugar: "",
    observaciones: "",
    viatico: false,
  });
  const enDia = (a, iso) => iso >= a.inicio && iso <= (a.fin || a.inicio);
  const actividadesDia = (d) =>
    actividadesPlan
      .filter((a) => enDia(a, isoDia(d)))
      .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.titulo.localeCompare(b.titulo));
  const guardar = (act) => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : act.fin || act.inicio };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan((prev) =>
      prev.some((a) => a.id === normal.id) ? prev.map((a) => (a.id === normal.id ? normal : a)) : [...prev, normal]
    );
    setModal(null);
  };
  const eliminar = (id) => {
    setActividadesPlan((prev) => prev.filter((a) => a.id !== id));
    setModal(null);
  };
  const turnoEnDia = (d) =>
    personasActivas.filter((p) => esRolActivo(codigoRolFuncionario(personas, roleData, year, month, p.nombre, d, feriados))).length;
  return (
    <Card
      title={t("planificacion.titulo", { mes: meses[month], anio: year })}
      icon="🗓️"
      action={
        <button
          onClick={() => setModal(nuevo(isoDia(Math.min(new Date().getDate(), dim(year, month)))))}
          className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          {t("planificacion.agregar")}
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge className="border-emerald-300 bg-emerald-100 text-emerald-950">{t("planificacion.leyendaProgramada")}</Badge>
        <Badge className="border-orange-300 bg-orange-100 text-orange-950">{t("planificacion.leyendaViatico")}</Badge>
        <Badge className="border-slate-300 bg-slate-100 text-slate-900">{t("planificacion.leyendaFinde")}</Badge>
        <Badge className="border-slate-300 bg-slate-100 text-slate-600">{t("planificacion.leyendaTurno")}</Badge>
      </div>
      {/* En móvil el calendario de 7 columnas necesita desplazamiento
          horizontal: min-w fija el ancho legible y overflow-x lo habilita. */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="min-w-[700px]">
        <div className="grid grid-cols-7 bg-slate-900 text-white">
          {diasLargos.map((d) => (
            <div key={d} className="border-r border-white/10 px-2 py-2 text-center text-[11px] font-semibold tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-slate-200">
          {blanks.map((b) => (
            <div key={b} className="min-h-[174px] border-b border-r border-slate-300 bg-slate-100" />
          ))}
          {days.map((d) => {
            const dow = new Date(year, month, d).getDay();
            const items = actividadesDia(d);
            const turno = turnoEnDia(d);
            return (
              <div
                key={d}
                className={`min-h-[174px] border-b border-r border-slate-300 p-2 ${dow === 0 || dow === 6 ? "bg-slate-100" : "bg-white"}`}
              >
                <div className="mb-2 flex items-start justify-between gap-1">
                  <button
                    onClick={() => {
                      setDiaVista(isoDia(d));
                      setView("dia");
                    }}
                    title={t("planificacion.titleDetalleDia")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
                  >
                    {d}
                  </button>
                  <div className="flex flex-col items-end gap-0.5">
                    {turno > 0 && (
                      <span
                        className="rounded-full bg-slate-600 px-1.5 py-0.5 text-[9px] font-semibold text-white"
                        title={t("planificacion.titleTurno", { n: turno })}
                      >
                        👥 {turno}
                      </span>
                    )}
                    {items.length > 0 && (
                      <span
                        className="rounded-full bg-emerald-800 px-1.5 py-0.5 text-[9px] font-bold text-white"
                        title={t("planificacion.titleActs", { n: items.length })}
                      >
                        {t("planificacion.actsBadge", { n: items.length })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {items.map((a) => {
                    const conf = conflictosActividadDia(a, d, year, month, personas, roleData, feriados);
                    return (
                      <button
                        key={a.id}
                        onClick={() => setModal({ ...a })}
                        className={`w-full rounded-xl border px-2 py-1.5 text-left shadow-sm transition hover:brightness-95 ${
                          conf.length
                            ? "border-red-500 bg-red-50 text-red-950 ring-2 ring-red-500"
                            : a.viatico
                            ? "border-orange-300 bg-orange-50 text-orange-950"
                            : "border-emerald-200 bg-emerald-50 text-emerald-950"
                        }`}
                      >
                        <div className="line-clamp-2 text-[11px] font-semibold leading-tight">{a.titulo}</div>
                        <div className="mt-1 text-[10px] font-bold opacity-80">
                          {a.funcionarios.length ? a.funcionarios.slice(0, 3).join(", ") : t("planificacion.sinFuncionarios")}
                          {a.funcionarios.length > 3 ? " " + t("planificacion.masFuncionarios", { n: a.funcionarios.length - 3 }) : ""}
                        </div>
                        {a.lugar && <div className="mt-0.5 text-[10px] font-bold opacity-70">📍 {a.lugar}</div>}
                        {a.viatico && (
                          <div className="mt-1 inline-flex rounded-md bg-orange-200 px-1.5 py-0.5 text-[9px] font-bold text-orange-950">
                            {t("planificacion.viaticoTag")}
                          </div>
                        )}
                        {conf.length > 0 && (
                          <div className="mt-1 rounded-md bg-red-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {t("planificacion.rolBadge", { nombres: conf.join(", ") })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
      {modal && (
        <ModalActividad
          valor={modal}
          personas={personasActivas}
          cerrar={() => setModal(null)}
          guardar={guardar}
          eliminar={eliminar}
          actividadesPlan={actividadesPlan}
        />
      )}
    </Card>
  );
}
