import { useMemo, useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import AlertItem from "../../ui/AlertItem.jsx";
import AlertStrip from "../../ui/AlertStrip.jsx";
import { estadoCls } from "../../ui/styles.js";
import { meses, dias, diasLargos } from "../../data/calendario.js";
import { opcionesPuestoOperativo } from "../../data/puestos.js";
import { dim, faltan, isoFecha } from "../../domain/fechas.js";
import { codigoRolFuncionario, esRolActivo } from "../../domain/roles.js";
import { actividadesEnDia, esAtencionRutinaria } from "../../domain/actividades.js";
import { puestoRequiereAtencionRutinaria } from "../../domain/cobertura.js";
import { useApp } from "../../context/AppContext.jsx";
import { useFeriadosDelAno } from "../../lib/useFeriadosDelAno.js";
import { useIsMobile } from "../../lib/responsive.js";
import { useT } from "../../i18n/useT.js";
import CoberturaDetalleModal from "./CoberturaDetalleModal.jsx";
import ModalActividad from "../actividades/ModalActividad.jsx";

export default function Dashboard({ personas, alerts, setView, actividadesPlan, setActividadesPlan, roleData, month, year }) {
  const t = useT();
  const [detalleCobertura, setDetalleCobertura] = useState(null);
  const [modalActividad, setModalActividad] = useState(null);
  const [puestoActivo, setPuestoActivo] = useState(opcionesPuestoOperativo[0]);
  const [normativaAbierta, setNormativaAbierta] = useState(false);
  const { reglas } = useApp();
  const puestosRequieren = reglas?.puestosRequierenVisitantesDiario;
  const feriados = useFeriadosDelAno(year);
  // Hasta el breakpoint `lg` (1023 px) la grilla de 7 columnas deja
  // casillas apretadas (también en tablets en portrait y con zoom de
  // sistema alto); ahí la cobertura se presenta como lista apilada.
  const esAngosto = useIsMobile();
  const personasActivas = useMemo(() => personas.filter((p) => p.estado !== "Inactivo"), [personas]);
  const diasMes = useMemo(() => Array.from({ length: dim(year, month) }, (_, i) => i + 1), [year, month]);
  const diasCalendario = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];
  const blancosInicioMes = useMemo(
    () => Array.from({ length: (new Date(year, month, 1).getDay() + 6) % 7 }, (_, i) => i),
    [year, month],
  );

  // Cache memoizado: para cada puesto y día calcula una vez los conjuntos
  // de programados, en turno y atención rutinaria. Reemplaza N*M iteraciones
  // ad-hoc por una sola pasada. Recalcula solo cuando cambian las
  // dependencias.
  const coberturaCache = useMemo(() => {
    const out = {};
    for (const puesto of opcionesPuestoOperativo) {
      out[puesto] = {};
      for (const d of diasMes) {
        const iso = isoFecha(year, month, d);
        const acts = actividadesEnDia(actividadesPlan || [], iso);

        // Programados en actividades cuyo lugar coincide con el puesto.
        const mapa = new Map();
        for (const a of acts) {
          if ((a.lugar || "") === puesto) {
            for (const n of a.funcionarios || []) {
              if (!mapa.has(n)) mapa.set(n, []);
              mapa.get(n).push(a.titulo);
            }
          }
        }
        const programados = Array.from(mapa.entries()).map(([nombre, actividades]) => ({ nombre, actividades }));

        // Funcionarios en turno según rol (con feriados aplicados).
        const turno = personas
          .filter(
            (p) =>
              (p.puestoOperativo || "Puesto Quetzales") === puesto &&
              p.estado !== "Inactivo" &&
              esRolActivo(codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, d, feriados)),
          )
          .map((p) => ({
            ...p,
            rol: codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, d, feriados),
            actividades: acts.filter((a) => (a.funcionarios || []).includes(p.nombre)),
          }));

        // Asignados a "Atención rutinaria de visitantes" en este puesto.
        const atencion = acts.filter((a) => (a.lugar || "") === puesto && esAtencionRutinaria(a)).flatMap((a) => a.funcionarios || []);

        out[puesto][d] = { iso, programados, turno, atencion };
      }
    }
    return out;
  }, [year, month, diasMes, personas, roleData, actividadesPlan, feriados]);

  const funcionariosProgramadosPuestoDia = (puesto, d) => coberturaCache[puesto]?.[d]?.programados || [];
  const funcionariosEnTurnoPuestoDia = (puesto, d) => coberturaCache[puesto]?.[d]?.turno || [];
  const atencionRutinariaPuestoDia = (puesto, d) => coberturaCache[puesto]?.[d]?.atencion || [];
  const conteoPorPuestoDia = (puesto, d) => funcionariosProgramadosPuestoDia(puesto, d).length;
  const totalRolPuestoDia = (puesto, d) => funcionariosEnTurnoPuestoDia(puesto, d).length;
  // Clasificación semafórica de un día, compartida por la casilla (grilla)
  // y la fila (lista apilada) para que ambas digan exactamente lo mismo.
  const estadoDia = (puesto, d) => {
    const programados = conteoPorPuestoDia(puesto, d);
    const rol = totalRolPuestoDia(puesto, d);
    const atencion = atencionRutinariaPuestoDia(puesto, d).length;
    const faltaAtencion = puestoRequiereAtencionRutinaria(puesto, puestosRequieren) && atencion === 0;
    const faltaActividad = rol > 0 && programados === 0;
    const marco = faltaAtencion
      ? "border-red-500 bg-red-50"
      : faltaActividad
      ? "border-amber-400 bg-amber-50"
      : programados
      ? "border-emerald-500 bg-emerald-50"
      : "border-slate-200 bg-white";
    return { programados, rol, atencion, faltaAtencion, faltaActividad, marco };
  };
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

  // KPIs derivados del cache; recalculan solo cuando cambia el cache o las
  // entradas que afectan al "hoy".
  const diasSinVisit = useMemo(
    () =>
      diasMes.filter((d) =>
        opcionesPuestoOperativo.some(
          (p) => puestoRequiereAtencionRutinaria(p, puestosRequieren) && (coberturaCache[p]?.[d]?.atencion?.length || 0) === 0,
        ),
      ).length,
    [diasMes, coberturaCache, puestosRequieren],
  );
  const sinActividadHoy = useMemo(() => {
    const actsHoy = actividadesEnDia(actividadesPlan || [], isoHoy);
    return personasActivas.filter((p) => {
      const rol = codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, diaRef, feriados);
      if (!esRolActivo(rol)) return false;
      return actsHoy.filter((a) => (a.funcionarios || []).includes(p.nombre)).length === 0;
    }).length;
  }, [personasActivas, actividadesPlan, isoHoy, personas, roleData, year, month, diaRef, feriados]);
  const porVencer = useMemo(
    () =>
      personas.filter((f) => {
        if (!f.disponibilidad || !f.vencimiento) return false;
        const d = faltan(f.vencimiento);
        return d !== null && d >= 0 && d <= 30;
      }).length,
    [personas],
  );
  const totalActivos = useMemo(() => personas.filter((f) => f.estado === "Activo").length, [personas]);

  // KPIs separados por horizonte temporal: "Hoy" vs "Este mes".
  const kpisHoy = [
    {
      label: t("kpi.sinActividad"),
      value: sinActividadHoy,
      sub: t("kpi.sinActividadSub"),
      color: sinActividadHoy > 0 ? "text-amber-600" : "text-slate-900",
      cta: { label: t("dashboard.verDia"), action: () => setView("dia") },
    },
  ];
  const kpisMes = [
    {
      label: t("kpi.coberturaCritica"),
      value: diasSinVisit,
      sub: t("kpi.coberturaCriticaSub"),
      color: diasSinVisit > 0 ? "text-red-600" : "text-slate-900",
    },
    {
      label: t("kpi.porVencer"),
      value: porVencer,
      sub: t("kpi.porVencerSub"),
      color: porVencer > 0 ? "text-amber-600" : "text-slate-900",
    },
    {
      label: t("kpi.personalActivo"),
      value: totalActivos,
      sub: t("kpi.personalActivoSub", { total: personas.length }),
      color: "text-slate-900",
    },
  ];

  // Resumen por puesto memoizado por puesto. Evita recálculos al cambiar
  // de pill o al re-renderizar el modal de detalle.
  const resumenesPorPuesto = useMemo(() => {
    const out = {};
    for (const puesto of opcionesPuestoOperativo) {
      const sv = diasMes.filter(
        (d) => puestoRequiereAtencionRutinaria(puesto, puestosRequieren) && (coberturaCache[puesto]?.[d]?.atencion?.length || 0) === 0,
      ).length;
      const sp = diasMes.filter(
        (d) => (coberturaCache[puesto]?.[d]?.programados?.length || 0) === 0 && (coberturaCache[puesto]?.[d]?.turno?.length || 0) > 0,
      ).length;
      out[puesto] = { sinVisit: sv, sinPlan: sp };
    }
    return out;
  }, [diasMes, coberturaCache, puestosRequieren]);
  const resumenPuesto = (puesto) => resumenesPorPuesto[puesto] || { sinVisit: 0, sinPlan: 0 };

  const DiaCobertura = ({ puesto, d }) => {
    const { programados, rol, atencion, faltaAtencion, marco } = estadoDia(puesto, d);
    const dow = new Date(year, month, d).getDay();
    return (
      <button
        type="button"
        onClick={() => abrirDetalle(puesto, d)}
        className={`relative min-h-[88px] rounded-2xl border-2 p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:ring-2 focus:ring-emerald-700 ${marco}`}
        title={faltaAtencion ? t("dashboard.cell.alerta") : t("dashboard.cell.titulo")}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold">{d}</span>
          <span className="text-[9px] uppercase text-slate-400">{dias[dow]}</span>
        </div>
        {/* La grilla solo se muestra desde `sm` (abajo rige la lista
            apilada), así que las etiquetas van siempre completas. */}
        <div className="mt-1 flex flex-col gap-0.5">
          <div className="flex justify-between rounded bg-white/60 px-1.5 py-0.5 text-[11px]">
            <span>{t("dashboard.cell.turno")}</span>
            <span className="font-semibold">{rol}</span>
          </div>
          <div className="flex justify-between rounded bg-white/60 px-1.5 py-0.5 text-[11px]">
            <span>{t("dashboard.cell.plan")}</span>
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
            <span>{t("dashboard.cell.visit")}</span>
            <span className="font-semibold">{atencion}</span>
          </div>
        </div>
      </button>
    );
  };

  // Variante apilada para pantallas angostas: una fila por día con las
  // etiquetas completas (Turno/Plan/Visit.) que en la grilla no caben.
  const DiaCoberturaFila = ({ puesto, d }) => {
    const { programados, rol, atencion, faltaAtencion, marco } = estadoDia(puesto, d);
    const dow = new Date(year, month, d).getDay();
    const chip = "flex items-center gap-1 rounded-lg bg-white/70 px-1.5 py-1 text-[11px]";
    return (
      <button
        type="button"
        onClick={() => abrirDetalle(puesto, d)}
        className={`flex min-h-touch w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left shadow-sm transition focus:ring-2 focus:ring-emerald-700 ${marco}`}
        title={faltaAtencion ? t("dashboard.cell.alerta") : t("dashboard.cell.titulo")}
      >
        <span className="flex w-10 shrink-0 flex-col items-center leading-none">
          <span className="text-base font-semibold">{d}</span>
          <span className="mt-0.5 text-[9px] uppercase text-slate-400">{diasLargos[dow].slice(0, 3)}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">
          <span className={chip}>
            {t("dashboard.cell.turno")} <span className="font-semibold">{rol}</span>
          </span>
          <span className={chip}>
            {t("dashboard.cell.plan")} <span className="font-semibold">{programados}</span>
          </span>
          <span
            className={`flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] ${
              atencion ? "bg-emerald-100 text-emerald-900" : faltaAtencion ? "bg-red-600 font-semibold text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            {t("dashboard.cell.visit")} <span className="font-semibold">{atencion}</span>
          </span>
        </span>
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
            {t("dashboard.bloqueHoy", { dia: diaRef })}
          </h2>
          <button
            type="button"
            onClick={() => setView("dia")}
            className="min-h-touch rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("dashboard.verDia")}
          </button>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpisHoy.map(({ label, value, sub, color, cta }) => (
            <div key={label} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">{t("dashboard.badgeHoy")}</span>
              </div>
              <div className={`mt-2 text-4xl font-semibold ${color}`}>{value}</div>
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
            {t("dashboard.bloqueMes", { mes: meses[month], anio: year })}
          </h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpisMes.map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">{t("dashboard.badgeMes")}</span>
              </div>
              <div className={`mt-2 text-4xl font-semibold ${color}`}>{value}</div>
              <div className="mt-1 text-xs text-slate-400">{sub}</div>
            </div>
          ))}
        </div>
      </section>
      <Card
        title={t("dashboard.coberturaTitulo", { mes: meses[month], anio: year })}
        icon="📍"
        action={
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-950">{t("dashboard.leyendaTurno")}</span>
            <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-1 text-emerald-950">{t("dashboard.leyendaPlan")}</span>
            <span className="rounded-lg border border-red-300 bg-red-100 px-2 py-1 text-red-950">{t("dashboard.leyendaVisit")}</span>
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
                  {sinVisit > 0 ? t("dashboard.sinVisit", { n: sinVisit }) : t("dashboard.visitCubierta")} ·{" "}
                  {sinPlan > 0 ? t("dashboard.sinPlan", { n: sinPlan }) : t("dashboard.planCompleto")}
                </div>
              </div>
              {puestoRequiereAtencionRutinaria(puestoActivo, puestosRequieren) && (
                <Badge className="border-red-200 bg-red-50 text-red-900">{t("dashboard.requiereVisitDiario")}</Badge>
              )}
            </div>
          );
        })()}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          {esAngosto ? (
            <ol className="space-y-1.5">
              {diasMes.map((d) => (
                <li key={`${puestoActivo}-fila-${d}`}>
                  <DiaCoberturaFila puesto={puestoActivo} d={d} />
                </li>
              ))}
            </ol>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {diasCalendario.map((dia) => (
                <div
                  key={`hdr-${dia}`}
                  className="rounded-xl bg-slate-900 px-1 py-2 text-center text-[10px] font-semibold tracking-wide text-white shadow-sm sm:px-1.5"
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
          )}
        </div>
        <div className="mt-3 text-xs font-medium text-slate-500">
          {t("dashboard.coberturaNota")}
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
          title={t("dashboard.alertasActivasTitulo")}
          icon="🔔"
          action={
            <button onClick={() => setView("alertas")} className="text-sm font-semibold text-emerald-800">
              {t("dashboard.verTodas")}
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
          title={t("dashboard.estadoPersonalTitulo")}
          icon="👥"
          action={
            <button onClick={() => setView("funcionarios")} className="text-sm font-semibold text-emerald-800">
              {t("dashboard.abrirFuncionarios")}
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
            {t("dashboard.marcoNormativo")}
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
              {t("app.reglaDura")}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
