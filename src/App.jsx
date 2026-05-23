import React, { useMemo, useState } from "react";

const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SETIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const dias = ["D", "L", "K", "M", "J", "V", "S"];
const diasLargos = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
const puestos = [
  { nombre: "Puesto Orosi", tag: "OR", color: "bg-orange-100 text-orange-950", funcionarios: ["Errol Salazar", "Mayra Espinoza", "Yeison Cortés", "Kenneth Mena", "Fabricio Carbonell"] },
  { nombre: "Puesto Quetzales", tag: "QZ", color: "bg-orange-500 text-white", funcionarios: ["Juan Pablo Granados", "Karen Valle", "Josué Brenes", "Laura Valverde", "Diana Tencio", "Jetzelly Villalobos", "Pablo Sánchez"] },
  { nombre: "Puesto Esperanza", tag: "LE", color: "bg-sky-100 text-sky-950", funcionarios: ["Yolanda Elizondo", "Mariano Solís", "Guillermo Pérez", "Carlos Cordero"] },
];
const opcionesPuesto = ["Administrador de ASP", "Guardaparques", "Asistente Administrativo", "Técnico en Recursos Naturales", "Personal Apoyo ONG-Invest-Volunt"];
const opcionesEstado = ["Activo", "Inactivo", "De vacaciones", "Incapacitado"];
const opcionesCondicion = ["Propiedad", "Interino", "ONG-Invest-Volunt"];
const opcionesModalidad = ["Horario administrativo L-V", "10x5", "12x6", "14x7", "16x8", "20x10"];
const opcionesPuestoOperativo = puestos.map(p => p.nombre);
const opcionesLugarActividad = [...opcionesPuestoOperativo, "Secretaría Ejecutiva/Dirección ACC"];
const actividadRutinariaVisitantes = "Atención rutinaria de visitantes";
const opcionesActividadBase = [actividadRutinariaVisitantes];

const baseFuncionarios = puestos.flatMap((p, gi) => p.funcionarios.map((nombre, pi) => {
  const n = gi * 10 + pi + 1;
  const esPablo = nombre === "Pablo Sánchez";
  const esAdmin = nombre === "Yolanda Elizondo";
  const esOng = nombre === "Carlos Cordero";
  const sinRes = ["Yeison Cortés", "Jetzelly Villalobos", "Guillermo Pérez"].includes(nombre);
  const estado = nombre === "Fabricio Carbonell" ? "De vacaciones" : nombre === "Guillermo Pérez" ? "Incapacitado" : "Activo";
  return {
    id: `f${n}`,
    nombre,
    cedula: `1-0000-${String(n).padStart(4, "0")}`,
    email: esPablo ? "psforestal@yahoo.com" : `${nombre.toLowerCase().replaceAll(" ", ".")}@sinac.go.cr`,
    puesto: esPablo ? "Técnico en Recursos Naturales" : esAdmin ? "Asistente Administrativo" : esOng ? "Personal Apoyo ONG-Invest-Volunt" : "Guardaparques",
    condicion: esOng ? "ONG-Invest-Volunt" : n % 5 === 0 ? "Interino" : "Propiedad",
    jornada: esPablo || esAdmin ? "Ordinaria" : "Acumulativa",
    modalidad: esPablo || esAdmin ? "Horario administrativo L-V" : n % 7 === 0 ? "16x8" : n % 4 === 0 ? "12x6" : "10x5",
    resolucion: sinRes ? "" : esOng ? "CONV-ONG-INV-VOL-2026" : esPablo || esAdmin ? "" : `RES-ACC-${String(n).padStart(3, "0")}-2026`,
    disponibilidad: !esPablo && !esAdmin && !esOng && n % 3 !== 0,
    contrato: !esPablo && !esAdmin && !esOng && n % 3 !== 0 ? `DISP-2026-${String(n).padStart(3, "0")}` : "",
    vencimiento: n % 5 === 0 ? "2026-05-30" : n % 4 === 0 ? "2026-06-30" : n % 3 !== 0 ? "2026-12-31" : "",
    policia: !esPablo && !esAdmin && !esOng && !sinRes,
    brigada: n % 4 === 2,
    ong: esOng,
    jefe: "Administración PNLQ",
    estado,
    ingreso: "2026-01-01",
    puestoOperativo: p.nombre,
    obs: `${p.nombre}${sinRes ? " · Dato pendiente: resolución acumulativa" : ""}`,
  };
}));

const baseActividadesPlan = [
  { id: "a1", titulo: actividadRutinariaVisitantes, inicio: "2026-05-06", fin: "2026-05-06", unDia: true, funcionarios: ["Errol Salazar"], lugar: "Puesto Orosi", observaciones: "Atención rutinaria de visitantes en puesto operativo.", viatico: false },
  { id: "a2", titulo: "Mantenimiento y revisión de infraestructura", inicio: "2026-05-12", fin: "2026-05-13", unDia: false, funcionarios: ["Mariano Solís", "Yolanda Elizondo", "Guillermo Pérez"], lugar: "Puesto Esperanza", observaciones: "Coordinar herramientas y registro fotográfico.", viatico: true },
  { id: "a3", titulo: actividadRutinariaVisitantes, inicio: "2026-05-16", fin: "2026-05-16", unDia: true, funcionarios: ["Juan Pablo Granados", "Diana Tencio"], lugar: "Puesto Quetzales", observaciones: "Atención rutinaria de visitantes en ingreso principal.", viatico: false },
  { id: "a4", titulo: "Gira de seguimiento a infraestructura y rotulación", inicio: "2026-06-04", fin: "2026-06-05", unDia: false, funcionarios: ["Pablo Sánchez", "Mariano Solís", "Karen Valle"], lugar: "Sectores Quetzales y Esperanza", observaciones: "Actividad del mes siguiente marcada para adelanto de viático.", viatico: true },
  { id: "a5", titulo: "Ejemplo de conflicto rol-vs-planificación", inicio: "2026-05-12", fin: "2026-05-12", unDia: true, funcionarios: ["Errol Salazar"], lugar: "Sendero principal", observaciones: "Registro de ejemplo: el funcionario aparece programado aunque su rol del día no corresponde a turno.", viatico: false },
];

function dim(y, m) { return new Date(y, m + 1, 0).getDate(); }
function iniciales(n) { return n.split(" ").slice(0, 2).map(x => x[0]).join("").toUpperCase(); }
function fecha(f) { if (!f) return "—"; const p = f.split("-"); return `${p[2]}/${p[1]}/${p[0]}`; }
function faltan(f) { if (!f) return null; return Math.round((new Date(f + "T00:00:00") - new Date(2026, 4, 19)) / 86400000); }
function avatar(n) { return ["bg-emerald-100 text-emerald-900", "bg-sky-100 text-sky-900", "bg-rose-100 text-rose-900", "bg-amber-100 text-amber-900", "bg-purple-100 text-purple-900"][n.charCodeAt(0) % 5]; }
function estadoCls(e) { return { Activo: "bg-emerald-100 text-emerald-900 border-emerald-200", "De vacaciones": "bg-sky-100 text-sky-900 border-sky-200", Incapacitado: "bg-red-100 text-red-900 border-red-200", Inactivo: "bg-slate-100 text-slate-700 border-slate-200" }[e] || "bg-slate-100 text-slate-700 border-slate-200"; }
function codigo(pi, d, gi) { const s = (pi * 5 + d + gi * 7) % 36; if (s === 0) return "I1"; if (s === 1) return "O1"; if (s === 2) return "O2"; if (s >= 3 && s <= 7) return `L${s - 2}`; if (s >= 28 && s <= 34) return `V${s - 27}`; return `T${((s + pi) % 20) + 1}`; }
function codigoCls(c, finde) { const v = String(c || "").toUpperCase(); if (v.startsWith("T")) return "bg-emerald-200 text-emerald-950 border-emerald-300"; if (v.startsWith("I")) return "bg-rose-200 text-rose-950 border-rose-300"; if (v.startsWith("V")) return "bg-sky-200 text-sky-950 border-sky-300"; if (v.startsWith("L")) return "bg-amber-200 text-amber-950 border-amber-300"; if (v.startsWith("O")) return "bg-violet-200 text-violet-950 border-violet-300"; if (!v) return finde ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-400 border-slate-200"; return finde ? "bg-slate-200 text-slate-950 border-slate-300" : "bg-emerald-100 text-emerald-950 border-emerald-200"; }
function actividades(d) { const a = []; if ([1,4,8,15,22,29].includes(d)) a.push(["PNLQ", "Reunión / control semanal", "ok"]); if ([5,12,19,26].includes(d)) a.push(["LE", "Mantenimiento sendero y bitácora", "ok"]); if ([6,7,13,20,27].includes(d)) a.push(["OR", "Patrullaje preventivo", "ok"]); if ([9,16,23,30].includes(d)) a.push(["QZ", "Apoyo control de visitación", "ok"]); if ([7,16,17,22].includes(d)) a.push(["ADM", "Pendiente revisar / confirmar", "alerta"]); if ([11,14,18,25].includes(d)) a.push(["CC", "Informe, inventario o coordinación", "suave"]); return a; }
function alertas(personas) { const r = []; personas.forEach(f => { const d = faltan(f.vencimiento); if (f.disponibilidad && d !== null && d <= 60) r.push({ t: d < 0 ? "danger" : "warn", icon: d < 0 ? "🚨" : "⚠️", msg: `${d < 0 ? "Disponibilidad vencida" : "Disponibilidad por vencer"} — ${f.nombre}`, sub: `${f.contrato} · vence ${fecha(f.vencimiento)}. Requiere revisión administrativa.` }); if (f.jornada === "Acumulativa" && !f.resolucion && !f.ong) r.push({ t: "warn", icon: "📄", msg: `Sin resolución acumulativa — ${f.nombre}`, sub: "Dato pendiente: no automatizar efectos hasta confirmar respaldo interno." }); if (f.estado === "Incapacitado" && f.disponibilidad) r.push({ t: "danger", icon: "🩺", msg: `Revisar disponibilidad — ${f.nombre}`, sub: "Verificar días naturales de ausencia y criterio RH." }); }); return r.length ? r : [{ t: "ok", icon: "✅", msg: "Sin alertas críticas", sub: "No se observan vencimientos o bloqueos críticos en los datos visibles." }]; }
function Badge({ children, className = "" }) { return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>; }
function Avatar({ name }) { return <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatar(name)}`}>{iniciales(name)}</div>; }
function Card({ title, icon, action, children }) { return <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-base font-semibold"><span>{icon}</span>{title}</div>{action}</div>{children}</div>; }
function AlertItem({ a }) { const c = a.t === "danger" ? "border-red-600 bg-red-50 text-red-950" : a.t === "warn" ? "border-yellow-500 bg-yellow-50 text-yellow-950" : a.t === "ok" ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-blue-500 bg-blue-50 text-blue-950"; return <div className={`flex gap-3 rounded-xl border-l-4 p-3 ${c}`}><div>{a.icon}</div><div><div className="text-sm font-semibold">{a.msg}</div><div className="mt-1 text-xs opacity-80">{a.sub}</div></div></div>; }
function AlertStrip({ alerts, setView }) {
  const criticas = alerts.filter(a => a.t === "danger" || a.t === "warn");
  if (!criticas.length) return null;
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-800">Requiere atención · {criticas.length}</p><div className="flex gap-2 overflow-x-auto pb-1">{criticas.slice(0, 5).map((a, i) => <button key={i} onClick={() => setView("alertas")} className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-100"><span>{a.icon}</span><span className="max-w-[140px] truncate">{a.msg.split(" — ")[0]}</span><span className="text-red-500">→</span></button>)}</div></div>;
}

function Sidebar({ view, setView, nAlertas }) {
  const grupos = [
    ["Principal", [["dashboard", "Dashboard", "🏠"], ["funcionarios", "Funcionarios", "👥"]]],
    ["Jornadas", [["roles", "Roles", "📊"], ["planificacion", "Planificación general", "🗓️"], ["planFuncionario", "Planificación/Funcionario", "📋"], ["adelantos", "Adelanto de viáticos", "💵"], ["disponibilidad", "Disponibilidad", "🛡️"]]],
    ["Control", [["alertas", "Alertas", "🔔"]]],
  ];
  return <aside className="hidden w-60 shrink-0 flex-col bg-emerald-900 text-white lg:flex"><div className="border-b border-white/10 p-6"><div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">SINAC · Costa Rica</div><div className="mt-2 text-xl font-semibold leading-tight">Parque Nacional<br />Los Quetzales</div><div className="mt-2 text-sm text-white/65">Gestión de jornadas laborales</div></div><nav className="flex-1 p-3">{grupos.map(([g, items]) => <div key={g}><div className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-white/45">{g}</div>{items.map(([id, label, icon]) => <button key={id} onClick={() => setView(id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${view === id ? "bg-white/20 text-white ring-1 ring-white/20" : "text-white/80 hover:bg-white/10"}`}><span>{icon}</span>{label}{id === "alertas" && nAlertas > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{nAlertas}</span>}</button>)}</div>)}</nav><div className="border-t border-white/10 p-4 text-xs"><strong className="font-semibold">P. Sánchez N.</strong><div className="text-white/60">Guardaparques · ACC</div></div></aside>;
}

