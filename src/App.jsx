import { useMemo } from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import { alertas } from "./domain/alertas.js";
import Sidebar from "./layout/Sidebar.jsx";
import Topbar from "./layout/Topbar.jsx";
import BottomNav from "./layout/BottomNav.jsx";
import Dashboard from "./features/dashboard/Dashboard.jsx";
import DashboardDia from "./features/dia/DashboardDia.jsx";
import Funcionarios from "./features/funcionarios/Funcionarios.jsx";
import Roles from "./features/roles/Roles.jsx";
import Planificacion from "./features/planificacion/Planificacion.jsx";
import PlanificacionFuncionario from "./features/planFuncionario/PlanificacionFuncionario.jsx";
import AdelantoViaticos from "./features/viaticos/AdelantoViaticos.jsx";
import Disponibilidad from "./features/disponibilidad/Disponibilidad.jsx";
import Alertas from "./features/alertas/Alertas.jsx";
import Datos from "./features/datos/Datos.jsx";
import Configuracion from "./features/configuracion/Configuracion.jsx";

function AppShell() {
  const {
    view,
    setView,
    personas,
    setPersonas,
    month,
    setMonth,
    year,
    setYear,
    compact,
    setCompact,
    roleData,
    setRoleData,
    actividadesPlan,
    setActividadesPlan,
    diaVista,
    setDiaVista,
    reglas,
  } = useApp();

  const alerts = useMemo(
    () => alertas(personas, { actividadesPlan, flags: reglas }),
    [personas, actividadesPlan, reglas],
  );
  const nAlertas = alerts.filter((a) => a.t === "danger" || a.t === "warn").length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar view={view} setView={setView} nAlertas={nAlertas} />
        <main className="min-w-0 flex-1">
          <Topbar
            view={view}
            setView={setView}
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
            compact={compact}
            setCompact={setCompact}
          />
          <div className="space-y-5 p-4 pb-24 lg:p-6 lg:pb-6">
            {view === "dashboard" && (
              <Dashboard
                personas={personas}
                alerts={alerts}
                setView={setView}
                actividadesPlan={actividadesPlan}
                setActividadesPlan={setActividadesPlan}
                roleData={roleData}
                month={month}
                year={year}
              />
            )}
            {view === "dia" && (
              <DashboardDia
                diaVista={diaVista}
                setDiaVista={setDiaVista}
                personas={personas}
                actividadesPlan={actividadesPlan}
                setActividadesPlan={setActividadesPlan}
                roleData={roleData}
              />
            )}
            {view === "funcionarios" && <Funcionarios personas={personas} setPersonas={setPersonas} />}
            {view === "roles" && (
              <Roles
                year={year}
                month={month}
                compact={compact}
                roleData={roleData}
                setRoleData={setRoleData}
                personas={personas}
                actividadesPlan={actividadesPlan}
                setActividadesPlan={setActividadesPlan}
              />
            )}
            {view === "planificacion" && (
              <Planificacion
                year={year}
                month={month}
                personas={personas}
                actividadesPlan={actividadesPlan}
                setActividadesPlan={setActividadesPlan}
                roleData={roleData}
                setView={setView}
                setDiaVista={setDiaVista}
              />
            )}
            {view === "planFuncionario" && (
              <PlanificacionFuncionario
                year={year}
                month={month}
                setMonth={setMonth}
                setYear={setYear}
                personas={personas}
                actividadesPlan={actividadesPlan}
                setActividadesPlan={setActividadesPlan}
                roleData={roleData}
                setRoleData={setRoleData}
              />
            )}
            {view === "adelantos" && <AdelantoViaticos actividadesPlan={actividadesPlan} personas={personas} />}
            {view === "disponibilidad" && <Disponibilidad personas={personas} />}
            {view === "alertas" && <Alertas alerts={alerts} />}
            {view === "datos" && <Datos />}
            {view === "configuracion" && <Configuracion />}
          </div>
        </main>
      </div>
      <BottomNav view={view} setView={setView} nAlertas={nAlertas} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
