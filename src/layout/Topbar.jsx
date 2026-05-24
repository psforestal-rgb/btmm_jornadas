import { meses } from "../data/calendario.js";

export default function Topbar({ view, setView, month, setMonth, year, setYear, compact, setCompact }) {
  const titulo = {
    dashboard: "Dashboard",
    dia: "Detalle del día",
    funcionarios: "Funcionarios",
    roles: "Roles",
    planificacion: "Planificación general",
    planFuncionario: "Planificación/Funcionario",
    adelantos: "Adelanto de viáticos",
    disponibilidad: "Disponibilidad",
    alertas: "Alertas",
  }[view];
  const moverMes = (paso) => {
    let nuevoMes = month + paso;
    let nuevoAno = year;
    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAno -= 1;
    }
    if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAno += 1;
    }
    setMonth(nuevoMes);
    setYear(nuevoAno);
  };
  return (
    <header className="sticky top-0 z-30 border-b border-slate-300 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">PNLQ / {titulo}</div>
          <h1 className="text-xl font-semibold tracking-tight">Gestión de jornadas laborales</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(view === "dashboard" || view === "roles" || view === "planificacion" || view === "planFuncionario") && (
            <>
              <button
                onClick={() => moverMes(-1)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                ← Mes anterior
              </button>
              <select
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {meses.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[2025, 2026, 2027, 2028, 2029].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <button
                onClick={() => moverMes(1)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Mes siguiente →
              </button>
              {view === "roles" && (
                <button
                  onClick={() => setCompact(!compact)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  {compact ? "Vista amplia" : "Vista compacta"}
                </button>
              )}
            </>
          )}
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Activo
          </span>
        </div>
      </div>
    </header>
  );
}
