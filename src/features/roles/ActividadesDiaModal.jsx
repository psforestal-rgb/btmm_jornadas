import { useState } from "react";
import { fecha } from "../../domain/fechas.js";
import { actividadesEnDia } from "../../domain/actividades.js";
import { useEscapeClose } from "../../lib/a11y.js";
import ModalActividad from "../actividades/ModalActividad.jsx";

export default function ActividadesDiaModal({ funcionario, iso, allActividadesPlan, personas, setActividadesPlan, cerrar }) {
  useEscapeClose(cerrar);
  const [editando, setEditando] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const personasActivas = personas.filter((p) => p.estado !== "Inactivo");
  const actividades = actividadesEnDia(allActividadesPlan, iso).filter((a) => (a.funcionarios || []).includes(funcionario));
  const quitarFuncionario = (actId) =>
    setActividadesPlan((prev) =>
      prev.map((a) => (a.id === actId ? { ...a, funcionarios: a.funcionarios.filter((n) => n !== funcionario) } : a))
    );
  const eliminar = (actId) => {
    setActividadesPlan((prev) => prev.filter((a) => a.id !== actId));
    setConfirmarEliminar(null);
  };
  const guardar = (act) => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : act.fin || act.inicio };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan((prev) => prev.map((a) => (a.id === normal.id ? normal : a)));
    setEditando(null);
  };
  if (editando)
    return (
      <ModalActividad
        valor={editando}
        personas={personasActivas}
        cerrar={() => setEditando(null)}
        guardar={guardar}
        eliminar={(id) => {
          setActividadesPlan((prev) => prev.filter((a) => a.id !== id));
          setEditando(null);
        }}
        actividadesPlan={allActividadesPlan}
      />
    );
  if (!actividades.length)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
          <p className="text-sm text-slate-600">
            Ya no hay actividades de <strong>{funcionario}</strong> en este día.
          </p>
          <button onClick={cerrar} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Cerrar
          </button>
        </div>
      </div>
    );
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={`Actividades de ${funcionario} en ${fecha(iso)}`} className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold">Actividades · {funcionario}</h3>
            <p className="text-sm text-slate-600">
              {fecha(iso)} · {actividades.length} actividad{actividades.length !== 1 ? "es" : ""} planificada{actividades.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto p-5">
          {actividades.map((act) => (
            <div key={act.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2">
                <div className="font-semibold text-slate-950">{act.titulo}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {act.inicio === (act.fin || act.inicio) ? fecha(act.inicio) : `${fecha(act.inicio)} → ${fecha(act.fin || act.inicio)}`}
                  {act.lugar ? ` · 📍 ${act.lugar}` : ""}
                  {act.viatico ? " · 💵 Viático" : ""}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(act.funcionarios || []).map((n) => (
                    <span
                      key={n}
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        n === funcionario
                          ? "border-amber-400 bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                {(act.funcionarios || []).includes(funcionario) && (
                  <button
                    onClick={() => quitarFuncionario(act.id)}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    Quitar a {funcionario.split(" ")[0]}
                  </button>
                )}
                <button
                  onClick={() => setEditando({ ...act })}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Editar actividad
                </button>
                <button
                  onClick={() => setConfirmarEliminar(act.id)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
              {confirmarEliminar === act.id && (
                <div className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3">
                  <p className="text-sm font-semibold text-red-950">¿Eliminar esta actividad?</p>
                  <p className="mt-0.5 text-xs text-red-700">Desaparece para todos los funcionarios asignados.</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => eliminar(act.id)}
                      className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmarEliminar(null)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4">
          <button onClick={cerrar} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
