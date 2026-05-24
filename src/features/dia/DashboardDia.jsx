import { useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import { codigoCls } from "../../ui/styles.js";
import { meses, diasLargos } from "../../data/calendario.js";
import { opcionesPuestoOperativo } from "../../data/puestos.js";
import { pad2, fecha } from "../../domain/fechas.js";
import { codigoRolFuncionario, esRolActivo, categoriaDe } from "../../domain/roles.js";
import { actividadesEnDia } from "../../domain/actividades.js";
import { conflictosActividadDia } from "../../domain/conflictos.js";
import ModalActividad from "../actividades/ModalActividad.jsx";

export default function DashboardDia({ diaVista, setDiaVista, personas, actividadesPlan, setActividadesPlan, roleData }) {
  const [modalActividad, setModalActividad] = useState(null);
  const [yearD, monthD, dayD] = diaVista.split("-").map(Number);
  const monthIdx = monthD - 1;
  const personasActivas = personas.filter((p) => p.estado !== "Inactivo");
  const finde = [0, 6].includes(new Date(diaVista + "T12:00:00").getDay());
  const dowLabel = diasLargos[new Date(diaVista + "T12:00:00").getDay()];

  const statusDia = personasActivas.map((p) => {
    const rol = codigoRolFuncionario(personas, roleData, yearD, monthIdx, p.nombre, dayD);
    const cat = categoriaDe(rol);
    const enTurno = esRolActivo(rol);
    const acts = actividadesEnDia(actividadesPlan, diaVista).filter((a) => (a.funcionarios || []).includes(p.nombre));
    return { ...p, rol, cat, enTurno, acts, tieneActividad: acts.length > 0, tieneViatico: acts.some((a) => a.viatico) };
  });

  const enTurnoConAct = statusDia.filter((p) => p.enTurno && p.tieneActividad);
  const enTurnoSinAct = statusDia.filter((p) => p.enTurno && !p.tieneActividad);
  const fueraDeTurno = statusDia.filter((p) => !p.enTurno);
  const conViatico = statusDia.filter((p) => p.tieneViatico);
  const actsDelDia = actividadesEnDia(actividadesPlan, diaVista).sort((a, b) => a.titulo.localeCompare(b.titulo));
  const statsPuesto = opcionesPuestoOperativo.map((puesto) => {
    const del = statusDia.filter((p) => (p.puestoOperativo || "") === puesto);
    return { puesto, turno: del.filter((p) => p.enTurno).length, programados: del.filter((p) => p.tieneActividad).length, total: del.length };
  });
  const catLabel = { L: "Libre", V: "Vacaciones", I: "Incapacidad", O: "Otro", "": "Sin marcar" };
  const catCls = {
    L: "border-amber-200 bg-amber-100 text-amber-900",
    V: "border-sky-200 bg-sky-100 text-sky-900",
    I: "border-red-200 bg-red-100 text-red-900",
    O: "border-violet-200 bg-violet-100 text-violet-900",
    "": "border-slate-200 bg-slate-100 text-slate-700",
  };
  const fueraPorCat = fueraDeTurno.reduce((acc, p) => {
    const k = p.cat || "";
    if (!acc[k]) acc[k] = [];
    acc[k].push(p);
    return acc;
  }, {});

  const moveDay = (delta) => {
    const d = new Date(diaVista + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setDiaVista(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
  };
  const guardar = (act) => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : act.fin || act.inicio };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan((prev) =>
      prev.some((a) => a.id === normal.id) ? prev.map((a) => (a.id === normal.id ? normal : a)) : [...prev, normal]
    );
    setModalActividad(null);
  };
  const eliminar = (id) => {
    setActividadesPlan((prev) => prev.filter((a) => a.id !== id));
    setModalActividad(null);
  };
  const nuevaAct = (funs = [], lugar = "") => ({
    id: `a${Date.now()}`,
    titulo: "",
    inicio: diaVista,
    fin: diaVista,
    unDia: true,
    funcionarios: funs,
    lugar,
    observaciones: "",
    viatico: false,
  });

  return (
    <section className="space-y-5">
      {/* Navegación de fecha */}
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button onClick={() => moveDay(-1)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
          ← Anterior
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {dowLabel} · {meses[monthIdx]} {yearD}
          </span>
          <input
            type="date"
            value={diaVista}
            onChange={(e) => e.target.value && setDiaVista(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-700"
          />
        </div>
        <button onClick={() => moveDay(1)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
          Siguiente →
        </button>
      </div>

      {/* KPIs del día */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "En turno", value: enTurnoConAct.length + enTurnoSinAct.length, color: "text-emerald-700", bg: "border-emerald-200 bg-emerald-50" },
          { label: "Con actividad", value: enTurnoConAct.length, color: "text-emerald-700", bg: "border-emerald-200 bg-emerald-50" },
          {
            label: "Sin actividad",
            value: enTurnoSinAct.length,
            color: enTurnoSinAct.length > 0 ? "text-amber-600" : "text-slate-600",
            bg: enTurnoSinAct.length > 0 ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white",
          },
          { label: "Fuera de turno", value: fueraDeTurno.length, color: "text-slate-600", bg: "border-slate-200 bg-white" },
          {
            label: "Con viático",
            value: conViatico.length,
            color: conViatico.length > 0 ? "text-orange-700" : "text-slate-600",
            bg: conViatico.length > 0 ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white",
          },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
            <div className={`mt-1 text-4xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Resumen por puesto */}
      <Card title="Por puesto operativo" icon="📍">
        <div className="grid gap-3 md:grid-cols-3">
          {statsPuesto.map(({ puesto, turno, programados, total }) => (
            <div key={puesto} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-800">{puesto.replace("Puesto ", "")}</div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className="text-2xl font-black text-emerald-700">{turno}</div>
                  <div className="text-[10px] text-slate-500">turno</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-blue-700">{programados}</div>
                  <div className="text-[10px] text-slate-500">plan.</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-500">{total}</div>
                  <div className="text-[10px] text-slate-500">activos</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actividades del día */}
      <Card
        title={`Actividades planificadas (${actsDelDia.length})`}
        icon="🗓️"
        action={
          <button onClick={() => setModalActividad(nuevaAct())} className="rounded-xl bg-emerald-800 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
            + Nueva
          </button>
        }
      >
        {actsDelDia.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">Sin actividades planificadas para este día</div>
        ) : (
          <div className="space-y-3">
            {actsDelDia.map((act) => {
              const conf = conflictosActividadDia(act, dayD, yearD, monthIdx, personas, roleData);
              return (
                <div
                  key={act.id}
                  className={`rounded-2xl border p-4 ${
                    conf.length ? "border-red-300 bg-red-50" : act.viatico ? "border-orange-200 bg-orange-50" : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-950">{act.titulo}</div>
                      {act.lugar && <div className="mt-0.5 text-xs text-slate-500">📍 {act.lugar}</div>}
                      {act.inicio !== (act.fin || act.inicio) && (
                        <div className="mt-0.5 text-xs text-slate-400">
                          {fecha(act.inicio)} → {fecha(act.fin)}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-start gap-1.5">
                      {act.viatico && <Badge className="border-orange-300 bg-orange-100 text-orange-900">💵 Viático</Badge>}
                      {conf.length > 0 && (
                        <Badge className="border-red-300 bg-red-100 text-red-900">⚠ {conf.length} conflicto{conf.length > 1 ? "s" : ""}</Badge>
                      )}
                      <button
                        onClick={() => setModalActividad({ ...act })}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                  {act.funcionarios.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {act.funcionarios.map((n) => (
                        <span
                          key={n}
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            conf.includes(n) ? "border-red-300 bg-white text-red-800" : "border-emerald-200 bg-white text-emerald-800"
                          }`}
                        >
                          {n}
                          {conf.includes(n) ? " ⚠" : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* En turno con actividad */}
      <Card title={`En turno · con actividad (${enTurnoConAct.length})`} icon="✅">
        {enTurnoConAct.length === 0 ? (
          <p className="text-sm text-slate-400">Ningún funcionario en turno tiene actividad programada</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {enTurnoConAct.map((p) => (
              <div key={p.id} className="flex items-start gap-3 py-3">
                <Avatar name={p.nombre} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-950">{p.nombre}</span>
                    <Badge className={codigoCls(p.rol, finde)}>{p.rol}</Badge>
                    {p.tieneViatico && <Badge className="border-orange-200 bg-orange-100 text-orange-900">💵 Viático</Badge>}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{p.puestoOperativo}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.acts.map((a) => (
                      <span key={a.id} className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] text-emerald-800">
                        {a.titulo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* En turno sin actividad */}
      <Card title={`En turno · sin actividad (${enTurnoSinAct.length})`} icon={enTurnoSinAct.length > 0 ? "⚠️" : "✅"}>
        {enTurnoSinAct.length === 0 ? (
          <p className="text-sm text-slate-400">Todos los funcionarios en turno tienen actividad asignada</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {enTurnoSinAct.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <Avatar name={p.nombre} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-950">{p.nombre}</span>
                    <Badge className={codigoCls(p.rol, finde)}>{p.rol}</Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {p.puestoOperativo} · {p.puesto}
                  </div>
                </div>
                <button
                  onClick={() => setModalActividad(nuevaAct([p.nombre], p.puestoOperativo || ""))}
                  className="shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  + Asignar
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Fuera de turno */}
      <Card title={`Fuera de turno (${fueraDeTurno.length})`} icon="📴">
        {fueraDeTurno.length === 0 ? (
          <p className="text-sm text-slate-400">Todos los funcionarios activos están en turno</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(fueraPorCat)
              .sort(([a], [b]) => (catLabel[a] || "z").localeCompare(catLabel[b] || "z"))
              .map(([cat, list]) => (
                <div key={cat}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${catCls[cat]}`}>{catLabel[cat] || "Sin marcar"}</span>
                    <span className="text-xs text-slate-400">
                      {list.length} funcionario{list.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                        <Avatar name={p.nombre} />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{p.nombre}</div>
                          <div className="text-[10px] text-slate-400">{(p.puestoOperativo || "").replace("Puesto ", "")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Con viático */}
      {conViatico.length > 0 && (
        <Card title={`Con viático este día (${conViatico.length})`} icon="💵">
          <div className="divide-y divide-slate-100">
            {conViatico.map((p) => (
              <div key={p.id} className="flex items-start gap-3 py-2.5">
                <Avatar name={p.nombre} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-950">{p.nombre}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.acts
                      .filter((a) => a.viatico)
                      .map((a) => (
                        <span key={a.id} className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] text-orange-800">
                          {a.titulo}
                          {a.lugar ? ` · ${a.lugar}` : ""}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {modalActividad && (
        <ModalActividad
          valor={modalActividad}
          personas={personasActivas}
          cerrar={() => setModalActividad(null)}
          guardar={guardar}
          eliminar={eliminar}
          actividadesPlan={actividadesPlan}
        />
      )}
    </section>
  );
}
