import { useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import AlertItem from "../../ui/AlertItem.jsx";
import AlertStrip from "../../ui/AlertStrip.jsx";
import { estadoCls } from "../../ui/styles.js";
import { meses, dias } from "../../data/calendario.js";
import { opcionesPuestoOperativo } from "../../data/puestos.js";
import { dim, faltan, isoFecha } from "../../domain/fechas.js";
import { codigoRolFuncionario, esRolActivo } from "../../domain/roles.js";
import { actividadesEnDia, esAtencionRutinaria } from "../../domain/actividades.js";
import { puestoRequiereAtencionRutinaria } from "../../domain/cobertura.js";
import { useApp } from "../../context/AppContext.jsx";
import { useFeriadosDelAno } from "../../lib/useFeriadosDelAno.js";
import CoberturaDetalleModal from "./CoberturaDetalleModal.jsx";
import ModalActividad from "../actividades/ModalActividad.jsx";

export default function Dashboard({ personas, alerts, setView, actividadesPlan, setActividadesPlan, roleData, month, year }) {
  const [detalleCobertura, setDetalleCobertura] = useState(null);
  const [modalActividad, setModalActividad] = useState(null);
  const [puestoActivo, setPuestoActivo] = useState(opcionesPuestoOperativo[0]);
  const [normativaAbierta, setNormativaAbierta] = useState(false);
  const { reglas } = useApp();
  const puestosRequieren = reglas?.puestosRequierenVisitantesDiario;
  const feriados = useFeriadosDelAno(year);
  const personasActivas = personas.filter((p) => p.estado !== "Inactivo");
  const diasMes = Array.from({ length: dim(year, month) }, (_, i) => i + 1);
  const diasCalendario = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];
  const blancosInicioMes = Array.from({ length: (new Date(year, month, 1).getDay() + 6) % 7 }, (_, i) => i);

  const funcionariosProgramadosPuestoDia = (puesto, d) => {
    const iso = isoFecha(year, month, d);
    const mapa = new Map();
    actividadesEnDia(actividadesPlan || [], iso).forEach((a) => {
      if ((a.lugar || "") === puesto) {
        (a.funcionarios || []).forEach((n) => {
          if (!mapa.has(n)) mapa.set(n, []);
          mapa.get(n).push(a.titulo);
        });
      }
    });
    return Array.from(mapa.entries()).map(([nombre, actividades]) => ({ nombre, actividades }));
  };
  const funcionariosEnTurnoPuestoDia = (puesto, d) => {
    const iso = isoFecha(year, month, d);
    return personas
      .filter(
        (p) =>
          (p.puestoOperativo || "Puesto Quetzales") === puesto &&
          p.estado !== "Inactivo" &&
          esRolActivo(codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, d, feriados))
      )
      .map((p) => ({
        ...p,
        rol: codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, d, feriados),
        actividades: actividadesEnDia(actividadesPlan || [], iso).filter((a) => (a.funcionarios || []).includes(p.nombre)),
      }));
  };
  const atencionRutinariaPuestoDia = (puesto, d) => {
    const iso = isoFecha(year, month, d);
    return actividadesEnDia(actividadesPlan || [], iso)
      .filter((a) => (a.lugar || "") === puesto && esAtencionRutinaria(a))
      .flatMap((a) => a.funcionarios || []);
  };
  const conteoPorPuestoDia = (puesto, d) => funcionariosProgramadosPuestoDia(puesto, d).length;
  const totalRolPuestoDia = (puesto, d) => funcionariosEnTurnoPuestoDia(puesto, d).length;
  const abrirDetalle = (puesto, d) => {
    const iso = isoFecha(year, month, d);
    setDetalleCobertura({
      puesto,
      dia: d,
      fecha: iso,
      programados: funcionariosProgramadosPuestoDia(puesto, d),
      rol: totalRolPuestoDia(puesto, d),
      turno: funcionariosEnTurnoPuestoDia(puesto, d),
      atencionRutinaria: atencionRutinariaPuestoDia(puesto, d),
      requiereAtencionRutinaria: puestoRequiereAtencionRutinaria(puesto, puestosRequieren),
    });
  };
  const nuevaActividadPara = (nombre, iso, lugar) => ({
    id: `a${Date.now()}`,
    titulo: "",
    inicio: iso,
    fin: iso,
    unDia: true,
    funcionarios: [nombre],
    lugar,
    observaciones: "",
    viatico: false,
  });
  const guardarActividad = (act) => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : act.fin || act.inicio };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan((prev) =>
      prev.some((a) => a.id === normal.id) ? prev.map((a) => (a.id === normal.id ? normal : a)) : [...prev, normal]
    );
    setModalActividad(null);
    setDetalleCobertura(null);
  };
  const eliminarActividad = (id) => {
    setActividadesPlan((prev) => prev.filter((a) => a.id !== id));
    setModalActividad(null);
    setDetalleCobertura(null);
  };

  const diaRef = Math.min(19, dim(year, month));
  const isoHoy = isoFecha(year, month, diaRef);
  const diasSinVisit = diasMes.filter((d) =>
    opcionesPuestoOperativo.some((p) => puestoRequiereAtencionRutinaria(p, puestosRequieren) && atencionRutinariaPuestoDia(p, d).length === 0)
  ).length;
  const sinActividadHoy = personasActivas.filter((p) => {
    const rol = codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, diaRef, feriados);
    if (!esRolActivo(rol)) return false;
    return (
      actividadesEnDia(actividadesPlan || [], isoHoy).filter((a) => (a.funcionarios || []).includes(p.nombre)).length === 0
    );
  }).length;
  const porVencer = personas.filter((f) => {
    if (!f.disponibilidad || !f.vencimiento) return false;
    const d = faltan(f.vencimiento);
    return d !== null && d >= 0 && d <= 30;
  }).length;
  // KPIs separados por horizonte temporal: "Hoy" vs "Este mes".
  // Esto facilita lectura rápida en campo y administración.
  const kpisHoy = [
    {
      label: "Sin actividad",
      value: sinActividadHoy,
      sub: "en turno hoy sin planificar",
      color: sinActividadHoy > 0 ? "text-amber-600" : "text-slate-900",
      cta: { label: "Ver detalle del día", action: () => setView("dia") },
    },
  ];
  const kpisMes = [
    {
      label: "Cobertura crítica",
      value: diasSinVisit,
      sub: "días sin Visit. asignada",
      color: diasSinVisit > 0 ? "text-red-600" : "text-slate-900",
    },
    {
      label: "Por vencer",
      value: porVencer,
      sub: "disponibilidades ≤30 días",
      color: porVencer > 0 ? "text-amber-600" : "text-slate-900",
    },
    {
      label: "Personal activo",
      value: personas.filter((f) => f.estado === "Activo").length,
      sub: `/ ${personas.length} total`,
      color: "text-slate-900",
    },
  ];
  const resumenPuesto = (puesto) => {
    const sv = diasMes.filter((d) => puestoRequiereAtencionRutinaria(puesto, puestosRequieren) && atencionRutinariaPuestoDia(puesto, d).length === 0).length;
    const sp = diasMes.filter((d) => conteoPorPuestoDia(puesto, d) === 0 && totalRolPuestoDia(puesto, d) > 0).length;
    return { sinVisit: sv, sinPlan: sp };
  };

  const DiaCobertura = ({ puesto, d }) => {
    const programados = conteoPorPuestoDia(puesto, d);
    const rol = totalRolPuestoDia(puesto, d);
    const atencion = atencionRutinariaPuestoDia(puesto, d).length;
    const faltaAtencion = puestoRequiereAtencionRutinaria(puesto, puestosRequieren) && atencion === 0;
    const faltaActividad = rol > 0 && programados === 0;
    const dow = new Date(year, month, d).getDay();
    return (
      <button
        type="button"
        onClick={() => abrirDetalle(puesto, d)}
        className={`relative min-h-[88px] rounded-2xl border-2 p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:ring-2 focus:ring-emerald-700 ${
          faltaAtencion
            ? "border-red-500 bg-red-50"
            : faltaActividad
            ? "border-amber-400 bg-amber-50"
            : programados
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-200 bg-white"
        }`}
        title={faltaAtencion ? "ALERTA: sin atención rutinaria de visitantes asignada" : "Ver detalle"}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold">{d}</span>
          <span className="text-[9px] uppercase text-slate-400">{dias[dow]}</span>
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          <div className="flex justify-between rounded bg-white/60 px-1.5 py-0.5 text-[11px]">
            <span>Turno</span>
            <span className="font-semibold">{rol}</span>
          </div>
          <div className="flex justify-between rounded bg-white/60 px-1.5 py-0.5 text-[11px]">
            <span>Plan</span>
            <span className="font-semibold">{programados}</span>
          </div>
          <div
            className={`flex justify-between rounded px-1.5 py-0.5 text-[11px] ${
              atencion
                ? "bg-emerald-100 text-emerald-900"
                : faltaAtencion
                ? "bg-red-600 font-semibold text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span>Visit.</span>
            <span className="font-semibold">{atencion}</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <section className="space-y-5">
      <AlertStrip alerts={alerts} setView={setView} />

      {/* BLOQUE HOY — atención inmediata */}
      <section aria-labelledby="hoy-heading" className="space-y-2">
        <header className="flex items-center justify-between gap-2">
          <h2 id="hoy-heading" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Hoy · día {diaRef}
          </h2>
          <button
            type="button"
            onClick={() => setView("dia")}
            className="min-h-touch rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ver detalle del día →
          </button>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpisHoy.map(({ label, value, sub, color, cta }) => (
            <div key={label} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">Hoy</span>
              </div>
              <div className={`mt-2 text-4xl font-black ${color}`}>{value}</div>
              <div className="mt-1 text-xs text-slate-400">{sub}</div>
              {cta && value > 0 && (
                <button onClick={cta.action} className="mt-3 inline-flex min-h-touch items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700">
                  {cta.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BLOQUE ESTE MES — control y tendencia */}
      <section aria-labelledby="mes-heading" className="space-y-3">
        <header>
          <h2 id="mes-heading" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
            Este mes · {meses[month]} {year}
          </h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpisMes.map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">Mes</span>
              </div>
              <div className={`mt-2 text-4xl font-black ${color}`}>{value}</div>
              <div className="mt-1 text-xs text-slate-400">{sub}</div>
            </div>
          ))}
        </div>
      </section>
      <Card
        title={`Cobertura por puesto operativo — ${meses[month]} ${year}`}
        icon="📍"
        action={
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-950">Turno = rol activo</span>
            <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-1 text-emerald-950">Plan = actividad</span>
            <span className="rounded-lg border border-red-300 bg-red-100 px-2 py-1 text-red-950">Visit. = atención visitantes</span>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {opcionesPuestoOperativo.map((puesto) => {
            const { sinVisit, sinPlan } = resumenPuesto(puesto);
            return (
              <button
                key={puesto}
                onClick={() => setPuestoActivo(puesto)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  puesto === puestoActivo
                    ? "border-emerald-800 bg-emerald-800 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {puesto.replace("Puesto ", "")}
                {(sinVisit > 0 || sinPlan > 0) && (
                  <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] text-white">!</span>
                )}
              </button>
            );
          })}
        </div>
        {(() => {
          const { sinVisit, sinPlan } = resumenPuesto(puestoActivo);
          return (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
              <div>
                <h3 className="text-base font-semibold text-slate-950">{puestoActivo}</h3>
                <div className="text-xs text-slate-500">
                  {sinVisit > 0 ? `${sinVisit} días sin Visit.` : "Visit. cubierta"} ·{" "}
                  {sinPlan > 0 ? `${sinPlan} días sin Plan` : "Plan completo"}
                </div>
              </div>
              {puestoRequiereAtencionRutinaria(puestoActivo, puestosRequieren) && (
                <Badge className="border-red-200 bg-red-50 text-red-900">Requiere Visit. diario</Badge>
              )}
            </div>
          );
        })()}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="grid grid-cols-7 gap-1.5">
            {diasCalendario.map((dia) => (
              <div
                key={`hdr-${dia}`}
                className="rounded-xl bg-slate-900 px-1.5 py-2 text-center text-[10px] font-semibold tracking-wide text-white shadow-sm"
              >
                {dia}
              </div>
            ))}
            {blancosInicioMes.map((b) => (
              <div key={`blank-${b}`} className="min-h-[88px] rounded-2xl border border-dashed border-slate-200 bg-slate-100/60" />
            ))}
            {diasMes.map((d) => (
              <DiaCobertura key={`${puestoActivo}-${d}`} puesto={puestoActivo} d={d} />
            ))}
          </div>
        </div>
        <div className="mt-3 text-xs font-medium text-slate-500">
          Cada casilla abre el detalle de funcionarios programados, en turno y asignación de atención rutinaria de visitantes. Orosi y Quetzales alertan en rojo cuando Visit. = 0.
        </div>
      </Card>
      {detalleCobertura && (
        <CoberturaDetalleModal
          data={detalleCobertura}
          cerrar={() => setDetalleCobertura(null)}
          onNuevaActividad={(nombre, iso, puesto) => setModalActividad(nuevaActividadPara(nombre, iso, puesto))}
          onEditarActividad={(act) => setModalActividad({ ...act })}
        />
      )}
      {modalActividad && (
        <ModalActividad
          valor={modalActividad}
          personas={personasActivas}
          cerrar={() => setModalActividad(null)}
          guardar={guardarActividad}
          eliminar={eliminarActividad}
          actividadesPlan={actividadesPlan}
        />
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card
          title="Alertas activas"
          icon="🔔"
          action={
            <button onClick={() => setView("alertas")} className="text-sm font-semibold text-emerald-800">
              Ver todas
            </button>
          }
        >
          <div className="space-y-2">
            {alerts.slice(0, 4).map((a, i) => (
              <AlertItem key={i} a={a} />
            ))}
          </div>
        </Card>
        <Card
          title="Estado del personal"
          icon="👥"
          action={
            <button onClick={() => setView("funcionarios")} className="text-sm font-semibold text-emerald-800">
              Abrir funcionarios
            </button>
          }
        >
          <div className="divide-y divide-slate-200">
            {personas.slice(0, 7).map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-2">
                <Avatar name={f.nombre} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{f.nombre}</div>
                  <div className="truncate text-xs text-slate-500">{f.puesto}</div>
                </div>
                <Badge className={estadoCls(f.estado)}>{f.estado}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="rounded-2xl border border-slate-300 bg-white shadow-sm">
        <button
          onClick={() => setNormativaAbierta(!normativaAbierta)}
          className="flex w-full items-center justify-between gap-3 p-5 text-left"
        >
          <div className="flex items-center gap-2 text-base font-semibold">
            <span>⚖️</span>
            Marco normativo / control interno
          </div>
          <span className="text-slate-400">{normativaAbierta ? "▲" : "▼"}</span>
        </button>
        {normativaAbierta && (
          <div className="border-t border-slate-200 p-5">
            <div className="flex flex-wrap gap-2">
              {["Dec. 28409-MINAE", "Dec. 34885-MINAET", "Dec. 40452-MINAE", "CT arts. 135-144", "Ley 8968", "Ley 7575", "Ley 6084", "LGAP", "Ley 8292"].map((x) => (
                <Badge key={x} className="border-blue-200 bg-blue-50 text-blue-900">
                  🟢 {x}
                </Badge>
              ))}
            </div>
            <div className="mt-4 rounded-xl border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-950">
              <strong>Regla dura:</strong> el sistema registra y alerta; no genera pago, reposición, suspensión o derecho automático.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
