import { meses } from "../data/calendario.js";
import Icon from "../ui/Icon.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import { useT } from "../i18n/useT.js";

export default function Topbar({ view, setView, month, setMonth, year, setYear, compact, setCompact }) {
  const t = useT();
  const titulo = t(`view.${view}`);
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
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t("app.breadcrumbBase", { titulo })}</div>
          <h1 className="text-xl font-semibold tracking-tight">{t("app.titulo")}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(view === "dashboard" || view === "roles" || view === "planificacion" || view === "planFuncionario") && (
            <>
              <button
                onClick={() => moverMes(-1)}
                aria-label={t("topbar.mesAnterior")}
                className="inline-flex min-h-touch items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                <Icon name="chevronLeft" size={16} />
                <span className="hidden sm:inline">{t("topbar.mesAnterior")}</span>
                <span className="sm:hidden">{t("topbar.mes")}</span>
              </button>
              <select
                aria-label={t("topbar.mes")}
                className="min-h-touch rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
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
                aria-label={t("topbar.anio")}
                className="min-h-touch rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[2025, 2026, 2027, 2028, 2029].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <button
                onClick={() => moverMes(1)}
                aria-label={t("topbar.mesSiguiente")}
                className="inline-flex min-h-touch items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                <span className="hidden sm:inline">{t("topbar.mesSiguiente")}</span>
                <span className="sm:hidden">{t("topbar.mes")}</span>
                <Icon name="chevronRight" size={16} />
              </button>
              {view === "roles" && (
                <button
                  onClick={() => setCompact(!compact)}
                  className="inline-flex min-h-touch items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  aria-pressed={compact}
                >
                  {compact ? t("topbar.vistaAmplia") : t("topbar.vistaCompacta")}
                </button>
              )}
            </>
          )}
          <ThemeToggle />
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label={`Estado: ${t("app.estado").toLowerCase()}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            {t("app.estado")}
          </span>
        </div>
      </div>
    </header>
  );
}
