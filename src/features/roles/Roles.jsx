import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import { meses } from "../../data/calendario.js";
import { puestos } from "../../data/puestos.js";
import { dim } from "../../domain/fechas.js";
import PuestoRolCard from "./PuestoRolCard.jsx";

export default function Roles({
  year,
  month,
  compact,
  roleData,
  setRoleData,
  personas,
  actividadesPlan,
  setActividadesPlan,
}) {
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
  return (
    <section className="space-y-4">
      <Card
        title={`Roles mensuales — ${meses[month]} ${year}`}
        icon="📊"
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={limpiarMes}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Restaurar mes
            </button>
            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">Edición por fila</Badge>
          </div>
        }
      >
        <div className="mb-3 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-sm">
          <span className="rounded-lg border border-emerald-300 bg-emerald-200 px-2 py-1 text-emerald-950">T1 Turno</span>
          <span className="rounded-lg border border-amber-300 bg-amber-200 px-2 py-1 text-amber-950">L1 Libre</span>
          <span className="rounded-lg border border-sky-300 bg-sky-200 px-2 py-1 text-sky-950">V1 Vacaciones</span>
          <span className="rounded-lg border border-rose-300 bg-rose-200 px-2 py-1 text-rose-950">I1 Incapacidad</span>
          <span className="rounded-lg border border-violet-300 bg-violet-200 px-2 py-1 text-violet-950">O1 Otro</span>
        </div>
        <div className="space-y-6">
          {gruposRoles.map((g, gi) => (
            <PuestoRolCard
              key={g.nombre}
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
            />
          ))}
        </div>
      </Card>
    </section>
  );
}
