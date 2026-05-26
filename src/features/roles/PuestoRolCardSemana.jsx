import { useMemo, useState } from "react";
import Badge from "../../ui/Badge.jsx";
import Icon from "../../ui/Icon.jsx";
import { codigoCls } from "../../ui/styles.js";
import { meses, dias, diasLargos } from "../../data/calendario.js";
import { opcionesModalidad } from "../../data/opciones.js";
import { dim, isoFecha, primerDiaLaboral } from "../../domain/fechas.js";
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
import MenuCelda from "./MenuCelda.jsx";
import ConflictoModal from "./ConflictoModal.jsx";
import ActividadesDiaModal from "./ActividadesDiaModal.jsx";

/**
 * Calcula las semanas del mes (lunes a domingo) como arreglos de días [1..N].
 * Las semanas parciales del primer/último ciclo se reportan también.
 */
function semanasDelMes(year, month) {
  const total = dim(year, month);
  const semanas = [];
  let actual = [];
  for (let d = 1; d <= total; d++) {
    const dow = new Date(year, month, d).getDay(); // 0..6 (Dom=0)
    actual.push(d);
    if (dow === 0 || d === total) {
      semanas.push(actual);
      actual = [];
    }
  }
  return semanas;
}

/**
 * Vista alterna de Roles por semana, optimizada para uso móvil/campo.
 * Conserva: códigos T/L/V/I/O, anillo INICIO (verde), conflicto (rojo),
 * edición por fila, modalidad/Aplicar patrón, CANTIDAD EN TURNO (por
 * semana en este modo) y los mismos modales (MenuCelda, ConflictoModal,
 * ActividadesDiaModal).
 *
 * Diferencia con PuestoRolCard:
 *  - Una tarjeta por funcionario (apilable en móvil).
 *  - 7 botones de día por semana (≥ 48 px de alto/ancho).
 *  - Selector de semana visible.
 */
