import { useState } from "react";
import Badge from "../../ui/Badge.jsx";
import { meses, dias } from "../../data/calendario.js";
import { opcionesModalidad } from "../../data/opciones.js";
import { isoFecha, primerDiaLaboral } from "../../domain/fechas.js";
import {
  rolKey,
  rolCfgKey,
  esRolActivo,
  generarValorPatron,
  categoriaDe,
  formatearCategoria,
} from "../../domain/roles.js";
import { actividadesEnDia } from "../../domain/actividades.js";
import { useFeriadosDelAno } from "../../lib/useFeriadosDelAno.js";
import { useT } from "../../i18n/useT.js";
import RoleCell from "./RoleCell.jsx";
import MenuCelda from "./MenuCelda.jsx";
import ConflictoModal from "./ConflictoModal.jsx";
import ActividadesDiaModal from "./ActividadesDiaModal.jsx";

export default function PuestoRolCard({
  grupo,
  gi,
  days,
  year,
  month,
  compact,
  roleData,
  setRoleData,
  personas,
  actividadesPlan,
  setActividadesPlan,
}) {
  const t = useT();
  const [editRows, setEditRows] = useState({});
  const [menu, setMenu] = useState(null);
  const [conflictoActivo, setConflictoActivo] = useState(null);
  const [actividadesDiaModal, setActividadesDiaModal] = useState(null);
  const feriados = useFeriadosDelAno(year);
  const inicio = primerDiaLaboral(year, month, feriados);
  const toggleEdit = (nombre) => setEditRows((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  const getCfg = (persona) =>
    roleData[rolCfgKey(year, month, grupo.nombre, persona)] || personas.find((f) => f.nombre === persona)?.modalidad || "10x5";
  const setCfg = (persona, valor) =>
    setRoleData((prev) => ({ ...prev, [rolCfgKey(year, month, grupo.nombre, persona)]: valor }));
  const getCelda = (persona, pi, dia) =>
    roleData[rolKey(year, month, grupo.nombre, persona, dia)] ?? generarValorPatron(getCfg(persona), dia, inicio, year, month);
  const aplicarPatron = (persona) => {
    const modalidad = getCfg(persona);
    const cambios = {};
    days.forEach((d) => {
      cambios[rolKey(year, month, grupo.nombre, persona, d)] = generarValorPatron(modalidad, d, inicio, year, month);
    });
    setRoleData((prev) => ({ ...prev, ...cambios }));
  };
  const renumerarFila = (persona, pi, diaEditado, categoria) => {
    const modalidad = getCfg(persona);
    const categorias = {};
    days.forEach((d) => {
      categorias[d] = categoriaDe(getCelda(persona, pi, d));
    });
    categorias[diaEditado] = categoria;
    const cambios = {};
    let categoriaAnterior = null;
    let consecutivo = 0;
    days.forEach((d) => {
      const cat = categorias[d] || "";
      if (!cat) {
        categoriaAnterior = null;
        consecutivo = 0;
        cambios[rolKey(year, month, grupo.nombre, persona, d)] = "";
        return;
      }
      if (cat !== categoriaAnterior) {
        categoriaAnterior = cat;
        consecutivo = 1;
      } else {
        consecutivo += 1;
      }
      cambios[rolKey(year, month, grupo.nombre, persona, d)] = formatearCategoria(cat, consecutivo, modalidad);
    });
    setRoleData((prev) => ({ ...prev, ...cambios }));
  };
  const seleccionarMenu = (valor) => {
    if (!menu) return;
    renumerarFila(menu.persona, menu.pi, menu.dia, valor);
    setMenu(null);
  };
  const abrirConflicto = (nombre, pi, d, val) => {
    const iso = isoFecha(year, month, d);
    const acts = actividadesEnDia(actividadesPlan || [], iso).filter((a) => (a.funcionarios || []).includes(nombre));
    setConflictoActivo({ persona: nombre, pi, dia: d, valor: val, iso, acts, esInicio: d === inicio });
  };
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
      <div className={`flex flex-col gap-2 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between ${grupo.color}`}>
        <div>
          <h3 className="text-lg font-semibold">{grupo.nombre}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-white/50 bg-white/70 text-slate-900">
            {meses[month]} {year}
          </Badge>
        </div>
      </div>
      <div className="overflow-auto bg-slate-50">
        <table className="border-separate border-spacing-0 text-xs" style={{ minWidth: compact ? 1140 : 1380 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-20 w-72 border-b border-r border-slate-200 bg-white p-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {t("roles.funcionarioCol")}
              </th>
              {days.map((d) => {
                const dow = new Date(year, month, d).getDay();
                const isWeekend = dow === 0 || dow === 6;
                return (
                  <th
                    key={d}
                    className={`border-b border-r border-slate-200 p-1.5 text-center font-semibold ${
                      isWeekend ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <div className="mx-auto flex h-10 w-9 flex-col items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5">
                      <span className="text-[13px] leading-none font-semibold">{d}</span>
                      <span
                        className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[9px] leading-none ${
                          isWeekend ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {dias[dow]}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {grupo.funcionarios.map((nombre, pi) => {
              const editing = !!editRows[nombre];
              const modalidad = getCfg(nombre);
              return (
                <tr key={nombre} className={editing ? "bg-emerald-50/60" : "bg-white"}>
                  <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white p-2 align-top shadow-[2px_0_8px_rgba(15,23,42,0.04)]">
                    {/* Texto fijo del nombre, solo visible al imprimir. */}
                    <span className="pnlq-print-only font-semibold text-black">{nombre}</span>
                    <div className="pnlq-no-print space-y-2">
                      <button
                        onClick={() => toggleEdit(nombre)}
                        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left font-semibold shadow-sm hover:bg-slate-50"
                      >
                        <span>{nombre}</span>
                        <span>{editing ? "🔓" : "🔒"}</span>
                      </button>
                      {editing && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2 shadow-inner">
                          <label className="mb-1 block text-[10px] font-bold uppercase text-emerald-900">
                            {t("roles.editarTipoRol")}
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={modalidad}
                              onChange={(e) => setCfg(nombre, e.target.value)}
                              className="min-w-0 flex-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-xs font-bold"
                            >
                              {opcionesModalidad.map((x) => (
                                <option key={x}>{x}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => aplicarPatron(nombre)}
                              className="rounded-lg bg-emerald-800 px-2 py-1 text-[11px] font-semibold text-white"
                            >
                              {t("roles.aplicar")}
                            </button>
                          </div>
                          <div className="mt-1 text-[10px] font-bold text-emerald-900">
                            {t("roles.aplicarNota")}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  {days.map((d) => {
                    const dow = new Date(year, month, d).getDay();
                    const val = getCelda(nombre, pi, d);
                    const tieneActividad = actividadesEnDia(actividadesPlan || [], isoFecha(year, month, d)).some((a) =>
                      (a.funcionarios || []).includes(nombre)
                    );
                    const conflicto = tieneActividad && !esRolActivo(val);
                    return (
                      <RoleCell
                        key={`${nombre}-${d}`}
                        value={val}
                        compact={compact}
                        editable={editing}
                        finde={dow === 0 || dow === 6}
                        esInicio={editing && d === inicio}
                        conflicto={conflicto}
                        onOpen={() => editing && setMenu({ persona: nombre, pi, dia: d, valor: val, esInicio: d === inicio })}
                        onConflicto={() => abrirConflicto(nombre, pi, d, val)}
                      />
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-100 p-3 text-xs font-bold uppercase tracking-wider text-slate-600">
                {t("roles.cantidadEnTurno")}
              </td>
              {days.map((d) => {
                const count = grupo.funcionarios.reduce(
                  (acc, nombre, pi) => (esRolActivo(getCelda(nombre, pi, d)) ? acc + 1 : acc),
                  0
                );
                return (
                  <td
                    key={`cantidad-${d}`}
                    className="border-b border-r border-slate-200 bg-white p-2 text-center font-semibold text-slate-800"
                  >
                    {count}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {menu && <MenuCelda data={menu} cerrar={() => setMenu(null)} seleccionar={seleccionarMenu} />}
      {conflictoActivo && (
        <ConflictoModal
          data={conflictoActivo}
          cerrar={() => setConflictoActivo(null)}
          onModificarRol={() => {
            const d = conflictoActivo;
            setConflictoActivo(null);
            setMenu({ persona: d.persona, pi: d.pi, dia: d.dia, valor: d.valor, esInicio: d.esInicio });
          }}
          onModificarActividad={() => {
            setActividadesDiaModal({ persona: conflictoActivo.persona, iso: conflictoActivo.iso });
            setConflictoActivo(null);
          }}
        />
      )}
      {actividadesDiaModal && (
        <ActividadesDiaModal
          funcionario={actividadesDiaModal.persona}
          iso={actividadesDiaModal.iso}
          allActividadesPlan={actividadesPlan || []}
          personas={personas}
          setActividadesPlan={setActividadesPlan}
          cerrar={() => setActividadesDiaModal(null)}
        />
      )}
    </div>
  );
}
