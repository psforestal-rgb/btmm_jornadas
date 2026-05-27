import { useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import { meses } from "../../data/calendario.js";
import { dim, fecha, isoFecha } from "../../domain/fechas.js";
import {
  rolKey,
  codigoRolFuncionario,
  esRolActivo,
  categoriaDe,
  formatearCategoria,
  modalidadFuncionario,
  funcionarioPorNombre,
} from "../../domain/roles.js";
import { actividadesEnDia } from "../../domain/actividades.js";
import { useFeriadosDelAno } from "../../lib/useFeriadosDelAno.js";
import { useT } from "../../i18n/useT.js";
import ModalActividad from "../actividades/ModalActividad.jsx";
import ModificarRolModal from "./ModificarRolModal.jsx";
import AsignarActividadModal from "./AsignarActividadModal.jsx";

export default function PlanificacionFuncionario({
  year,
  month,
  setMonth,
  setYear,
  personas,
  actividadesPlan,
  setActividadesPlan,
  roleData,
  setRoleData,
}) {
  const t = useT();
  const [asignar, setAsignar] = useState(null);
  const [modalActividad, setModalActividad] = useState(null);
  const [modalRol, setModalRol] = useState(null);
  const [abiertos, setAbiertos] = useState({});
  const feriados = useFeriadosDelAno(year);
  const days = Array.from({ length: dim(year, month) }, (_, i) => i + 1);
  const personasActivas = personas.filter((p) => p.estado !== "Inactivo");
  const guardar = (act) => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : act.fin || act.inicio };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan((prev) =>
      prev.some((a) => a.id === normal.id) ? prev.map((a) => (a.id === normal.id ? normal : a)) : [...prev, normal]
    );
    setModalActividad(null);
    setAsignar(null);
  };
  const eliminar = (id) => {
    setActividadesPlan((prev) => prev.filter((a) => a.id !== id));
    setModalActividad(null);
  };
  const nuevaActividad = (nombre, iso) => ({
    id: `a${Date.now()}`,
    titulo: "",
    inicio: iso,
    fin: iso,
    unDia: true,
    funcionarios: [nombre],
    lugar: funcionarioPorNombre(personas, nombre)?.puestoOperativo || "",
    observaciones: "",
    viatico: false,
  });
  const agregarAExistente = (actividadId, nombre) => {
    setActividadesPlan((prev) =>
      prev.map((a) =>
        a.id === actividadId
          ? { ...a, funcionarios: a.funcionarios.includes(nombre) ? a.funcionarios : [...a.funcionarios, nombre] }
          : a
      )
    );
    setAsignar(null);
  };
  const moverMesLocal = (paso) => {
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
  const expandirTodo = () => setAbiertos(Object.fromEntries(personasActivas.map((p) => [p.id, true])));
  const colapsarTodo = () => setAbiertos({});
  const filasFuncionario = (p) =>
    days
      .map((d) => {
        const iso = isoFecha(year, month, d);
        const rol = codigoRolFuncionario(personas, roleData, year, month, p.nombre, d, feriados);
        const turno = esRolActivo(rol);
        const acts = actividadesEnDia(actividadesPlan, iso).filter((a) => (a.funcionarios || []).includes(p.nombre));
        const visible = turno || acts.length > 0;
        const conflicto = acts.length > 0 && !turno;
        return visible ? { d, iso, rol, turno, acts, conflicto } : null;
      })
      .filter(Boolean);
  const aplicarRol = ({ funcionario, dia, categoria }) => {
    const p = funcionarioPorNombre(personas, funcionario);
    if (!p) return;
    const puesto = p.puestoOperativo || "Puesto Quetzales";
    const modalidad = modalidadFuncionario(personas, roleData, year, month, funcionario);
    const categorias = {};
    days.forEach((d) => {
      categorias[d] = categoriaDe(codigoRolFuncionario(personas, roleData, year, month, funcionario, d, feriados));
    });
    categorias[dia] = categoria;
    const cambios = {};
    let anterior = null;
    let consecutivo = 0;
    days.forEach((d) => {
      const cat = categorias[d] || "";
      if (!cat) {
        anterior = null;
        consecutivo = 0;
        cambios[rolKey(year, month, puesto, funcionario, d)] = "";
      } else {
        if (cat !== anterior) {
          anterior = cat;
          consecutivo = 1;
        } else {
          consecutivo += 1;
        }
        cambios[rolKey(year, month, puesto, funcionario, d)] = formatearCategoria(cat, consecutivo, modalidad);
      }
    });
    setRoleData((prev) => ({ ...prev, ...cambios }));
    setModalRol(null);
  };
  return (
    <section className="space-y-4">
      <Card
        title={t("planFuncionario.titulo", { mes: meses[month], anio: year })}
        icon="📋"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => moverMesLocal(-1)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              ←
            </button>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {meses.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2025, 2026, 2027, 2028, 2029].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={() => moverMesLocal(1)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              →
            </button>
            <button
              onClick={expandirTodo}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900"
            >
              {t("planFuncionario.expandir")}
            </button>
            <button
              onClick={colapsarTodo}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              {t("planFuncionario.colapsar")}
            </button>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="border-emerald-300 bg-emerald-100 text-emerald-950">{t("planFuncionario.leyendaTurnoAct")}</Badge>
          <Badge className="border-yellow-300 bg-yellow-100 text-yellow-950">{t("planFuncionario.leyendaFaltaAct")}</Badge>
          <Badge className="border-red-400 bg-red-100 text-red-950">{t("planFuncionario.leyendaConflicto")}</Badge>
        </div>
        <div className="space-y-3">
          {personasActivas.map((p) => {
            const filas = filasFuncionario(p);
            const faltantes = filas.filter((f) => f.turno && !f.acts.length).length;
            const conflictos = filas.filter((f) => f.conflicto).length;
            const actividadesAsignadas = filas.reduce((acc, f) => acc + f.acts.length, 0);
            const abierto = !!abiertos[p.id];
            return (
              <div
                key={p.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                  conflictos ? "border-red-300 ring-2 ring-red-200" : "border-slate-200"
                }`}
              >
                <button
                  onClick={() => setAbiertos((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className="flex w-full flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 text-left md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={p.nombre} />
                    <div>
                      <div className="font-semibold">{p.nombre}</div>
                      <div className="text-xs font-bold text-slate-500">{p.puestoOperativo} · {p.puesto}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-slate-200 bg-white text-slate-700">{t("planFuncionario.diasVisibles", { n: filas.length })}</Badge>
                    <Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">{t("planFuncionario.actividades", { n: actividadesAsignadas })}</Badge>
                    {faltantes > 0 && (
                      <Badge className="border-yellow-300 bg-yellow-100 text-yellow-950">{t("planFuncionario.sinAsignar", { n: faltantes })}</Badge>
                    )}
                    {conflictos > 0 && (
                      <Badge className="border-red-300 bg-red-100 text-red-950">{t("planFuncionario.conflictos", { n: conflictos })}</Badge>
                    )}
                    <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-bold text-white">
                      {abierto ? t("planFuncionario.ocultar") : t("planFuncionario.ver")}
                    </span>
                  </div>
                </button>
                {abierto && (
                  <div className="divide-y divide-slate-100">
                    {filas.map((f) => (
                      <div
                        key={`${p.id}-${f.d}`}
                        className={`grid gap-3 p-3 md:grid-cols-[110px_80px_1fr_auto] md:items-center ${
                          f.conflicto ? "bg-red-50" : f.turno && !f.acts.length ? "bg-yellow-50" : "bg-white"
                        }`}
                      >
                        <div className="text-sm font-semibold">{fecha(f.iso)}</div>
                        <Badge
                          className={
                            f.conflicto
                              ? "border-red-300 bg-red-100 text-red-950"
                              : f.turno
                              ? "border-emerald-300 bg-emerald-100 text-emerald-950"
                              : "border-slate-300 bg-slate-100 text-slate-700"
                          }
                        >
                          {f.rol || "—"}
                        </Badge>
                        <div className="space-y-1">
                          {f.acts.length ? (
                            f.acts.map((a) => (
                              <button
                                key={a.id}
                                onClick={() => setModalActividad({ ...a })}
                                className={`block w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                                  f.conflicto ? "border-red-300 bg-white text-red-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"
                                }`}
                              >
                                {a.titulo}
                                <span className="ml-2 text-xs font-bold opacity-70">{a.lugar || t("planFuncionario.sinLugar")}</span>
                                {f.conflicto && (
                                  <span className="ml-2 rounded-md bg-red-700 px-1.5 py-0.5 text-[10px] text-white">
                                    {t("planFuncionario.noCoincideRol")}
                                  </span>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="rounded-xl border border-yellow-300 bg-yellow-100 px-3 py-2 text-sm font-semibold text-yellow-950">
                              {t("planFuncionario.faltaAsignar")}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {f.conflicto ? (
                            <>
                              <button
                                onClick={() => setModalActividad({ ...f.acts[0] })}
                                className="rounded-xl bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800"
                              >
                                {t("planFuncionario.modificarActividad")}
                              </button>
                              <button
                                onClick={() => setModalRol({ funcionario: p.nombre, dia: f.d, iso: f.iso, rol: f.rol })}
                                className="rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-50"
                              >
                                {t("planFuncionario.modificarRol")}
                              </button>
                            </>
                          ) : f.turno && !f.acts.length ? (
                            <button
                              onClick={() => setAsignar({ funcionario: p.nombre, iso: f.iso })}
                              className="rounded-xl bg-yellow-600 px-3 py-2 text-xs font-bold text-white hover:bg-yellow-700"
                            >
                              {t("planFuncionario.asignar")}
                            </button>
                          ) : (
                            <button
                              onClick={() => setModalActividad(nuevaActividad(p.nombre, f.iso))}
                              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              {t("planFuncionario.nueva")}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {asignar && (
          <AsignarActividadModal
            data={asignar}
            actividadesPlan={actividadesPlan}
            cerrar={() => setAsignar(null)}
            crear={() => setModalActividad(nuevaActividad(asignar.funcionario, asignar.iso))}
            agregar={agregarAExistente}
          />
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
        {modalRol && <ModificarRolModal data={modalRol} cerrar={() => setModalRol(null)} aplicar={aplicarRol} />}
      </Card>
    </section>
  );
}
