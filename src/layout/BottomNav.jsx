import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { useT } from "../i18n/useT.js";

export default function BottomNav({ view, setView, nAlertas }) {
  const t = useT();
  const [moreOpen, setMoreOpen] = useState(false);
  const main = [
    ["dashboard", t("bottomNav.inicio"), "home"],
    ["funcionarios", t("bottomNav.personal"), "users"],
    ["planificacion", t("bottomNav.plan"), "calendarDays"],
    ["alertas", t("bottomNav.alertas"), "bell"],
  ];
  const more = [
    ["dia", t("bottomNav.dia"), "calendar"],
    ["roles", t("bottomNav.roles"), "chart"],
    ["planFuncionario", t("bottomNav.planFunc"), "clipboard"],
    ["adelantos", t("bottomNav.viaticos"), "banknote"],
    ["disponibilidad", t("bottomNav.disponib"), "shield"],
    ["datos", t("bottomNav.datos"), "shieldAlert"],
    ["configuracion", t("bottomNav.config"), "traffic"],
  ];
  return (
    <>
      {moreOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMoreOpen(false)} />}
      {moreOpen && (
        <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {more.map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => {
                  setView(id);
                  setMoreOpen(false);
                }}
                aria-current={view === id ? "page" : undefined}
                className={`flex min-h-touch items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold ${
                  view === id ? "bg-emerald-800 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon name={icon} size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white lg:hidden" aria-label={t("bottomNav.navAria")}>
        <div className="grid grid-cols-5">
          {main.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => {
                setView(id);
                setMoreOpen(false);
              }}
              aria-current={view === id ? "page" : undefined}
              className={`relative flex min-h-touch flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-semibold ${
                view === id ? "text-emerald-800" : "text-slate-500"
              }`}
            >
              <Icon name={icon} size={22} />
              {label}
              {id === "alertas" && nAlertas > 0 && (
                <span
                  aria-label={t("bottomNav.alertasAria", { n: nAlertas })}
                  className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                >
                  {nAlertas}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            aria-label={t("bottomNav.masAria")}
            className={`flex min-h-touch flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-semibold ${
              moreOpen ? "text-emerald-800" : "text-slate-500"
            }`}
          >
            <Icon name="menu" size={22} />
            {t("bottomNav.mas")}
          </button>
        </div>
      </nav>
    </>
  );
}
