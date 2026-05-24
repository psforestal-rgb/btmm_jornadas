import { useState } from "react";

export default function BottomNav({ view, setView, nAlertas }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const main = [
    ["dashboard", "Inicio", "🏠"],
    ["funcionarios", "Personal", "👥"],
    ["planificacion", "Plan", "🗓️"],
    ["alertas", "Alertas", "🔔"],
  ];
  const more = [
    ["dia", "Día", "📅"],
    ["roles", "Roles", "📊"],
    ["planFuncionario", "Plan/Func.", "📋"],
    ["adelantos", "Viáticos", "💵"],
    ["disponibilidad", "Disponib.", "🛡️"],
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
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold ${
                  view === id ? "bg-emerald-800 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white lg:hidden">
        <div className="grid grid-cols-5">
          {main.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => {
                setView(id);
                setMoreOpen(false);
              }}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-semibold ${
                view === id ? "text-emerald-800" : "text-slate-500"
              }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              {label}
              {id === "alertas" && nAlertas > 0 && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {nAlertas}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-semibold ${
              moreOpen ? "text-emerald-800" : "text-slate-500"
            }`}
          >
            <span className="text-lg leading-none">☰</span>
            Más
          </button>
        </div>
      </nav>
    </>
  );
}
