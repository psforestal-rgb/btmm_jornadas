import { meses } from "../data/calendario.js";
import Icon from "../ui/Icon.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import SyncStatus from "../ui/SyncStatus.jsx";
import { useT } from "../i18n/useT.js";

/** Vistas que muestran navegación de mes/año en la barra superior. */
const VISTAS_CON_PERIODO = ["dashboard", "roles", "planificacion", "planFuncionario"];

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
    <header className="pnlq-no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur lg:px-6 lg:py-3">
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold uppercase tracking-widest text-slate-500">
              {t("app.breadcrumbBase", { titulo })}
            </div>
            {/* El título largo solo aporta en pantallas amplias. */}
            <h1 className="hidden text-xl font-semibold tracking-tight sm:block">{t("app.titulo")}</h1>
          </div>
          {/* En móvil, estado de respaldo junto al breadcrumb para no crecer en alto. */}
          <div className="flex shrink-0 items-center gap-2 xl:hidden">
            <SyncStatus />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {VISTAS_CON_PERIODO.includes(view) && (
            <>
              {/* Periodo como un solo control segmentado: ‹ mes año ›.
                  Bordes compartidos para que quepa en una línea de 360 px. */}
              <div
                role="group"
                aria-label={t("topbar.periodo")}
                className="inline-flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => moverMes(-1)}
                  aria-label={t("topbar.mesAnterior")}
                  className="inline-flex min-h-touch min-w-touch items-center justify-center px-2 text-slate-700 hover:bg-slate-50"
                >
                  <Icon name="chevronLeft" size={16} />
                </button>
                <select
                  aria-label={t("topbar.mes")}
                  className="min-h-touch border-x border-slate-200 bg-white px-1.5 text-sm font-medium text-slate-700 outline-none sm:px-2"
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
                  className="min-h-touch bg-white px-1.5 text-sm font-medium text-slate-700 outline-none sm:px-2"
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
                  className="inline-flex min-h-touch min-w-touch items-center justify-center border-l border-slate-200 px-2 text-slate-700 hover:bg-slate-50"
                >
                  <Icon name="chevronRight" size={16} />
                </button>
              </div>
              {view === "roles" && (
                <button
                  onClick={() => setCompact(!compact)}
                  className="inline-flex min-h-touch items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  aria-pressed={compact}
                >
                  {compact ? t("topbar.vistaAmplia") : t("topbar.vistaCompacta")}
                </button>
              )}
            </>
          )}
          <ThemeToggle />
          {/* En escritorio, estado de respaldo al final de la barra de acciones. */}
          <span className="hidden xl:inline-flex">
            <SyncStatus />
          </span>
        </div>
      </div>
    </header>
  );
}