export default function PuestoRolCardSemana({
  grupo,
  year,
  month,
  roleData,
  setRoleData,
  personas,
  actividadesPlan,
  setActividadesPlan,
}) {
  const semanas = useMemo(() => semanasDelMes(year, month), [year, month]);
  const totalSemanas = semanas.length;
  const [semIdx, setSemIdx] = useState(0);
  const semana = semanas[Math.min(semIdx, totalSemanas - 1)] || [];
  const feriados = useFeriadosDelAno(year);
  const inicio = primerDiaLaboral(year, month, feriados);

  const [editRows, setEditRows] = useState({});
  const [menu, setMenu] = useState(null);
  const [conflictoActivo, setConflictoActivo] = useState(null);
  const [actividadesDiaModal, setActividadesDiaModal] = useState(null);
  const todosLosDias = useMemo(() => Array.from({ length: dim(year, month) }, (_, i) => i + 1), [year, month]);

  const toggleEdit = (nombre) => setEditRows((prev) => ({ ...prev, [nombre]: !prev[nombre] }));

  const getCfg = (persona) =>
    roleData[rolCfgKey(year, month, grupo.nombre, persona)] || personas.find((f) => f.nombre === persona)?.modalidad || "10x5";

  const setCfg = (persona, valor) =>
    setRoleData((prev) => ({ ...prev, [rolCfgKey(year, month, grupo.nombre, persona)]: valor }));

  const getCelda = (persona, dia) =>
    roleData[rolKey(year, month, grupo.nombre, persona, dia)] ?? generarValorPatron(getCfg(persona), dia, inicio, year, month);

  const aplicarPatron = (persona) => {
    const modalidad = getCfg(persona);
    const cambios = {};
    todosLosDias.forEach((d) => {
      cambios[rolKey(year, month, grupo.nombre, persona, d)] = generarValorPatron(modalidad, d, inicio, year, month);
    });
    setRoleData((prev) => ({ ...prev, ...cambios }));
  };

  // Renumera toda la fila tras un cambio puntual de categoría en `diaEditado`.
  const renumerarFila = (persona, diaEditado, categoria) => {
    const modalidad = getCfg(persona);
    const categorias = {};
    todosLosDias.forEach((d) => {
      categorias[d] = categoriaDe(getCelda(persona, d));
    });
    categorias[diaEditado] = categoria;
    const cambios = {};
    let anterior = null;
    let consecutivo = 0;
    todosLosDias.forEach((d) => {
      const cat = categorias[d] || "";
      if (!cat) {
        anterior = null;
        consecutivo = 0;
        cambios[rolKey(year, month, grupo.nombre, persona, d)] = "";
        return;
      }
      if (cat !== anterior) {
        anterior = cat;
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
    renumerarFila(menu.persona, menu.dia, valor);
    setMenu(null);
  };

  const abrirConflicto = (nombre, d, val) => {
    const iso = isoFecha(year, month, d);
    const acts = actividadesEnDia(actividadesPlan || [], iso).filter((a) => (a.funcionarios || []).includes(nombre));
    setConflictoActivo({ persona: nombre, pi: 0, dia: d, valor: val, iso, acts, esInicio: d === inicio });
  };

  const cantidadTurnoSemana = semana.map((d) =>
    grupo.funcionarios.reduce((acc, nombre) => (esRolActivo(getCelda(nombre, d)) ? acc + 1 : acc), 0)
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
      <div className={`flex flex-col gap-2 border-b border-slate-200 p-4 ${grupo.color}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">{grupo.nombre}</h3>
          <Badge className="border-white/50 bg-white/70 text-slate-900">
            {meses[month]} {year}
          </Badge>
        </div>
        {/* Selector de semana */}
        <nav aria-label="Selección de semana" className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/70 p-1.5">
          <button
            type="button"
            onClick={() => setSemIdx((i) => Math.max(0, i - 1))}
            disabled={semIdx === 0}
            aria-label="Semana anterior"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-white px-2 disabled:opacity-40"
          >
            <Icon name="chevronLeft" size={18} />
          </button>
          <div className="flex flex-wrap gap-1">
            {semanas.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSemIdx(i)}
                aria-pressed={i === semIdx}
                aria-label={`Semana ${i + 1} (días ${s[0]} al ${s[s.length - 1]})`}
                className={`min-h-touch rounded-xl px-3 text-xs font-bold ${
                  i === semIdx ? "bg-emerald-800 text-white" : "bg-white text-slate-700"
                }`}
              >
                S{i + 1}
                <span className="ml-1 text-[10px] opacity-70">{s[0]}–{s[s.length - 1]}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSemIdx((i) => Math.min(totalSemanas - 1, i + 1))}
            disabled={semIdx === totalSemanas - 1}
            aria-label="Semana siguiente"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-white px-2 disabled:opacity-40"
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </nav>
      </div>

      <div className="space-y-3 bg-slate-50 p-3">
        {grupo.funcionarios.map((nombre) => {
          const editing = !!editRows[nombre];
          const modalidad = getCfg(nombre);
          return (
            <article key={nombre} className={`rounded-2xl border ${editing ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"} p-3 shadow-sm`}>
              <header className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{nombre}</p>
                  <p className="text-[11px] text-slate-500">{modalidad}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEdit(nombre)}
                  aria-pressed={editing}
                  aria-label={editing ? `Bloquear edición de ${nombre}` : `Permitir edición de ${nombre}`}
                  className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-700"
                >
                  <Icon name={editing ? "unlock" : "lock"} size={18} />
                </button>
              </header>

              {editing && (
                <div className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                  <label className="block text-[10px] font-bold uppercase text-emerald-900">Tipo de rol desde 1er día laboral</label>
                  <div className="mt-1 flex gap-2">
                    <select
                      value={modalidad}
                      onChange={(e) => setCfg(nombre, e.target.value)}
                      className="min-h-touch min-w-0 flex-1 rounded-lg border border-emerald-300 bg-white px-2 text-xs font-bold"
                    >
                      {opcionesModalidad.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => aplicarPatron(nombre)}
                      className="min-h-touch rounded-lg bg-emerald-800 px-3 text-[11px] font-semibold text-white"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-7 gap-1.5">
                {semana.map((d) => {
                  const dow = new Date(year, month, d).getDay();
                  const finde = dow === 0 || dow === 6;
                  const val = getCelda(nombre, d);
                  const iso = isoFecha(year, month, d);
                  const tieneActividad = actividadesEnDia(actividadesPlan || [], iso).some((a) => (a.funcionarios || []).includes(nombre));
                  const conflicto = tieneActividad && !esRolActivo(val);
                  const esInicio = editing && d === inicio;
                  const cls = codigoCls(val, finde);
                  const clickable = conflicto || editing;
                  const onClick = conflicto
                    ? () => abrirConflicto(nombre, d, val)
                    : editing
                    ? () => setMenu({ persona: nombre, pi: 0, dia: d, valor: val, esInicio })
                    : undefined;
                  return (
                    <button
                      type="button"
                      key={`${nombre}-${d}`}
                      disabled={!clickable}
                      onClick={onClick}
                      title={conflicto ? "Clic para resolver: rol vs actividad" : editing ? "Cambiar marca del día" : "Active edición para modificar"}
                      className={`relative flex min-h-touch flex-col items-center justify-center rounded-xl border-2 px-1 py-1.5 text-[11px] font-semibold ${cls} ${
                        esInicio ? "ring-2 ring-inset ring-emerald-700" : ""
                      } ${conflicto ? "ring-4 ring-inset ring-red-600" : ""} ${
                        clickable ? "cursor-pointer hover:brightness-95" : "cursor-default opacity-90"
                      }`}
                    >
                      <span className="text-[9px] uppercase opacity-70">{dias[dow]}</span>
                      <span className="text-[11px] font-bold">{d}</span>
                      <span className="mt-0.5 inline-flex min-w-7 items-center justify-center rounded bg-white/55 px-1 text-[11px] font-bold shadow-sm ring-1 ring-black/5">
                        {(val || "—").toUpperCase()}
                      </span>
                      {conflicto && (
                        <span className="pnlq-pulse absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-700 text-[9px] font-bold text-white">
                          !
                        </span>
                      )}
                      {esInicio && (
                        <span className="absolute bottom-0 left-0 right-0 rounded-b-md bg-emerald-900 text-center text-[8px] font-bold tracking-wider text-white">
                          INICIO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}

        {/* Resumen: CANTIDAD EN TURNO por día de la semana visible */}
        <article className="rounded-2xl border border-slate-300 bg-white p-3 shadow-sm">
          <header className="mb-2 flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Cantidad en turno · semana</h4>
            <span className="text-[10px] font-bold text-slate-500">
              Sem {semIdx + 1} de {totalSemanas}
            </span>
          </header>
          <div className="grid grid-cols-7 gap-1.5">
            {semana.map((d, i) => {
              const dow = new Date(year, month, d).getDay();
              return (
                <div key={`turno-${d}`} className="flex flex-col items-center rounded-lg bg-slate-50 py-1.5">
                  <span className="text-[9px] uppercase text-slate-500">{dias[dow]}</span>
                  <span className="text-[11px] text-slate-500">{d}</span>
                  <span className="text-base font-bold text-slate-900">{cantidadTurnoSemana[i]}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-slate-500">{diasLargos[new Date(year, month, semana[0]).getDay()]} a {diasLargos[new Date(year, month, semana[semana.length - 1]).getDay()]}</p>
        </article>
      </div>

      {menu && <MenuCelda data={menu} cerrar={() => setMenu(null)} seleccionar={seleccionarMenu} />}
      {conflictoActivo && (
        <ConflictoModal
          data={conflictoActivo}
          cerrar={() => setConflictoActivo(null)}
          onModificarRol={() => {
            const d = conflictoActivo;
            setConflictoActivo(null);
            setMenu({ persona: d.persona, pi: 0, dia: d.dia, valor: d.valor, esInicio: d.esInicio });
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