function Topbar({ view, setView, month, setMonth, year, setYear, compact, setCompact }) {
  const titulo = { dashboard: "Dashboard", funcionarios: "Funcionarios", roles: "Roles", planificacion: "Planificación general", planFuncionario: "Planificación/Funcionario", adelantos: "Adelanto de viáticos", disponibilidad: "Disponibilidad", alertas: "Alertas" }[view];
  const moverMes = paso => {
    let nuevoMes = month + paso;
    let nuevoAno = year;
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAno -= 1; }
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAno += 1; }
    setMonth(nuevoMes);
    setYear(nuevoAno);
  };
  return <header className="sticky top-0 z-30 border-b border-slate-300 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:px-6"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div><div className="text-xs font-semibold uppercase tracking-widest text-slate-500">PNLQ / {titulo}</div><h1 className="text-xl font-semibold tracking-tight">Gestión de jornadas laborales</h1></div><div className="flex flex-wrap items-center gap-2">{(view === "dashboard" || view === "roles" || view === "planificacion" || view === "planFuncionario") && <><button onClick={() => moverMes(-1)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">← Mes anterior</button><select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" value={month} onChange={e => setMonth(Number(e.target.value))}>{meses.map((m, i) => <option key={m} value={i}>{m}</option>)}</select><select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" value={year} onChange={e => setYear(Number(e.target.value))}>{[2025, 2026, 2027, 2028, 2029].map(y => <option key={y}>{y}</option>)}</select><button onClick={() => moverMes(1)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">Mes siguiente →</button>{view === "roles" && <button onClick={() => setCompact(!compact)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">{compact ? "Vista amplia" : "Vista compacta"}</button>}</>}<span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />Activo</span></div></div></header>;
}

function BottomNav({ view, setView, nAlertas }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const main = [["dashboard","Inicio","🏠"],["funcionarios","Personal","👥"],["planificacion","Plan","🗓️"],["alertas","Alertas","🔔"]];
  const more = [["roles","Roles","📊"],["planFuncionario","Plan/Func.","📋"],["adelantos","Viáticos","💵"],["disponibilidad","Disponib.","🛡️"]];
  return <>
    {moreOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMoreOpen(false)} />}
    {moreOpen && <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl lg:hidden"><div className="grid grid-cols-2 gap-2">{more.map(([id,label,icon]) => <button key={id} onClick={() => { setView(id); setMoreOpen(false); }} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold ${view===id?"bg-emerald-800 text-white":"bg-slate-50 text-slate-700 hover:bg-slate-100"}`}><span>{icon}</span>{label}</button>)}</div></div>}
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white lg:hidden"><div className="grid grid-cols-5">{main.map(([id,label,icon]) => <button key={id} onClick={() => { setView(id); setMoreOpen(false); }} className={`relative flex flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-semibold ${view===id?"text-emerald-800":"text-slate-500"}`}><span className="text-lg leading-none">{icon}</span>{label}{id==="alertas"&&nAlertas>0&&<span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{nAlertas}</span>}</button>)}<button onClick={() => setMoreOpen(!moreOpen)} className={`flex flex-col items-center justify-center gap-0.5 py-3 text-[11px] font-semibold ${moreOpen?"text-emerald-800":"text-slate-500"}`}><span className="text-lg leading-none">☰</span>Más</button></div></nav>
  </>;
}

function Dashboard({ personas, alerts, setView, actividadesPlan, setActividadesPlan, roleData, month, year }) {
  const [detalleCobertura, setDetalleCobertura] = useState(null);
  const [modalActividad, setModalActividad] = useState(null);
  const [puestoActivo, setPuestoActivo] = useState(opcionesPuestoOperativo[0]);
  const [normativaAbierta, setNormativaAbierta] = useState(false);
  const personasActivas = personas.filter(p => p.estado !== "Inactivo");
  const diasMes = Array.from({ length: dim(year, month) }, (_, i) => i + 1);
  const diasCalendario = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];
  const blancosInicioMes = Array.from({ length: (new Date(year, month, 1).getDay() + 6) % 7 }, (_, i) => i);

  const funcionariosProgramadosPuestoDia = (puesto, d) => {
    const iso = isoFecha(year, month, d);
    const mapa = new Map();
    actividadesEnDia(actividadesPlan || [], iso).forEach(a => {
      if ((a.lugar || "") === puesto) {
        (a.funcionarios || []).forEach(n => {
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
      .filter(p => (p.puestoOperativo || "Puesto Quetzales") === puesto && p.estado !== "Inactivo" && esRolActivo(codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, d)))
      .map(p => ({
        ...p,
        rol: codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, d),
        actividades: actividadesEnDia(actividadesPlan || [], iso).filter(a => (a.funcionarios || []).includes(p.nombre)),
      }));
  };
  const atencionRutinariaPuestoDia = (puesto, d) => {
    const iso = isoFecha(year, month, d);
    return actividadesEnDia(actividadesPlan || [], iso)
      .filter(a => (a.lugar || "") === puesto && esAtencionRutinaria(a))
      .flatMap(a => a.funcionarios || []);
  };
  const conteoPorPuestoDia = (puesto, d) => funcionariosProgramadosPuestoDia(puesto, d).length;
  const totalRolPuestoDia = (puesto, d) => funcionariosEnTurnoPuestoDia(puesto, d).length;
  const abrirDetalle = (puesto, d) => {
    const iso = isoFecha(year, month, d);
    setDetalleCobertura({ puesto, dia: d, fecha: iso, programados: funcionariosProgramadosPuestoDia(puesto, d), rol: totalRolPuestoDia(puesto, d), turno: funcionariosEnTurnoPuestoDia(puesto, d), atencionRutinaria: atencionRutinariaPuestoDia(puesto, d), requiereAtencionRutinaria: puestoRequiereAtencionRutinaria(puesto) });
  };
  const nuevaActividadPara = (nombre, iso, lugar) => ({ id: `a${Date.now()}`, titulo: "", inicio: iso, fin: iso, unDia: true, funcionarios: [nombre], lugar, observaciones: "", viatico: false });
  const guardarActividad = act => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : (act.fin || act.inicio) };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan(prev => prev.some(a => a.id === normal.id) ? prev.map(a => a.id === normal.id ? normal : a) : [...prev, normal]);
    setModalActividad(null);
    setDetalleCobertura(null);
  };
  const eliminarActividad = id => { setActividadesPlan(prev => prev.filter(a => a.id !== id)); setModalActividad(null); setDetalleCobertura(null); };

  const diaRef = Math.min(19, dim(year, month));
  const isoHoy = isoFecha(year, month, diaRef);
  const diasSinVisit = diasMes.filter(d => opcionesPuestoOperativo.some(p => puestoRequiereAtencionRutinaria(p) && atencionRutinariaPuestoDia(p, d).length === 0)).length;
  const sinActividadHoy = personasActivas.filter(p => { const rol = codigoRolFuncionario(personas, roleData || {}, year, month, p.nombre, diaRef); if (!esRolActivo(rol)) return false; return actividadesEnDia(actividadesPlan || [], isoHoy).filter(a => (a.funcionarios || []).includes(p.nombre)).length === 0; }).length;
  const porVencer = personas.filter(f => { if (!f.disponibilidad || !f.vencimiento) return false; const d = faltan(f.vencimiento); return d !== null && d >= 0 && d <= 30; }).length;
  const kpis = [
    { label: "Cobertura crítica", value: diasSinVisit, sub: "días sin Visit. asignada", color: diasSinVisit > 0 ? "text-red-600" : "text-slate-900" },
    { label: "Sin actividad", value: sinActividadHoy, sub: "en turno hoy sin planificar", color: sinActividadHoy > 0 ? "text-amber-600" : "text-slate-900" },
    { label: "Por vencer", value: porVencer, sub: "disponibilidades ≤30 días", color: porVencer > 0 ? "text-amber-600" : "text-slate-900" },
    { label: "Personal activo", value: personas.filter(f => f.estado === "Activo").length, sub: `/ ${personas.length} total`, color: "text-slate-900" },
  ];
  const resumenPuesto = puesto => {
    const sv = diasMes.filter(d => puestoRequiereAtencionRutinaria(puesto) && atencionRutinariaPuestoDia(puesto, d).length === 0).length;
    const sp = diasMes.filter(d => conteoPorPuestoDia(puesto, d) === 0 && totalRolPuestoDia(puesto, d) > 0).length;
    return { sinVisit: sv, sinPlan: sp };
  };

  const DiaCobertura = ({ puesto, d }) => {
    const programados = conteoPorPuestoDia(puesto, d);
    const rol = totalRolPuestoDia(puesto, d);
    const atencion = atencionRutinariaPuestoDia(puesto, d).length;
    const faltaAtencion = puestoRequiereAtencionRutinaria(puesto) && atencion === 0;
    const faltaActividad = rol > 0 && programados === 0;
    const dow = new Date(year, month, d).getDay();
    return <button type="button" onClick={() => abrirDetalle(puesto, d)} className={`relative min-h-[88px] rounded-2xl border-2 p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:ring-2 focus:ring-emerald-700 ${faltaAtencion ? "border-red-500 bg-red-50" : faltaActividad ? "border-amber-400 bg-amber-50" : programados ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`} title={faltaAtencion ? "ALERTA: sin atención rutinaria de visitantes asignada" : "Ver detalle"}>
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold">{d}</span>
        <span className="text-[9px] uppercase text-slate-400">{dias[dow]}</span>
      </div>
      <div className="mt-1 flex flex-col gap-0.5">
        <div className="flex justify-between rounded bg-white/60 px-1.5 py-0.5 text-[11px]"><span>Turno</span><span className="font-semibold">{rol}</span></div>
        <div className="flex justify-between rounded bg-white/60 px-1.5 py-0.5 text-[11px]"><span>Plan</span><span className="font-semibold">{programados}</span></div>
        <div className={`flex justify-between rounded px-1.5 py-0.5 text-[11px] ${atencion ? "bg-emerald-100 text-emerald-900" : faltaAtencion ? "bg-red-600 font-semibold text-white" : "bg-slate-100 text-slate-500"}`}><span>Visit.</span><span className="font-semibold">{atencion}</span></div>
      </div>
    </button>;
  };

  return <section className="space-y-5">
    <AlertStrip alerts={alerts} setView={setView} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{kpis.map(({ label, value, sub, color }) => <div key={label} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm"><div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div><div className={`mt-2 text-4xl font-black ${color}`}>{value}</div><div className="mt-1 text-xs text-slate-400">{sub}</div></div>)}</div>
    <Card title={`Cobertura por puesto operativo — ${meses[month]} ${year}`} icon="📍" action={<div className="flex flex-wrap gap-1.5 text-[11px] font-semibold"><span className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-amber-950">Turno = rol activo</span><span className="rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-1 text-emerald-950">Plan = actividad</span><span className="rounded-lg border border-red-300 bg-red-100 px-2 py-1 text-red-950">Visit. = atención visitantes</span></div>}>
      <div className="mb-4 flex flex-wrap gap-2">{opcionesPuestoOperativo.map(puesto => { const { sinVisit, sinPlan } = resumenPuesto(puesto); return <button key={puesto} onClick={() => setPuestoActivo(puesto)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${puesto === puestoActivo ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>{puesto.replace("Puesto ", "")}{(sinVisit > 0 || sinPlan > 0) && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] text-white">!</span>}</button>; })}</div>
      {(() => { const { sinVisit, sinPlan } = resumenPuesto(puestoActivo); return <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2"><div><h3 className="text-base font-semibold text-slate-950">{puestoActivo}</h3><div className="text-xs text-slate-500">{sinVisit > 0 ? `${sinVisit} días sin Visit.` : "Visit. cubierta"} · {sinPlan > 0 ? `${sinPlan} días sin Plan` : "Plan completo"}</div></div>{puestoRequiereAtencionRutinaria(puestoActivo) && <Badge className="border-red-200 bg-red-50 text-red-900">Requiere Visit. diario</Badge>}</div>; })()}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm"><div className="grid grid-cols-7 gap-1.5">{diasCalendario.map(dia => <div key={`hdr-${dia}`} className="rounded-xl bg-slate-900 px-1.5 py-2 text-center text-[10px] font-semibold tracking-wide text-white shadow-sm">{dia}</div>)}{blancosInicioMes.map(b => <div key={`blank-${b}`} className="min-h-[88px] rounded-2xl border border-dashed border-slate-200 bg-slate-100/60" />)}{diasMes.map(d => <DiaCobertura key={`${puestoActivo}-${d}`} puesto={puestoActivo} d={d} />)}</div></div>
      <div className="mt-3 text-xs font-medium text-slate-500">Cada casilla abre el detalle de funcionarios programados, en turno y asignación de atención rutinaria de visitantes. Orosi y Quetzales alertan en rojo cuando Visit. = 0.</div>
    </Card>
    {detalleCobertura && <CoberturaDetalleModal data={detalleCobertura} cerrar={() => setDetalleCobertura(null)} onNuevaActividad={(nombre, iso, puesto) => setModalActividad(nuevaActividadPara(nombre, iso, puesto))} onEditarActividad={act => setModalActividad({ ...act })} />}
    {modalActividad && <ModalActividad valor={modalActividad} personas={personasActivas} cerrar={() => setModalActividad(null)} guardar={guardarActividad} eliminar={eliminarActividad} actividadesPlan={actividadesPlan} />}
    <div className="grid gap-4 xl:grid-cols-2">
      <Card title="Alertas activas" icon="🔔" action={<button onClick={() => setView("alertas")} className="text-sm font-semibold text-emerald-800">Ver todas</button>}><div className="space-y-2">{alerts.slice(0, 4).map((a, i) => <AlertItem key={i} a={a} />)}</div></Card>
      <Card title="Estado del personal" icon="👥" action={<button onClick={() => setView("funcionarios")} className="text-sm font-semibold text-emerald-800">Abrir funcionarios</button>}><div className="divide-y divide-slate-200">{personas.slice(0, 7).map(f => <div key={f.id} className="flex items-center gap-3 py-2"><Avatar name={f.nombre} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{f.nombre}</div><div className="truncate text-xs text-slate-500">{f.puesto}</div></div><Badge className={estadoCls(f.estado)}>{f.estado}</Badge></div>)}</div></Card>
    </div>
    <div className="rounded-2xl border border-slate-300 bg-white shadow-sm">
      <button onClick={() => setNormativaAbierta(!normativaAbierta)} className="flex w-full items-center justify-between gap-3 p-5 text-left"><div className="flex items-center gap-2 text-base font-semibold"><span>⚖️</span>Marco normativo / control interno</div><span className="text-slate-400">{normativaAbierta ? "▲" : "▼"}</span></button>
      {normativaAbierta && <div className="border-t border-slate-200 p-5"><div className="flex flex-wrap gap-2">{["Dec. 28409-MINAE","Dec. 34885-MINAET","Dec. 40452-MINAE","CT arts. 135-144","Ley 8968","Ley 7575","Ley 6084","LGAP","Ley 8292"].map(x => <Badge key={x} className="border-blue-200 bg-blue-50 text-blue-900">🟢 {x}</Badge>)}</div><div className="mt-4 rounded-xl border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-950"><strong>Regla dura:</strong> el sistema registra y alerta; no genera pago, reposición, suspensión o derecho automático.</div></div>}
    </div>
  </section>;
}

function CoberturaDetalleModal({ data, cerrar, onNuevaActividad, onEditarActividad }) {
  const agrupadosTurno = data.turno.reduce((acc, f) => {
    const puesto = f.puestoOperativo || "Sin puesto operativo";
    if (!acc[puesto]) acc[puesto] = [];
    acc[puesto].push(f);
    return acc;
  }, {});
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"><div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"><div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5"><div><h3 className="text-lg font-semibold">Cobertura programada</h3><p className="text-sm font-bold text-slate-600">{data.puesto} · {fecha(data.fecha)}</p></div><button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button></div><div className="max-h-[76vh] overflow-y-auto p-5"><div className="grid gap-3 md:grid-cols-3"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><div className="text-xs font-bold uppercase tracking-wider opacity-70">Programados en actividades</div><div className="mt-1 text-3xl font-bold">{data.programados.length}</div></div><div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-950"><div className="text-xs font-bold uppercase tracking-wider opacity-70">En turno según rol</div><div className="mt-1 text-3xl font-bold">{data.rol}</div></div><div className={`rounded-2xl border p-4 ${data.requiereAtencionRutinaria && !data.atencionRutinaria.length ? "border-red-300 bg-red-100 text-red-950 ring-2 ring-red-400" : "border-blue-200 bg-blue-50 text-blue-950"}`}><div className="text-xs font-bold uppercase tracking-wider opacity-70">Atención rutinaria visitantes</div><div className="mt-1 text-3xl font-bold">{data.atencionRutinaria.length}</div>{data.requiereAtencionRutinaria && !data.atencionRutinaria.length && <div className="mt-1 text-xs font-bold">ALERTA: debe haber al menos una persona asignada.</div>}</div></div>{data.atencionRutinaria.length > 0 && <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-blue-950"><div className="text-xs font-bold uppercase tracking-wider opacity-70">Asignados a atención rutinaria de visitantes</div><div className="mt-2 flex flex-wrap gap-2">{data.atencionRutinaria.map(n => <span key={n} className="rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-bold">{n}</span>)}</div></div>}<div className="mt-5"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Funcionarios en turno según rol</div>{data.turno.length ? <div className="space-y-4">{Object.entries(agrupadosTurno).map(([puesto, items]) => <div key={puesto} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{puesto}</div><div className="space-y-2">{items.map(f => { const sinActividad = !f.actividades.length; return <div key={f.id} className={`rounded-2xl border p-3 ${sinActividad ? "border-yellow-300 bg-yellow-100 text-yellow-950" : "border-emerald-200 bg-white text-slate-950"}`}><div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><div className="font-semibold">{f.nombre}</div><div className="text-xs font-bold opacity-80">Rol: {f.rol} · {f.puesto}</div></div>{sinActividad ? <button onClick={() => onNuevaActividad(f.nombre, data.fecha, data.puesto)} className="rounded-xl bg-yellow-700 px-3 py-2 text-xs font-bold text-white hover:bg-yellow-800">Agregar actividad</button> : <button onClick={() => onEditarActividad(f.actividades[0])} className="rounded-xl bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Editar actividad</button>}</div>{sinActividad ? <div className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold">Sin actividad programada para este día.</div> : <div className="mt-2 flex flex-wrap gap-1.5">{f.actividades.map(a => <button key={a.id} onClick={() => onEditarActividad(a)} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100">{a.titulo} · {a.lugar || "Sin lugar"}</button>)}</div>}</div>; })}</div></div>)}</div> : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">No hay funcionarios en turno según rol para este puesto operativo y día.</div>}</div><div className="mt-5"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Funcionarios programados en actividades con este lugar</div>{data.programados.length ? <div className="space-y-2">{data.programados.map(item => <div key={item.nombre} className="rounded-2xl border border-slate-200 bg-white p-3"><div className="font-semibold text-slate-950">{item.nombre}</div><div className="mt-1 flex flex-wrap gap-1.5">{item.actividades.map((a, idx) => <span key={`${item.nombre}-${idx}`} className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-900">{a}</span>)}</div></div>)}</div> : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">No hay funcionarios programados en actividades con este puesto operativo como lugar para este día.</div>}</div></div><div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4"><button onClick={cerrar} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Cerrar</button></div></div></div>;
}

function Funcionarios({ personas, setPersonas }) {
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(null);
  const [borrar, setBorrar] = useState(null);
  const filtrados = useMemo(() => personas.filter(f => {
    const texto = `${f.nombre} ${f.cedula} ${f.puesto} ${f.puestoOperativo || ""} ${f.condicion} ${f.obs}`.toLowerCase();
    if (q && !texto.includes(q.toLowerCase())) return false;
    if (filtro === "guardas") return f.puesto === "Guardaparques";
    if (filtro === "disp") return f.disponibilidad;
    if (filtro === "acum") return f.jornada === "Acumulativa";
    if (filtro === "ong") return f.ong;
    if (filtro === "sin-res") return f.jornada === "Acumulativa" && !f.resolucion && !f.ong;
    return true;
  }), [personas, q, filtro]);
  const nuevo = () => ({ id: `f${Date.now()}`, nombre: "", cedula: "", email: "", puesto: "Guardaparques", puestoOperativo: "Puesto Quetzales", condicion: "Propiedad", jornada: "Ordinaria", modalidad: "Horario administrativo L-V", resolucion: "", disponibilidad: false, contrato: "", vencimiento: "", policia: false, brigada: false, ong: false, jefe: "Administración PNLQ", estado: "Activo", ingreso: "", obs: "" });
  const guardar = obj => { if (!obj.nombre.trim()) return; setPersonas(prev => prev.some(x => x.id === obj.id) ? prev.map(x => x.id === obj.id ? obj : x) : [obj, ...prev]); setModal(null); };
  return <section><Card title="Funcionarios" icon="👥" action={<button onClick={() => setModal(nuevo())} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">+ Agregar funcionario</button>}><div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center"><input value={q} onChange={e => setQ(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 xl:max-w-md" placeholder="Buscar por nombre, cédula, puesto u observación…" /><div className="flex flex-wrap gap-2">{[["todos", "Todos"], ["guardas", "Guardaparques"], ["disp", "Con disponibilidad"], ["acum", "Acumulativa"], ["ong", "ONG-Invest-Volunt"], ["sin-res", "Sin resolución"]].map(([id, label]) => <button key={id} onClick={() => setFiltro(id)} className={`rounded-full border px-3 py-2 text-xs font-bold ${filtro === id ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700"}`}>{label}</button>)}</div><div className="text-sm font-bold text-slate-500 xl:ml-auto">{filtrados.length}/{personas.length}</div></div><div className="overflow-auto rounded-xl border border-slate-300"><table className="min-w-[1040px] w-full border-collapse text-sm"><thead className="bg-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="p-3">Funcionario</th><th className="p-3">Cargo / puesto operativo</th><th className="p-3">Jornada</th><th className="p-3">Disponibilidad</th><th className="p-3">Atributos</th><th className="p-3">Estado</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-200">{filtrados.map(f => <tr key={f.id} className="hover:bg-slate-50"><td className="p-3"><div className="flex items-center gap-3"><Avatar name={f.nombre} /><div><div className="font-semibold">{f.nombre}</div><div className="text-xs text-slate-500">{f.cedula} · {f.email}</div></div></div></td><td className="p-3"><div className="font-bold">{f.puesto}</div><div className="mt-1 text-xs font-bold text-emerald-800">{f.puestoOperativo || "Sin puesto operativo"}</div><div className="mt-1 flex gap-1"><Badge className="border-slate-200 bg-slate-50 text-slate-700">{f.condicion}</Badge>{f.ong && <Badge className="border-orange-200 bg-orange-100 text-orange-900">ONG-Invest-Volunt</Badge>}</div></td><td className="p-3"><Badge className={f.jornada === "Acumulativa" ? "border-blue-200 bg-blue-100 text-blue-900" : "border-slate-200 bg-slate-100 text-slate-700"}>{f.jornada} {f.modalidad}</Badge>{f.jornada === "Acumulativa" && !f.resolucion && !f.ong && <div className="mt-1"><Badge className="border-yellow-300 bg-yellow-100 text-yellow-900">🔵 Sin resolución</Badge></div>}</td><td className="p-3">{f.disponibilidad ? <><Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">Sí</Badge><div className="mt-1 text-xs text-slate-500">{fecha(f.vencimiento)}</div></> : <Badge className="border-slate-200 bg-slate-100 text-slate-600">No</Badge>}</td><td className="p-3"><div className="flex gap-1">{f.policia && <Badge className="border-emerald-200 bg-emerald-50 text-emerald-900">Policía</Badge>}{f.brigada && <Badge className="border-orange-200 bg-orange-50 text-orange-900">Brigada</Badge>}{!f.policia && !f.brigada && <span className="text-slate-400">—</span>}</div></td><td className="p-3"><Badge className={estadoCls(f.estado)}>{f.estado}</Badge></td><td className="p-3 text-right"><button onClick={() => setModal({ ...f })} className="rounded-lg px-2 py-1 font-semibold text-blue-800 hover:bg-blue-50">Editar</button><button onClick={() => setBorrar(f.id)} className="rounded-lg px-2 py-1 font-semibold text-red-800 hover:bg-red-50">Eliminar</button></td></tr>)}</tbody></table></div><div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500"><span>🛡️ Autoridad de policía</span><span>🔥 Brigada forestal</span><span>🔵 Dato operativo por completar</span></div></Card>{modal && <ModalFuncionario valor={modal} cerrar={() => setModal(null)} guardar={guardar} />}{borrar && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6"><h3 className="text-lg font-semibold text-red-900">Eliminar funcionario</h3><p className="mt-2 text-sm">Se eliminará el registro de <strong>{personas.find(x => x.id === borrar)?.nombre}</strong> en esta propuesta visual.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setBorrar(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancelar</button><button onClick={() => { setPersonas(p => p.filter(x => x.id !== borrar)); setBorrar(null); }} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white">Eliminar</button></div></div></div>}</section>;
}

function ModalFuncionario({ valor, cerrar, guardar }) {
  const [f, setF] = useState(valor); const set = (k, v) => setF(p => ({ ...p, [k]: v })); const cls = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none";
  const Field = ({ label, children }) => <label><span className="mb-1 block text-xs font-bold uppercase text-slate-500">{label}</span>{children}</label>;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4"><div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"><div className="flex justify-between border-b p-5"><h3 className="text-lg font-semibold">{valor.nombre ? "Editar funcionario" : "Agregar funcionario"}</h3><button onClick={cerrar} className="font-black">✕</button></div><div className="max-h-[70vh] overflow-y-auto p-5"><div className="grid gap-4 md:grid-cols-2"><Field label="Nombre"><input className={cls} value={f.nombre} onChange={e => set("nombre", e.target.value)} /></Field><Field label="Cédula"><input className={cls} value={f.cedula} onChange={e => set("cedula", e.target.value)} /></Field><Field label="Correo"><input className={cls} value={f.email} onChange={e => set("email", e.target.value)} /></Field><Field label="Cargo institucional"><select className={cls} value={f.puesto} onChange={e => set("puesto", e.target.value)}>{opcionesPuesto.map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Puesto operativo"><select className={cls} value={f.puestoOperativo || "Puesto Quetzales"} onChange={e => set("puestoOperativo", e.target.value)}>{opcionesPuestoOperativo.map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Condición"><select className={cls} value={f.condicion} onChange={e => set("condicion", e.target.value)}>{opcionesCondicion.map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Estado"><select className={cls} value={f.estado} onChange={e => set("estado", e.target.value)}>{opcionesEstado.map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Jornada"><select className={cls} value={f.jornada} onChange={e => set("jornada", e.target.value)}><option>Ordinaria</option><option>Acumulativa</option></select></Field><Field label="Modalidad"><select className={cls} value={f.modalidad} onChange={e => set("modalidad", e.target.value)}>{opcionesModalidad.map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Resolución"><input className={cls} value={f.resolucion} onChange={e => set("resolucion", e.target.value)} /></Field><Field label="Contrato"><input className={cls} value={f.contrato} onChange={e => set("contrato", e.target.value)} /></Field><Field label="Vencimiento"><input type="date" className={cls} value={f.vencimiento} onChange={e => set("vencimiento", e.target.value)} /></Field><Field label="Ingreso"><input type="date" className={cls} value={f.ingreso} onChange={e => set("ingreso", e.target.value)} /></Field></div><div className="mt-4 grid gap-3 md:grid-cols-4">{[["disponibilidad", "Disponibilidad"], ["policia", "Autoridad policía"], ["brigada", "Brigada"], ["ong", "ONG-Invest-Volunt"]].map(([k, l]) => <label key={k} className="flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold"><input type="checkbox" checked={!!f[k]} onChange={e => set(k, e.target.checked)} />{l}</label>)}</div><label className="mt-4 block"><span className="mb-1 block text-xs font-bold uppercase text-slate-500">Observaciones</span><textarea className={`${cls} min-h-24`} value={f.obs} onChange={e => set("obs", e.target.value)} /></label></div><div className="flex justify-end gap-2 border-t bg-slate-50 p-4"><button onClick={cerrar} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">Cancelar</button><button onClick={() => guardar(f)} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">Guardar</button></div></div></div>;
}

function rolKey(year, month, puesto, persona, dia) { return `${year}-${month + 1}-${puesto}-${persona}-${dia}`; }
function rolCfgKey(year, month, puesto, persona) { return `CFG-${year}-${month + 1}-${puesto}-${persona}`; }
function parseModalidad(modalidad) { const texto = String(modalidad || "10x5").toLowerCase(); if (texto.includes("administrativo")) return { trabajo: 5, libre: 2, administrativo: true }; const p = texto.split("x"); return { trabajo: Number(p[0]) || 10, libre: Number(p[1]) || 5, administrativo: false }; }
function primerDiaLaboral(year, month) { for (let d = 1; d <= dim(year, month); d++) { const dow = new Date(year, month, d).getDay(); if (dow >= 1 && dow <= 5) return d; } return 1; }
function defaultRolValue(year, month, gi, pi, dia) { return codigo(gi * 10 + pi + month + year, dia, gi); }
function generarValorPatron(modalidad, dia, inicio, year, month) { const cfg = parseModalidad(modalidad); if (cfg.administrativo) { const dow = new Date(year, month, dia).getDay(); if (dow >= 1 && dow <= 5) return `T${dow}`; if (dow === 6) return "L1"; return "L2"; } const ciclo = cfg.trabajo + cfg.libre; const pos = (dia - inicio) % ciclo; if (dia < inicio) return ""; if (pos < cfg.trabajo) return `T${pos + 1}`; return `L${pos - cfg.trabajo + 1}`; }
function esRolActivo(v) { const x = String(v || "").toUpperCase(); return x.startsWith("T"); }
function etiquetaRol(v) { const x = String(v || "").toUpperCase(); if (x.startsWith("T")) return "Turno"; if (x.startsWith("L")) return "Libre"; if (x.startsWith("V")) return "Vacaciones"; if (x.startsWith("I")) return "Incapacidad"; if (x.startsWith("O")) return "Otro"; if (!x) return "Sin marcar"; return "Turno"; }
function categoriaDe(v) { const x = String(v || "").toUpperCase(); if (x.startsWith("T")) return "T"; if (x.startsWith("L")) return "L"; if (x.startsWith("V")) return "V"; if (x.startsWith("I")) return "I"; if (x.startsWith("O")) return "O"; return ""; }
function formatearCategoria(cat, consecutivo, modalidad) { const c = String(cat || "").toUpperCase(); if (!c) return ""; const cfg = parseModalidad(modalidad); if (c === "T") return `T${((consecutivo - 1) % cfg.trabajo) + 1}`; if (c === "L") return `L${((consecutivo - 1) % cfg.libre) + 1}`; return `${c}${consecutivo}`; }
function pad2(n) { return String(n).padStart(2, "0"); }
function isoFecha(year, month, dia) { return `${year}-${pad2(month + 1)}-${pad2(dia)}`; }
function funcionarioPorNombre(personas, nombre) { return personas.find(f => f.nombre === nombre); }
function modalidadFuncionario(personas, roleData, year, month, nombre) { const f = funcionarioPorNombre(personas, nombre); if (!f) return "10x5"; return roleData[rolCfgKey(year, month, f.puestoOperativo || "Puesto Quetzales", nombre)] || f.modalidad || "10x5"; }
function codigoRolFuncionario(personas, roleData, year, month, nombre, dia) { const f = funcionarioPorNombre(personas, nombre); if (!f) return ""; const puesto = f.puestoOperativo || "Puesto Quetzales"; const inicio = primerDiaLaboral(year, month); return roleData[rolKey(year, month, puesto, nombre, dia)] ?? generarValorPatron(modalidadFuncionario(personas, roleData, year, month, nombre), dia, inicio, year, month); }
function actividadesEnDia(actividadesPlan, iso) { return actividadesPlan.filter(a => iso >= a.inicio && iso <= (a.fin || a.inicio)); }
function esAtencionRutinaria(a) { return String(a?.titulo || "").trim().toLowerCase() === actividadRutinariaVisitantes.toLowerCase(); }
function puestoRequiereAtencionRutinaria(puesto) { return puesto === "Puesto Quetzales" || puesto === "Puesto Orosi"; }
function conflictosActividadDia(actividad, dia, year, month, personas, roleData) { return (actividad.funcionarios || []).filter(nombre => !esRolActivo(codigoRolFuncionario(personas, roleData, year, month, nombre, dia))); }
function actividadTieneConflictoMes(actividad, year, month, personas, roleData) { for (let d = 1; d <= dim(year, month); d++) { const iso = isoFecha(year, month, d); if (iso >= actividad.inicio && iso <= (actividad.fin || actividad.inicio) && conflictosActividadDia(actividad, d, year, month, personas, roleData).length) return true; } return false; }
function RoleCell({ value, onOpen, onConflicto, finde, compact, editable, esInicio, conflicto }) {
  const v = String(value || "").toUpperCase();
  const handleClick = conflicto ? onConflicto : (editable ? onOpen : undefined);
  const clickable = conflicto || editable;
  return <td className={`border-b border-r border-slate-200 p-0 text-center font-semibold ${codigoCls(v, finde)} ${esInicio ? "ring-2 ring-inset ring-emerald-700" : ""} ${conflicto ? "ring-4 ring-inset ring-red-600" : ""}`}><button type="button" onClick={handleClick} disabled={!clickable} className={`relative w-full ${compact ? "h-9 text-[11px]" : "h-11 text-[12px]"} font-semibold tracking-wide outline-none transition ${conflicto ? "cursor-pointer hover:brightness-90 focus:ring-2 focus:ring-red-500" : editable ? "cursor-pointer hover:brightness-95 focus:ring-2 focus:ring-emerald-700" : "cursor-default"}`} title={conflicto ? "Clic para resolver: rol vs actividad planificada" : editable ? "Cambiar marca del día" : "Active edición del funcionario para modificar"}><span className="inline-flex min-w-8 items-center justify-center rounded-md bg-white/45 px-1.5 py-0.5 shadow-sm ring-1 ring-black/5">{v || "—"}</span>{conflicto && <span className="absolute right-0 top-0 flex h-4 w-4 animate-pulse items-center justify-center rounded-bl-md bg-red-700 text-[10px] text-white">!</span>}{esInicio && <span className="absolute bottom-0 left-1 right-1 rounded-t bg-emerald-900 px-1 text-[8px] font-bold tracking-wider text-white">INICIO</span>}</button></td>;
}
function ConflictoModal({ data, cerrar, onModificarRol, onModificarActividad }) {
  const n = data.acts.length;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"><div className="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl"><div className="mb-3 flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-slate-950">Resolver incoherencia</h3><button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button></div><div className="mb-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-950"><strong>{data.persona}</strong> · día {data.dia}<br /><span className="text-xs opacity-80">Rol <strong>{data.valor || "—"}</strong> (no en turno) con {n} actividad{n !== 1 ? "es" : ""} planificada{n !== 1 ? "s" : ""}.</span></div><div className="grid gap-2"><button onClick={onModificarRol} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left hover:bg-emerald-100"><div className="text-sm font-semibold text-emerald-950">Modificar rol del día</div><div className="mt-0.5 text-xs text-emerald-700">Cambiar la categoría de turno para este funcionario</div></button><button onClick={onModificarActividad} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-left hover:bg-amber-100"><div className="text-sm font-semibold text-amber-950">Modificar actividad{n > 1 ? "es" : ""} <span className="ml-1 rounded-full bg-amber-200 px-1.5 py-0.5 text-xs">{n}</span></div><div className="mt-0.5 text-xs text-amber-700">Ver, editar o quitar al funcionario de las actividades del día</div></button></div><button onClick={cerrar} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button></div></div>;
}
function ActividadesDiaModal({ funcionario, iso, actividades: actividadesIniciales, allActividadesPlan, personas, setActividadesPlan, cerrar }) {
  const [editando, setEditando] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const personasActivas = personas.filter(p => p.estado !== "Inactivo");
  const actividades = actividadesEnDia(allActividadesPlan, iso).filter(a => (a.funcionarios || []).includes(funcionario));
  const quitarFuncionario = actId => setActividadesPlan(prev => prev.map(a => a.id === actId ? { ...a, funcionarios: a.funcionarios.filter(n => n !== funcionario) } : a));
  const eliminar = actId => { setActividadesPlan(prev => prev.filter(a => a.id !== actId)); setConfirmarEliminar(null); };
  const guardar = act => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : (act.fin || act.inicio) };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan(prev => prev.map(a => a.id === normal.id ? normal : a));
    setEditando(null);
  };
  if (editando) return <ModalActividad valor={editando} personas={personasActivas} cerrar={() => setEditando(null)} guardar={guardar} eliminar={id => { setActividadesPlan(prev => prev.filter(a => a.id !== id)); setEditando(null); }} actividadesPlan={allActividadesPlan} />;
  if (!actividades.length) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><p className="text-sm text-slate-600">Ya no hay actividades de <strong>{funcionario}</strong> en este día.</p><button onClick={cerrar} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Cerrar</button></div></div>;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"><div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5"><div><h3 className="text-lg font-semibold">Actividades · {funcionario}</h3><p className="text-sm text-slate-600">{fecha(iso)} · {actividades.length} actividad{actividades.length !== 1 ? "es" : ""} planificada{actividades.length !== 1 ? "s" : ""}</p></div><button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button></div><div className="max-h-[72vh] space-y-3 overflow-y-auto p-5">{actividades.map(act => <div key={act.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-2"><div className="font-semibold text-slate-950">{act.titulo}</div><div className="mt-0.5 text-xs text-slate-500">{act.inicio === (act.fin || act.inicio) ? fecha(act.inicio) : `${fecha(act.inicio)} → ${fecha(act.fin || act.inicio)}`}{act.lugar ? ` · 📍 ${act.lugar}` : ""}{act.viatico ? " · 💵 Viático" : ""}</div><div className="mt-2 flex flex-wrap gap-1">{(act.funcionarios || []).map(n => <span key={n} className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${n === funcionario ? "border-amber-400 bg-amber-100 text-amber-900 ring-1 ring-amber-300" : "border-slate-200 bg-white text-slate-600"}`}>{n}</span>)}</div></div><div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">{(act.funcionarios || []).includes(funcionario) && <button onClick={() => quitarFuncionario(act.id)} className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100">Quitar a {funcionario.split(" ")[0]}</button>}<button onClick={() => setEditando({ ...act })} className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Editar actividad</button><button onClick={() => setConfirmarEliminar(act.id)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100">Eliminar</button></div>{confirmarEliminar === act.id && <div className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3"><p className="text-sm font-semibold text-red-950">¿Eliminar esta actividad?</p><p className="mt-0.5 text-xs text-red-700">Desaparece para todos los funcionarios asignados.</p><div className="mt-2 flex gap-2"><button onClick={() => eliminar(act.id)} className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800">Confirmar</button><button onClick={() => setConfirmarEliminar(null)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Cancelar</button></div></div>}</div>)}</div><div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4"><button onClick={cerrar} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Cerrar</button></div></div></div>;
}
function MenuCelda({ data, cerrar, seleccionar }) {
  const opciones = [
    ["T", "Turno", "border-emerald-300 bg-emerald-100 text-emerald-950"],
    ["L", "Libre", "border-amber-300 bg-amber-100 text-amber-950"],
    ["V", "Vacaciones", "border-sky-300 bg-sky-100 text-sky-950"],
    ["I", "Incapacidad", "border-rose-300 bg-rose-100 text-rose-950"],
    ["O", "Otro", "border-violet-300 bg-violet-100 text-violet-950"],
  ];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 md:items-center md:p-4"><div className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl"><div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">Editar día {data.dia} · {data.persona}</h3><p className="text-sm text-slate-600">Seleccione únicamente la categoría. El número consecutivo se recalcula automáticamente en toda la fila.</p></div><button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button></div>{data.esInicio && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950"><strong>Primer día laboral del mes.</strong> La modalidad del funcionario define el reinicio de los consecutivos de turno y libre.</div>}<div className="grid gap-2 sm:grid-cols-2">{opciones.map(([cat, label, cls]) => <button key={cat} className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold shadow-sm hover:brightness-95 ${cls}`} onClick={() => seleccionar(cat)}><span className="block text-base">{label}</span><span className="mt-1 block text-xs opacity-75">Se mostrará como {cat}1, {cat}2...</span></button>)}</div><button className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => seleccionar("")}>Limpiar celda</button></div></div>;
}
function PuestoRolCard({ grupo, gi, days, year, month, compact, roleData, setRoleData, personas, actividadesPlan, setActividadesPlan }) {
  const [editRows, setEditRows] = useState({});
  const [menu, setMenu] = useState(null);
  const [conflictoActivo, setConflictoActivo] = useState(null);
  const [actividadesDiaModal, setActividadesDiaModal] = useState(null);
  const inicio = primerDiaLaboral(year, month);
  const toggleEdit = nombre => setEditRows(prev => ({ ...prev, [nombre]: !prev[nombre] }));
  const getCfg = persona => roleData[rolCfgKey(year, month, grupo.nombre, persona)] || (personas.find(f => f.nombre === persona)?.modalidad || "10x5");
  const setCfg = (persona, valor) => setRoleData(prev => ({ ...prev, [rolCfgKey(year, month, grupo.nombre, persona)]: valor }));
  const setCelda = (persona, dia, valor) => setRoleData(prev => ({ ...prev, [rolKey(year, month, grupo.nombre, persona, dia)]: valor }));
  const getCelda = (persona, pi, dia) => roleData[rolKey(year, month, grupo.nombre, persona, dia)] ?? generarValorPatron(getCfg(persona), dia, inicio, year, month);
  const aplicarPatron = (persona) => { const modalidad = getCfg(persona); const cambios = {}; days.forEach(d => { cambios[rolKey(year, month, grupo.nombre, persona, d)] = generarValorPatron(modalidad, d, inicio, year, month); }); setRoleData(prev => ({ ...prev, ...cambios })); };
  const renumerarFila = (persona, pi, diaEditado, categoria) => {
    const modalidad = getCfg(persona);
    const categorias = {};
    days.forEach(d => { categorias[d] = categoriaDe(getCelda(persona, pi, d)); });
    categorias[diaEditado] = categoria;
    const cambios = {};
    let categoriaAnterior = null;
    let consecutivo = 0;
    days.forEach(d => {
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
    setRoleData(prev => ({ ...prev, ...cambios }));
  };
  const seleccionarMenu = valor => { if (!menu) return; renumerarFila(menu.persona, menu.pi, menu.dia, valor); setMenu(null); };
  const abrirConflicto = (nombre, pi, d, val) => {
    const iso = isoFecha(year, month, d);
    const acts = actividadesEnDia(actividadesPlan || [], iso).filter(a => (a.funcionarios || []).includes(nombre));
    setConflictoActivo({ persona: nombre, pi, dia: d, valor: val, iso, acts, esInicio: d === inicio });
  };
  return <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100"><div className={`flex flex-col gap-2 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between ${grupo.color}`}><div><h3 className="text-lg font-semibold">{grupo.nombre}</h3></div><div className="flex flex-wrap gap-2"><Badge className="border-white/50 bg-white/70 text-slate-900">{meses[month]} {year}</Badge></div></div><div className="overflow-auto bg-slate-50"><table className="border-separate border-spacing-0 text-xs" style={{ minWidth: compact ? 1140 : 1380 }}><thead><tr><th className="sticky left-0 z-20 w-72 border-b border-r border-slate-200 bg-white p-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Funcionario / edición</th>{days.map(d => { const dow = new Date(year, month, d).getDay(); const isWeekend = dow === 0 || dow === 6; return <th key={d} className={`border-b border-r border-slate-200 p-1.5 text-center font-semibold ${isWeekend ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}`}><div className="mx-auto flex h-10 w-9 flex-col items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5"><span className="text-[13px] leading-none font-semibold">{d}</span><span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[9px] leading-none ${isWeekend ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"}`}>{dias[dow]}</span></div></th>; })}</tr></thead><tbody>{grupo.funcionarios.map((nombre, pi) => { const editing = !!editRows[nombre]; const modalidad = getCfg(nombre); return <tr key={nombre} className={editing ? "bg-emerald-50/60" : "bg-white"}><td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white p-2 align-top shadow-[2px_0_8px_rgba(15,23,42,0.04)]"><div className="space-y-2"><button onClick={() => toggleEdit(nombre)} className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left font-semibold shadow-sm hover:bg-slate-50"><span>{nombre}</span><span>{editing ? "🔓" : "🔒"}</span></button>{editing && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2 shadow-inner"><label className="mb-1 block text-[10px] font-bold uppercase text-emerald-900">Tipo de rol desde 1er día laboral</label><div className="flex gap-2"><select value={modalidad} onChange={e => setCfg(nombre, e.target.value)} className="min-w-0 flex-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-xs font-bold">{opcionesModalidad.map(x => <option key={x}>{x}</option>)}</select><button onClick={() => aplicarPatron(nombre)} className="rounded-lg bg-emerald-800 px-2 py-1 text-[11px] font-semibold text-white">Aplicar</button></div><div className="mt-1 text-[10px] font-bold text-emerald-900">Rellena de forma automática; luego puede ajustar celda por celda.</div></div>}</div></td>{days.map(d => { const dow = new Date(year, month, d).getDay(); const val = getCelda(nombre, pi, d); const tieneActividad = actividadesEnDia(actividadesPlan || [], isoFecha(year, month, d)).some(a => (a.funcionarios || []).includes(nombre)); const conflicto = tieneActividad && !esRolActivo(val); return <RoleCell key={`${nombre}-${d}`} value={val} compact={compact} editable={editing} finde={dow === 0 || dow === 6} esInicio={editing && d === inicio} conflicto={conflicto} onOpen={() => editing && setMenu({ persona: nombre, pi, dia: d, valor: val, esInicio: d === inicio })} onConflicto={() => abrirConflicto(nombre, pi, d, val)} />; })}</tr>; })}<tr><td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-100 p-3 text-xs font-bold uppercase tracking-wider text-slate-600">CANTIDAD EN TURNO</td>{days.map(d => { const count = grupo.funcionarios.reduce((acc, nombre, pi) => esRolActivo(getCelda(nombre, pi, d)) ? acc + 1 : acc, 0); return <td key={`cantidad-${d}`} className="border-b border-r border-slate-200 bg-white p-2 text-center font-semibold text-slate-800">{count}</td>; })}</tr></tbody></table></div>{menu && <MenuCelda data={menu} cerrar={() => setMenu(null)} seleccionar={seleccionarMenu} />}
    {conflictoActivo && <ConflictoModal data={conflictoActivo} cerrar={() => setConflictoActivo(null)} onModificarRol={() => { const d = conflictoActivo; setConflictoActivo(null); setMenu({ persona: d.persona, pi: d.pi, dia: d.dia, valor: d.valor, esInicio: d.esInicio }); }} onModificarActividad={() => { setActividadesDiaModal({ persona: conflictoActivo.persona, iso: conflictoActivo.iso }); setConflictoActivo(null); }} />}
    {actividadesDiaModal && <ActividadesDiaModal funcionario={actividadesDiaModal.persona} iso={actividadesDiaModal.iso} allActividadesPlan={actividadesPlan || []} personas={personas} setActividadesPlan={setActividadesPlan} cerrar={() => setActividadesDiaModal(null)} />}
  </div>;
}
function Roles({ year, month, compact, roleData, setRoleData, personas, actividadesPlan, setActividadesPlan }) {
  const days = Array.from({ length: dim(year, month) }, (_, i) => i + 1);
  const gruposRoles = puestos.map(p => ({ ...p, funcionarios: personas.filter(f => (f.puestoOperativo || "Puesto Quetzales") === p.nombre && f.estado !== "Inactivo").map(f => f.nombre) }));
  const limpiarMes = () => { const pref = `${year}-${month + 1}-`; setRoleData(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => !k.startsWith(pref) && !k.startsWith(`CFG-${year}-${month + 1}-`)))); };
  return <section className="space-y-4"><Card title={`Roles mensuales — ${meses[month]} ${year}`} icon="📊" action={<div className="flex flex-wrap gap-2"><button onClick={limpiarMes} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Restaurar mes</button><Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">Edición por fila</Badge></div>}><div className="mb-3 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-sm"><span className="rounded-lg border border-emerald-300 bg-emerald-200 px-2 py-1 text-emerald-950">T1 Turno</span><span className="rounded-lg border border-amber-300 bg-amber-200 px-2 py-1 text-amber-950">L1 Libre</span><span className="rounded-lg border border-sky-300 bg-sky-200 px-2 py-1 text-sky-950">V1 Vacaciones</span><span className="rounded-lg border border-rose-300 bg-rose-200 px-2 py-1 text-rose-950">I1 Incapacidad</span><span className="rounded-lg border border-violet-300 bg-violet-200 px-2 py-1 text-violet-950">O1 Otro</span></div><div className="space-y-6">{gruposRoles.map((g, gi) => <PuestoRolCard key={g.nombre} grupo={g} gi={gi} days={days} year={year} month={month} compact={compact} roleData={roleData} setRoleData={setRoleData} personas={personas} actividadesPlan={actividadesPlan} setActividadesPlan={setActividadesPlan} />)}</div></Card></section>;
}

function Planificacion({ year, month, personas, actividadesPlan, setActividadesPlan, roleData }) {
  const [modal, setModal] = useState(null);
  const days = Array.from({ length: dim(year, month) }, (_, i) => i + 1);
  const blanks = Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => i);
  const pad = n => String(n).padStart(2, "0");
  const isoDia = d => `${year}-${pad(month + 1)}-${pad(d)}`;
  const personasActivas = personas.filter(p => p.estado !== "Inactivo");
  const nuevo = fecha => ({ id: `a${Date.now()}`, titulo: "", inicio: fecha, fin: fecha, unDia: true, funcionarios: [], lugar: "", observaciones: "", viatico: false });
  const enDia = (a, iso) => iso >= a.inicio && iso <= (a.fin || a.inicio);
  const actividadesDia = d => actividadesPlan.filter(a => enDia(a, isoDia(d))).sort((a, b) => a.inicio.localeCompare(b.inicio) || a.titulo.localeCompare(b.titulo));
  const guardar = act => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : (act.fin || act.inicio) };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan(prev => prev.some(a => a.id === normal.id) ? prev.map(a => a.id === normal.id ? normal : a) : [...prev, normal]);
    setModal(null);
  };
  const eliminar = id => { setActividadesPlan(prev => prev.filter(a => a.id !== id)); setModal(null); };
  const turnoEnDia = d => personasActivas.filter(p => esRolActivo(codigoRolFuncionario(personas, roleData, year, month, p.nombre, d))).length;
  return <Card title={`Planificación general — ${meses[month]} ${year}`} icon="🗓️" action={<button onClick={() => setModal(nuevo(isoDia(Math.min(new Date().getDate(), dim(year, month)))))} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">+ Agregar actividad</button>}><div className="mb-4 flex flex-wrap gap-2"><Badge className="border-emerald-300 bg-emerald-100 text-emerald-950">Actividad programada</Badge><Badge className="border-orange-300 bg-orange-100 text-orange-950">Requiere adelanto de viático</Badge><Badge className="border-slate-300 bg-slate-100 text-slate-900">Fin de semana</Badge><Badge className="border-slate-300 bg-slate-100 text-slate-600">👥 = en turno</Badge></div><div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm"><div className="grid grid-cols-7 bg-slate-900 text-white">{diasLargos.map(d => <div key={d} className="border-r border-white/10 px-2 py-2 text-center text-[11px] font-semibold tracking-wider">{d}</div>)}</div><div className="grid grid-cols-7 bg-slate-200">{blanks.map(b => <div key={b} className="min-h-[174px] border-b border-r border-slate-300 bg-slate-100" />)}{days.map(d => { const dow = new Date(year, month, d).getDay(); const items = actividadesDia(d); const turno = turnoEnDia(d); return <div key={d} className={`min-h-[174px] border-b border-r border-slate-300 p-2 ${dow === 0 || dow === 6 ? "bg-slate-100" : "bg-white"}`}><div className="mb-2 flex items-start justify-between gap-1"><button onClick={() => setModal(nuevo(isoDia(d)))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800">{d}</button><div className="flex flex-col items-end gap-0.5">{turno > 0 && <span className="rounded-full bg-slate-600 px-1.5 py-0.5 text-[9px] font-semibold text-white" title={`${turno} funcionarios en turno`}>👥 {turno}</span>}{items.length > 0 && <span className="rounded-full bg-emerald-800 px-1.5 py-0.5 text-[9px] font-bold text-white" title={`${items.length} actividades`}>{items.length} act.</span>}</div></div><div className="space-y-1.5">{items.map(a => { const conf = conflictosActividadDia(a, d, year, month, personas, roleData); return <button key={a.id} onClick={() => setModal({ ...a })} className={`w-full rounded-xl border px-2 py-1.5 text-left shadow-sm transition hover:brightness-95 ${conf.length ? "border-red-500 bg-red-50 text-red-950 ring-2 ring-red-500" : a.viatico ? "border-orange-300 bg-orange-50 text-orange-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}><div className="line-clamp-2 text-[11px] font-semibold leading-tight">{a.titulo}</div><div className="mt-1 text-[10px] font-bold opacity-80">{a.funcionarios.length ? a.funcionarios.slice(0, 3).join(", ") : "Sin funcionarios"}{a.funcionarios.length > 3 ? ` +${a.funcionarios.length - 3}` : ""}</div>{a.lugar && <div className="mt-0.5 text-[10px] font-bold opacity-70">📍 {a.lugar}</div>}{a.viatico && <div className="mt-1 inline-flex rounded-md bg-orange-200 px-1.5 py-0.5 text-[9px] font-bold text-orange-950">VIÁTICO</div>}{conf.length > 0 && <div className="mt-1 rounded-md bg-red-700 px-1.5 py-0.5 text-[9px] font-bold text-white">⚠ ROL: {conf.join(", ")}</div>}</button>; })}</div></div>; })}</div></div>{modal && <ModalActividad valor={modal} personas={personasActivas} cerrar={() => setModal(null)} guardar={guardar} eliminar={eliminar} actividadesPlan={actividadesPlan} />}</Card>;
}

