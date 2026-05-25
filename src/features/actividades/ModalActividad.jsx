import { useState } from "react";
import Badge from "../../ui/Badge.jsx";
import { opcionesPuestoOperativo } from "../../data/puestos.js";
import { opcionesLugarActividad, opcionesActividadBase, actividadRutinariaVisitantes } from "../../data/opciones.js";
import { useEscapeClose } from "../../lib/a11y.js";

export default function ModalActividad({ valor, personas, cerrar, guardar, eliminar, actividadesPlan = [] }) {
  useEscapeClose(cerrar);
  const [a, setA] = useState(valor);
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const cls = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";
  const porPuesto = opcionesPuestoOperativo.map((puesto) => ({ puesto, items: personas.filter((p) => p.puestoOperativo === puesto) }));
  const lugarModo = opcionesLugarActividad.includes(a.lugar) ? a.lugar : "Otro";
  const esExistente = actividadesPlan.some((x) => x.id === a.id);
  const finActividad = a.unDia ? a.inicio : a.fin || a.inicio;
  const traslapa = (x) => x.id !== a.id && x.inicio <= finActividad && (x.fin || x.inicio) >= a.inicio;
  const actividadesFuncionario = (nombre) => actividadesPlan.filter((x) => traslapa(x) && (x.funcionarios || []).includes(nombre));
  const agregarFuncionario = (nombre) => {
    if (!a.funcionarios.includes(nombre)) set("funcionarios", [...a.funcionarios, nombre]);
  };
  const quitarFuncionario = (nombre) => set("funcionarios", a.funcionarios.filter((x) => x !== nombre));
  const toggleFuncionario = (nombre) => (a.funcionarios.includes(nombre) ? quitarFuncionario(nombre) : agregarFuncionario(nombre));
  const modificarActividadExistente = (act) => setA({ ...act });
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={esExistente ? "Editar actividad" : "Agregar actividad"} className="max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold">{esExistente ? "Editar actividad" : "Agregar actividad"}</h3>
            <p className="text-sm text-slate-600">Registre actividad, periodo, lugar, funcionarios participantes y necesidad de adelanto de viático.</p>
          </div>
          <button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Actividad</span>
              <div className="grid gap-2 md:grid-cols-[260px_1fr]">
                <select
                  className={cls}
                  value={a.titulo === actividadRutinariaVisitantes ? actividadRutinariaVisitantes : "Otra"}
                  onChange={(e) => set("titulo", e.target.value === "Otra" ? "" : e.target.value)}
                >
                  {opcionesActividadBase.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                  <option value="Otra">Otra actividad</option>
                </select>
                <input
                  className={cls}
                  value={a.titulo}
                  onChange={(e) => set("titulo", e.target.value)}
                  placeholder="O escriba otra actividad: patrullaje, inspección, reunión, mantenimiento..."
                />
              </div>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Fecha inicio</span>
              <input type="date" className={cls} value={a.inicio} onChange={(e) => set("inicio", e.target.value)} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Fecha final</span>
              <input type="date" className={cls} value={a.unDia ? a.inicio : a.fin} disabled={a.unDia} onChange={(e) => set("fin", e.target.value)} />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 p-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={a.unDia}
                onChange={(e) => setA((p) => ({ ...p, unDia: e.target.checked, fin: e.target.checked ? p.inicio : p.fin }))}
              />
              Actividad de un solo día
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 p-3 text-sm font-semibold text-orange-950">
              <input type="checkbox" checked={a.viatico} onChange={(e) => set("viatico", e.target.checked)} />
              Requiere tramitar adelanto de viático
            </label>
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Lugar</span>
              <div className="grid gap-2">
                <select className={cls} value={lugarModo} onChange={(e) => set("lugar", e.target.value === "Otro" ? "" : e.target.value)}>
                  {opcionesLugarActividad.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                  <option value="Otro">Otro</option>
                </select>
                {lugarModo === "Otro" && (
                  <input
                    className={cls}
                    value={a.lugar}
                    onChange={(e) => set("lugar", e.target.value)}
                    placeholder="Escriba otro lugar: sector, sendero, oficina, comunidad..."
                  />
                )}
              </div>
            </label>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Funcionarios participantes</span>
              <Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">{a.funcionarios.length} seleccionados</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {porPuesto.map((g) => (
                <div key={g.puesto} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{g.puesto}</div>
                  <div className="space-y-1.5">
                    {g.items.map((f) => {
                      const avisos = actividadesFuncionario(f.nombre);
                      const seleccionado = a.funcionarios.includes(f.nombre);
                      return (
                        <div
                          key={f.id}
                          className={`rounded-xl border px-2 py-2 text-xs font-bold ${
                            seleccionado
                              ? "border-emerald-300 bg-emerald-100 text-emerald-950"
                              : avisos.length
                              ? "border-yellow-300 bg-yellow-50 text-yellow-950"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={seleccionado} onChange={() => toggleFuncionario(f.nombre)} />
                            {f.nombre}
                          </label>
                          {avisos.length > 0 && (
                            <div className="mt-2 rounded-lg border border-yellow-300 bg-yellow-100 p-2 text-[11px] leading-snug text-yellow-950">
                              <div className="font-black">Funcionario con actividad ya planificada</div>
                              <div className="mt-1 font-bold">{avisos.map((x) => x.titulo).join(" · ")}</div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => agregarFuncionario(f.nombre)}
                                  className="rounded-lg bg-yellow-700 px-2 py-1 text-[10px] font-bold text-white hover:bg-yellow-800"
                                >
                                  Agregar de todos modos
                                </button>
                                <button
                                  type="button"
                                  onClick={() => modificarActividadExistente(avisos[0])}
                                  className="rounded-lg border border-yellow-700 bg-white px-2 py-1 text-[10px] font-bold text-yellow-900 hover:bg-yellow-50"
                                >
                                  Modificar actividad
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <label className="mt-5 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Observaciones</span>
            <textarea
              className={`${cls} min-h-24`}
              value={a.observaciones}
              onChange={(e) => set("observaciones", e.target.value)}
              placeholder="Detalle operativo, coordinación, expediente, requerimientos, vehículo, equipo, etc."
            />
          </label>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 bg-slate-50 p-4">
          <div>
            {esExistente && (
              <button
                onClick={() => eliminar(a.id)}
                className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
              >
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={cerrar} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Cancelar
            </button>
            <button onClick={() => guardar(a)} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Guardar actividad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
