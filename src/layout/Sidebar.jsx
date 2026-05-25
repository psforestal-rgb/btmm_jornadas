import { APP_VERSION, APP_BUILD_TIME, APP_COMMIT, formatBuildTime } from "../lib/appVersion.js";
import Icon from "../ui/Icon.jsx";

export default function Sidebar({ view, setView, nAlertas }) {
  const grupos = [
    ["Principal", [["dashboard", "Dashboard", "home"], ["funcionarios", "Funcionarios", "users"]]],
    [
      "Jornadas",
      [
        ["dia", "Detalle del día", "calendar"],
        ["roles", "Roles", "chart"],
        ["planificacion", "Planificación general", "calendarDays"],
        ["planFuncionario", "Planificación/Funcionario", "clipboard"],
        ["adelantos", "Adelanto de viáticos", "banknote"],
        ["disponibilidad", "Disponibilidad", "shield"],
      ],
    ],
    ["Control", [["alertas", "Alertas", "bell"], ["datos", "Datos · respaldo", "shieldAlert"]]],
  ];
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-emerald-900 text-white lg:flex">
      <div className="border-b border-white/10 p-6">
        <div className="mb-3 flex items-center gap-3">
          <img src="/acc-logo.svg" alt="ACC" className="h-12 w-12 shrink-0 rounded-xl bg-white p-1" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">SINAC · Costa Rica</div>
            <div className="mt-0.5 text-xs font-semibold text-white/50">Área de Conservación Central</div>
          </div>
        </div>
        <div className="text-base font-semibold leading-snug">
          Bloque Tapantí
          <br />
          Macizo de la Muerte
        </div>
        <div className="mt-1.5 text-xs text-white/65">Gestión de jornadas laborales</div>
      </div>
      <nav className="flex-1 p-3">
        {grupos.map(([g, items]) => (
          <div key={g}>
            <div className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-white/45">{g}</div>
            {items.map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                aria-current={view === id ? "page" : undefined}
                className={`mb-1 flex min-h-touch w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  view === id ? "bg-white/20 text-white ring-1 ring-white/20" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon name={icon} size={18} />
                {label}
                {id === "alertas" && nAlertas > 0 && (
                  <span aria-label={`${nAlertas} alertas pendientes`} className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{nAlertas}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs">
        <strong className="font-semibold">P. Sánchez N.</strong>
        <div className="text-white/60">Guardaparques · ACC</div>
        <div
          className="mt-3 border-t border-white/10 pt-3 text-[10px] font-mono leading-tight text-white/40"
          title={`Versión ${APP_VERSION} · build ${APP_BUILD_TIME} · commit ${APP_COMMIT}`}
        >
          <div>
            v{APP_VERSION} <span className="text-white/30">·</span> {APP_COMMIT}
          </div>
          <div className="text-white/30">build {formatBuildTime(APP_BUILD_TIME)}</div>
        </div>
      </div>
    </aside>
  );
}