function ModalActividad({ valor, personas, cerrar, guardar, eliminar, actividadesPlan = [] }) {
  const [a, setA] = useState(valor);
  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const cls = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";
  const porPuesto = opcionesPuestoOperativo.map(puesto => ({ puesto, items: personas.filter(p => p.puestoOperativo === puesto) }));
  const lugarModo = opcionesLugarActividad.includes(a.lugar) ? a.lugar : "Otro";
  const esExistente = actividadesPlan.some(x => x.id === a.id);
  const finActividad = a.unDia ? a.inicio : (a.fin || a.inicio);
  const traslapa = (x) => x.id !== a.id && x.inicio <= finActividad && (x.fin || x.inicio) >= a.inicio;
  const actividadesFuncionario = nombre => actividadesPlan.filter(x => traslapa(x) && (x.funcionarios || []).includes(nombre));
  const agregarFuncionario = nombre => {
    if (!a.funcionarios.includes(nombre)) set("funcionarios", [...a.funcionarios, nombre]);
  };
  const quitarFuncionario = nombre => set("funcionarios", a.funcionarios.filter(x => x !== nombre));
  const toggleFuncionario = nombre => a.funcionarios.includes(nombre) ? quitarFuncionario(nombre) : agregarFuncionario(nombre);
  const modificarActividadExistente = act => setA({ ...act });
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"><div className="max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"><div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5"><div><h3 className="text-lg font-semibold">{esExistente ? "Editar actividad" : "Agregar actividad"}</h3><p className="text-sm text-slate-600">Registre actividad, periodo, lugar, funcionarios participantes y necesidad de adelanto de viático.</p></div><button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button></div><div className="max-h-[72vh] overflow-y-auto p-5"><div className="grid gap-4 md:grid-cols-2"><label className="md:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Actividad</span><div className="grid gap-2 md:grid-cols-[260px_1fr]"><select className={cls} value={a.titulo === actividadRutinariaVisitantes ? actividadRutinariaVisitantes : "Otra"} onChange={e => set("titulo", e.target.value === "Otra" ? "" : e.target.value)}>{opcionesActividadBase.map(x => <option key={x} value={x}>{x}</option>)}<option value="Otra">Otra actividad</option></select><input className={cls} value={a.titulo} onChange={e => set("titulo", e.target.value)} placeholder="O escriba otra actividad: patrullaje, inspección, reunión, mantenimiento..." /></div></label><label><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Fecha inicio</span><input type="date" className={cls} value={a.inicio} onChange={e => set("inicio", e.target.value)} /></label><label><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Fecha final</span><input type="date" className={cls} value={a.unDia ? a.inicio : a.fin} disabled={a.unDia} onChange={e => set("fin", e.target.value)} /></label><label className="flex items-center gap-2 rounded-xl border border-slate-300 p-3 text-sm font-semibold"><input type="checkbox" checked={a.unDia} onChange={e => setA(p => ({ ...p, unDia: e.target.checked, fin: e.target.checked ? p.inicio : p.fin }))} />Actividad de un solo día</label><label className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 p-3 text-sm font-semibold text-orange-950"><input type="checkbox" checked={a.viatico} onChange={e => set("viatico", e.target.checked)} />Requiere tramitar adelanto de viático</label><label className="md:col-span-2"><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Lugar</span><div className="grid gap-2"><select className={cls} value={lugarModo} onChange={e => set("lugar", e.target.value === "Otro" ? "" : e.target.value)}>{opcionesLugarActividad.map(x => <option key={x} value={x}>{x}</option>)}<option value="Otro">Otro</option></select>{lugarModo === "Otro" && <input className={cls} value={a.lugar} onChange={e => set("lugar", e.target.value)} placeholder="Escriba otro lugar: sector, sendero, oficina, comunidad..." />}</div></label></div><div className="mt-5"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Funcionarios participantes</span><Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">{a.funcionarios.length} seleccionados</Badge></div><div className="grid gap-3 md:grid-cols-3">{porPuesto.map(g => <div key={g.puesto} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{g.puesto}</div><div className="space-y-1.5">{g.items.map(f => { const avisos = actividadesFuncionario(f.nombre); const seleccionado = a.funcionarios.includes(f.nombre); return <div key={f.id} className={`rounded-xl border px-2 py-2 text-xs font-bold ${seleccionado ? "border-emerald-300 bg-emerald-100 text-emerald-950" : avisos.length ? "border-yellow-300 bg-yellow-50 text-yellow-950" : "border-slate-200 bg-white text-slate-700"}`}><label className="flex items-center gap-2"><input type="checkbox" checked={seleccionado} onChange={() => toggleFuncionario(f.nombre)} />{f.nombre}</label>{avisos.length > 0 && <div className="mt-2 rounded-lg border border-yellow-300 bg-yellow-100 p-2 text-[11px] leading-snug text-yellow-950"><div className="font-black">Funcionario con actividad ya planificada</div><div className="mt-1 font-bold">{avisos.map(x => x.titulo).join(" · ")}</div><div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => agregarFuncionario(f.nombre)} className="rounded-lg bg-yellow-700 px-2 py-1 text-[10px] font-bold text-white hover:bg-yellow-800">Agregar de todos modos</button><button type="button" onClick={() => modificarActividadExistente(avisos[0])} className="rounded-lg border border-yellow-700 bg-white px-2 py-1 text-[10px] font-bold text-yellow-900 hover:bg-yellow-50">Modificar actividad</button></div></div>}</div>; })}</div></div>)}</div></div><label className="mt-5 block"><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Observaciones</span><textarea className={`${cls} min-h-24`} value={a.observaciones} onChange={e => set("observaciones", e.target.value)} placeholder="Detalle operativo, coordinación, expediente, requerimientos, vehículo, equipo, etc." /></label></div><div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 bg-slate-50 p-4"><div>{esExistente && <button onClick={() => eliminar(a.id)} className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50">Eliminar</button>}</div><div className="flex gap-2"><button onClick={cerrar} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancelar</button><button onClick={() => guardar(a)} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Guardar actividad</button></div></div></div></div>;
}

function PlanificacionFuncionario({ year, month, setMonth, setYear, personas, actividadesPlan, setActividadesPlan, roleData, setRoleData }) {
  const [asignar, setAsignar] = useState(null);
  const [modalActividad, setModalActividad] = useState(null);
  const [modalRol, setModalRol] = useState(null);
  const [abiertos, setAbiertos] = useState({});
  const days = Array.from({ length: dim(year, month) }, (_, i) => i + 1);
  const personasActivas = personas.filter(p => p.estado !== "Inactivo");
  const guardar = act => {
    if (!act.titulo.trim()) return;
    const normal = { ...act, fin: act.unDia ? act.inicio : (act.fin || act.inicio) };
    if (normal.fin < normal.inicio) normal.fin = normal.inicio;
    setActividadesPlan(prev => prev.some(a => a.id === normal.id) ? prev.map(a => a.id === normal.id ? normal : a) : [...prev, normal]);
    setModalActividad(null);
    setAsignar(null);
  };
  const eliminar = id => { setActividadesPlan(prev => prev.filter(a => a.id !== id)); setModalActividad(null); };
  const nuevaActividad = (nombre, iso) => ({ id: `a${Date.now()}`, titulo: "", inicio: iso, fin: iso, unDia: true, funcionarios: [nombre], lugar: funcionarioPorNombre(personas, nombre)?.puestoOperativo || "", observaciones: "", viatico: false });
  const agregarAExistente = (actividadId, nombre) => {
    setActividadesPlan(prev => prev.map(a => a.id === actividadId ? { ...a, funcionarios: a.funcionarios.includes(nombre) ? a.funcionarios : [...a.funcionarios, nombre] } : a));
    setAsignar(null);
  };
  const moverMesLocal = paso => {
    let nuevoMes = month + paso;
    let nuevoAno = year;
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAno -= 1; }
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAno += 1; }
    setMonth(nuevoMes);
    setYear(nuevoAno);
  };
  const expandirTodo = () => setAbiertos(Object.fromEntries(personasActivas.map(p => [p.id, true])));
  const colapsarTodo = () => setAbiertos({});
  const filasFuncionario = p => days.map(d => {
    const iso = isoFecha(year, month, d);
    const rol = codigoRolFuncionario(personas, roleData, year, month, p.nombre, d);
    const turno = esRolActivo(rol);
    const acts = actividadesEnDia(actividadesPlan, iso).filter(a => (a.funcionarios || []).includes(p.nombre));
    const visible = turno || acts.length > 0;
    const conflicto = acts.length > 0 && !turno;
    return visible ? { d, iso, rol, turno, acts, conflicto } : null;
  }).filter(Boolean);
  const aplicarRol = ({ funcionario, dia, categoria }) => {
    const p = funcionarioPorNombre(personas, funcionario);
    if (!p) return;
    const puesto = p.puestoOperativo || "Puesto Quetzales";
    const modalidad = modalidadFuncionario(personas, roleData, year, month, funcionario);
    const categorias = {};
    days.forEach(d => { categorias[d] = categoriaDe(codigoRolFuncionario(personas, roleData, year, month, funcionario, d)); });
    categorias[dia] = categoria;
    const cambios = {};
    let anterior = null;
    let consecutivo = 0;
    days.forEach(d => {
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
    setRoleData(prev => ({ ...prev, ...cambios }));
    setModalRol(null);
  };
  return <section className="space-y-4"><Card title={`Planificación/Funcionario — ${meses[month]} ${year}`} icon="📋" action={<div className="flex flex-wrap items-center gap-2"><button onClick={() => moverMesLocal(-1)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">←</button><select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold" value={month} onChange={e => setMonth(Number(e.target.value))}>{meses.map((m, i) => <option key={m} value={i}>{m}</option>)}</select><select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold" value={year} onChange={e => setYear(Number(e.target.value))}>{[2025, 2026, 2027, 2028, 2029].map(y => <option key={y}>{y}</option>)}</select><button onClick={() => moverMesLocal(1)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">→</button><button onClick={expandirTodo} className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">Expandir</button><button onClick={colapsarTodo} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700">Colapsar</button></div>}><div className="mb-4 flex flex-wrap gap-2"><Badge className="border-emerald-300 bg-emerald-100 text-emerald-950">Turno con actividad</Badge><Badge className="border-yellow-300 bg-yellow-100 text-yellow-950">Falta asignar actividad</Badge><Badge className="border-red-400 bg-red-100 text-red-950">Actividad no coincide con rol</Badge></div><div className="space-y-3">{personasActivas.map(p => { const filas = filasFuncionario(p); const faltantes = filas.filter(f => f.turno && !f.acts.length).length; const conflictos = filas.filter(f => f.conflicto).length; const actividadesAsignadas = filas.reduce((acc, f) => acc + f.acts.length, 0); const abierto = !!abiertos[p.id]; return <div key={p.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${conflictos ? "border-red-300 ring-2 ring-red-200" : "border-slate-200"}`}><button onClick={() => setAbiertos(prev => ({ ...prev, [p.id]: !prev[p.id] }))} className="flex w-full flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 text-left md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><Avatar name={p.nombre} /><div><div className="font-semibold">{p.nombre}</div><div className="text-xs font-bold text-slate-500">{p.puestoOperativo} · {p.puesto}</div></div></div><div className="flex flex-wrap items-center gap-2"><Badge className="border-slate-200 bg-white text-slate-700">{filas.length} días visibles</Badge><Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">{actividadesAsignadas} actividades</Badge>{faltantes > 0 && <Badge className="border-yellow-300 bg-yellow-100 text-yellow-950">{faltantes} sin asignar</Badge>}{conflictos > 0 && <Badge className="border-red-300 bg-red-100 text-red-950">{conflictos} conflictos</Badge>}<span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-bold text-white">{abierto ? "Ocultar" : "Ver"}</span></div></button>{abierto && <div className="divide-y divide-slate-100">{filas.map(f => <div key={`${p.id}-${f.d}`} className={`grid gap-3 p-3 md:grid-cols-[110px_80px_1fr_auto] md:items-center ${f.conflicto ? "bg-red-50" : f.turno && !f.acts.length ? "bg-yellow-50" : "bg-white"}`}><div className="text-sm font-semibold">{fecha(f.iso)}</div><Badge className={f.conflicto ? "border-red-300 bg-red-100 text-red-950" : f.turno ? "border-emerald-300 bg-emerald-100 text-emerald-950" : "border-slate-300 bg-slate-100 text-slate-700"}>{f.rol || "—"}</Badge><div className="space-y-1">{f.acts.length ? f.acts.map(a => <button key={a.id} onClick={() => setModalActividad({ ...a })} className={`block w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold ${f.conflicto ? "border-red-300 bg-white text-red-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>{a.titulo}<span className="ml-2 text-xs font-bold opacity-70">{a.lugar || "Sin lugar"}</span>{f.conflicto && <span className="ml-2 rounded-md bg-red-700 px-1.5 py-0.5 text-[10px] text-white">NO COINCIDE CON ROL</span>}</button>) : <div className="rounded-xl border border-yellow-300 bg-yellow-100 px-3 py-2 text-sm font-semibold text-yellow-950">Falta asignar actividad</div>}</div><div className="flex flex-wrap justify-end gap-2">{f.conflicto ? <><button onClick={() => setModalActividad({ ...f.acts[0] })} className="rounded-xl bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800">Modificar actividad</button><button onClick={() => setModalRol({ funcionario: p.nombre, dia: f.d, iso: f.iso, rol: f.rol })} className="rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-50">Modificar rol</button></> : f.turno && !f.acts.length ? <button onClick={() => setAsignar({ funcionario: p.nombre, iso: f.iso })} className="rounded-xl bg-yellow-600 px-3 py-2 text-xs font-bold text-white hover:bg-yellow-700">Asignar</button> : <button onClick={() => setModalActividad(nuevaActividad(p.nombre, f.iso))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Nueva</button>}</div></div>)}</div>}</div>; })}</div>{asignar && <AsignarActividadModal data={asignar} actividadesPlan={actividadesPlan} cerrar={() => setAsignar(null)} crear={() => setModalActividad(nuevaActividad(asignar.funcionario, asignar.iso))} agregar={agregarAExistente} />}{modalActividad && <ModalActividad valor={modalActividad} personas={personasActivas} cerrar={() => setModalActividad(null)} guardar={guardar} eliminar={eliminar} actividadesPlan={actividadesPlan} />}{modalRol && <ModificarRolModal data={modalRol} cerrar={() => setModalRol(null)} aplicar={aplicarRol} />}</Card></section>;
}

function ModificarRolModal({ data, cerrar, aplicar }) {
  const opciones = [["T", "Turno", "border-emerald-300 bg-emerald-100 text-emerald-950"], ["L", "Libre", "border-amber-300 bg-amber-100 text-amber-950"], ["V", "Vacaciones", "border-sky-300 bg-sky-100 text-sky-950"], ["I", "Incapacidad", "border-rose-300 bg-rose-100 text-rose-950"], ["O", "Otro", "border-violet-300 bg-violet-100 text-violet-950"]];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4"><div className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl"><div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">Modificar rol</h3><p className="text-sm text-slate-600">{data.funcionario} · {fecha(data.iso)} · rol actual: <strong>{data.rol || "—"}</strong></p></div><button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button></div><div className="grid gap-2 sm:grid-cols-2">{opciones.map(([cat, label, cls]) => <button key={cat} onClick={() => aplicar({ ...data, categoria: cat })} className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold shadow-sm hover:brightness-95 ${cls}`}>{label}<span className="mt-1 block text-xs opacity-75">Recalcula consecutivos de la fila</span></button>)}</div><button onClick={() => aplicar({ ...data, categoria: "" })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Limpiar rol del día</button></div></div>;
}

function AsignarActividadModal({ data, actividadesPlan, cerrar, crear, agregar }) {
  const existentes = actividadesEnDia(actividadesPlan, data.iso).filter(a => !(a.funcionarios || []).includes(data.funcionario));
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4"><div className="w-full max-w-2xl rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl"><div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">Asignar actividad</h3><p className="text-sm text-slate-600">{data.funcionario} · {fecha(data.iso)}</p></div><button onClick={cerrar} className="rounded-xl px-3 py-2 font-semibold hover:bg-slate-100">✕</button></div><button onClick={crear} className="mb-4 w-full rounded-2xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Crear actividad nueva para este funcionario</button><div className="text-xs font-bold uppercase tracking-wider text-slate-500">Agregar a actividad existente del mismo día</div><div className="mt-2 space-y-2">{existentes.length ? existentes.map(a => <button key={a.id} onClick={() => agregar(a.id, data.funcionario)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold hover:bg-slate-100"><div>{a.titulo}</div><div className="mt-1 text-xs font-bold text-slate-500">{a.lugar || "Sin lugar"} · {(a.funcionarios || []).join(", ") || "Sin funcionarios"}</div></button>) : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">No hay actividades existentes ese día para otros funcionarios.</div>}</div></div></div>;
}

function AdelantoViaticos({ actividadesPlan, personas }) {
  const [vista, setVista] = useState("funcionario");
  const hoy = new Date();
  const mesObjetivo = hoy.getMonth() === 11 ? 0 : hoy.getMonth() + 1;
  const anoObjetivo = hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const plazoAbierto = hoy.getDate() <= 15;
  const pad = n => String(n).padStart(2, "0");
  const inicioMes = `${anoObjetivo}-${pad(mesObjetivo + 1)}-01`;
  const finMes = `${anoObjetivo}-${pad(mesObjetivo + 1)}-${pad(dim(anoObjetivo, mesObjetivo))}`;
  const actividades = actividadesPlan
    .filter(a => a.viatico && (a.inicio <= finMes) && ((a.fin || a.inicio) >= inicioMes))
    .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.titulo.localeCompare(b.titulo));
  const nombreMes = `${meses[mesObjetivo]} ${anoObjetivo}`;
  const registrosFuncionario = personas
    .filter(p => actividades.some(a => a.funcionarios.includes(p.nombre)))
    .map(p => ({ funcionario: p, actividades: actividades.filter(a => a.funcionarios.includes(p.nombre)) }))
    .sort((a, b) => a.funcionario.nombre.localeCompare(b.funcionario.nombre));
  const rango = a => a.inicio === (a.fin || a.inicio) ? fecha(a.inicio) : `${fecha(a.inicio)} al ${fecha(a.fin)}`;
  return <section className="space-y-4"><Card title={`Adelanto de viáticos — actividades de ${nombreMes}`} icon="💵" action={<div className="flex flex-wrap gap-2"><button onClick={() => setVista("funcionario")} className={`rounded-xl border px-3 py-2 text-xs font-bold ${vista === "funcionario" ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700"}`}>Por funcionario</button><button onClick={() => setVista("actividad")} className={`rounded-xl border px-3 py-2 text-xs font-bold ${vista === "actividad" ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700"}`}>Por actividad</button></div>}><div className={`mb-4 rounded-2xl border p-4 text-sm ${plazoAbierto ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-red-200 bg-red-50 text-red-950"}`}>{plazoAbierto ? <><strong>Plazo abierto.</strong> Este listado corresponde al mes siguiente y puede usarse para tramitar adelantos hasta el día 15 del mes anterior.</> : <><strong>Clausurado el tiempo de trámite de adelantos del próximo mes.</strong> El listado queda disponible para consulta, pero el plazo ordinario de trámite venció el día 15 del mes anterior.</>}<div className="mt-1 text-xs font-bold opacity-80">Mes a tramitar: {nombreMes}. Corte administrativo: día 15 del mes anterior.</div></div>{actividades.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">No hay actividades del mes siguiente marcadas como “requiere tramitar adelanto de viático”.</div> : vista === "funcionario" ? <div className="grid gap-3 xl:grid-cols-2">{registrosFuncionario.map(({ funcionario, actividades }) => <div key={funcionario.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-3"><Avatar name={funcionario.nombre} /><div className="min-w-0 flex-1"><div className="font-semibold">{funcionario.nombre}</div><div className="text-xs font-bold text-slate-500">{funcionario.puestoOperativo} · {funcionario.puesto}</div></div><Badge className="border-orange-200 bg-orange-100 text-orange-900">{actividades.length}</Badge></div><div className="space-y-2">{actividades.map(a => <div key={a.id} className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-orange-950"><div className="text-sm font-semibold">{a.titulo}</div><div className="mt-1 text-xs font-bold">{rango(a)} · {a.lugar || "Sin lugar"}</div>{a.observaciones && <div className="mt-1 text-xs opacity-80">{a.observaciones}</div>}</div>)}</div></div>)}</div> : <div className="space-y-3">{actividades.map(a => <div key={a.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-950 shadow-sm"><div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><div className="text-base font-semibold">{a.titulo}</div><div className="mt-1 text-sm font-bold">{rango(a)} · {a.lugar || "Sin lugar"}</div></div><Badge className="border-orange-300 bg-orange-200 text-orange-950">{a.funcionarios.length} funcionarios</Badge></div><div className="mt-3 flex flex-wrap gap-2">{a.funcionarios.map(n => <span key={n} className="rounded-full border border-orange-300 bg-white px-3 py-1 text-xs font-bold text-orange-950">{n}</span>)}</div>{a.observaciones && <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs font-bold opacity-90">{a.observaciones}</div>}</div>)}</div>}</Card></section>;
}

function Disponibilidad({ personas }) { const con = personas.filter(f => f.disponibilidad); const sin = personas.filter(f => !f.disponibilidad); const lista = arr => <div className="divide-y divide-slate-200">{arr.map(f => { const d = faltan(f.vencimiento); return <div key={f.id} className="flex items-center gap-3 py-3"><Avatar name={f.nombre} /><div className="min-w-0 flex-1"><div className="font-semibold">{f.nombre}</div><div className="text-xs text-slate-500">{f.contrato || f.puesto} · {f.vencimiento ? `vence ${fecha(f.vencimiento)}` : f.condicion}</div></div><Badge className={d !== null && d <= 60 ? "border-orange-200 bg-orange-100 text-orange-900" : "border-slate-200 bg-slate-100 text-slate-700"}>{d === null ? "Sin contrato" : `${d} días`}</Badge></div>; })}</div>; return <section className="grid gap-4 xl:grid-cols-2"><Card title="Contratos activos — disponibilidad" icon="🛡️" action={<Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">{con.length}</Badge>}>{lista(con)}<div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><strong>Control:</strong> la herramienta alerta; no ejecuta suspensiones automáticamente.</div></Card><Card title="Sin disponibilidad asignada" icon="🛡️" action={<Badge className="border-slate-200 bg-slate-100 text-slate-700">{sin.length}</Badge>}>{lista(sin)}</Card></section>; }
function Alertas({ alerts }) { return <section className="space-y-4"><Card title={`Alertas del sistema (${alerts.length})`} icon="🔔" action={<Badge className="border-orange-200 bg-orange-100 text-orange-900">Requiere revisión</Badge>}><div className="space-y-2">{alerts.map((a, i) => <AlertItem key={i} a={a} />)}</div></Card><Card title="Semáforo normativo" icon="🚦"><div className="grid gap-3 md:grid-cols-5">{[["🟢", "Verificado"], ["🟡", "Confirmación interna"], ["🟠", "Criterio RH/Jurídico"], ["🔴", "No automatizar"], ["🔵", "Dato pendiente"]].map(([s, t]) => <div key={t} className="rounded-xl bg-slate-50 p-3"><div className="text-xl">{s}</div><div className="mt-1 text-sm font-semibold">{t}</div></div>)}</div></Card></section>; }

export default function App() {
  const [view, setView] = useState("dashboard");
  const [personas, setPersonas] = useState(baseFuncionarios);
  const [month, setMonth] = useState(4);
  const [year, setYear] = useState(2026);
  const [compact, setCompact] = useState(false);
  const [roleData, setRoleData] = useState({});
  const [actividadesPlan, setActividadesPlan] = useState(baseActividadesPlan);
  const alerts = useMemo(() => alertas(personas), [personas]);
  const nAlertas = alerts.filter(a => a.t === "danger" || a.t === "warn").length;
  return <div className="min-h-screen bg-slate-100 text-slate-950"><div className="flex min-h-screen"><Sidebar view={view} setView={setView} nAlertas={nAlertas} /><main className="min-w-0 flex-1"><Topbar view={view} setView={setView} month={month} setMonth={setMonth} year={year} setYear={setYear} compact={compact} setCompact={setCompact} /><div className="space-y-5 p-4 pb-24 lg:p-6 lg:pb-6">{view === "dashboard" && <Dashboard personas={personas} alerts={alerts} setView={setView} actividadesPlan={actividadesPlan} setActividadesPlan={setActividadesPlan} roleData={roleData} month={month} year={year} />}{view === "funcionarios" && <Funcionarios personas={personas} setPersonas={setPersonas} />}{view === "roles" && <Roles year={year} month={month} compact={compact} roleData={roleData} setRoleData={setRoleData} personas={personas} actividadesPlan={actividadesPlan} setActividadesPlan={setActividadesPlan} />}{view === "planificacion" && <Planificacion year={year} month={month} personas={personas} actividadesPlan={actividadesPlan} setActividadesPlan={setActividadesPlan} roleData={roleData} />}{view === "planFuncionario" && <PlanificacionFuncionario year={year} month={month} setMonth={setMonth} setYear={setYear} personas={personas} actividadesPlan={actividadesPlan} setActividadesPlan={setActividadesPlan} roleData={roleData} setRoleData={setRoleData} />}{view === "adelantos" && <AdelantoViaticos actividadesPlan={actividadesPlan} personas={personas} />}{view === "disponibilidad" && <Disponibilidad personas={personas} />}{view === "alertas" && <Alertas alerts={alerts} />}</div></main></div><BottomNav view={view} setView={setView} nAlertas={nAlertas} /></div>;
}
