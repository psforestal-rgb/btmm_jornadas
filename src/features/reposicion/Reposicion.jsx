import { useMemo, useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import Icon from "../../ui/Icon.jsx";
import EmptyState from "../../ui/EmptyState.jsx";
import { fecha } from "../../domain/fechas.js";
import {
  resumenReposiciones,
  ordenarPorFecha,
  estadoReposicion,
  saldoHoras,
  cuotasDe,
  siguienteFolio,
  historialPorFuncionario,
  HORAS_JORNADA_DEFAULT,
} from "../../domain/reposicion.js";
import { useApp } from "../../context/AppContext.jsx";
import { useT } from "../../i18n/useT.js";
import { magnitudLabel, saldoTexto } from "./etiquetas.js";
import ModalReposicion from "./ModalReposicion.jsx";
import ModalReponer from "./ModalReponer.jsx";
import HistorialFuncionario from "./HistorialFuncionario.jsx";

// Fecha de hoy (ISO) para prellenar registros.
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

const ESTADO_CLS = {
  Pendiente: "border-amber-300 bg-amber-100 text-amber-900",
  Parcial: "border-indigo-300 bg-indigo-100 text-indigo-900",
  Repuesto: "border-emerald-200 bg-emerald-100 text-emerald-900",
};

export default function Reposicion({ personas, reposiciones, setReposiciones }) {
  const t = useT();
  const { reglas } = useApp();
  const hj = reglas?.horasJornada ?? HORAS_JORNADA_DEFAULT;
  const [modal, setModal] = useState(null);
  const [reponer, setReponer] = useState(null);
  const [borrar, setBorrar] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [tab, setTab] = useState("registros");

  const resumen = useMemo(() => resumenReposiciones(reposiciones, hj), [reposiciones, hj]);
  const historial = useMemo(() => historialPorFuncionario(reposiciones, hj), [reposiciones, hj]);

  const filtrados = useMemo(() => {
    const base = ordenarPorFecha(reposiciones);
    if (filtro === "pendientes") return base.filter((r) => saldoHoras(r, hj) > 0);
    if (filtro === "repuestos") return base.filter((r) => saldoHoras(r, hj) <= 0);
    return base;
  }, [reposiciones, filtro, hj]);

  const nuevo = () => ({
    id: `rep${Date.now()}`,
    folio: siguienteFolio(reposiciones),
    funcionario: "",
    fecha: hoyISO(),
    tipoDia: "Día libre",
    motivo: "Emergencia",
    motivoDetalle: "",
    magnitud: "diaEntero",
    horas: 0,
    cuotas: [],
    observaciones: "",
  });

  const guardar = (obj) => {
    if (!obj.funcionario || !obj.fecha) return;
    setReposiciones((prev) =>
      prev.some((x) => x.id === obj.id) ? prev.map((x) => (x.id === obj.id ? obj : x)) : [obj, ...prev],
    );
    setModal(null);
  };

  // Aplica una cuota de reposición al registro (desde ModalReponer).
  const guardarCuota = (obj) => {
    setReposiciones((prev) => prev.map((x) => (x.id === obj.id ? obj : x)));
    setReponer(null);
  };

  // Revierte la reposición: limpia las cuotas (vuelve a pendiente).
  const reabrir = (id) =>
    setReposiciones((prev) => prev.map((x) => (x.id === id ? { ...x, cuotas: [] } : x)));

  const filtros = [
    ["todos", t("reposicion.filtroTodos"), resumen.total],
    ["pendientes", t("reposicion.filtroPendientes"), resumen.pendientes],
    ["repuestos", t("reposicion.filtroRepuestos"), resumen.repuestos],
  ];

  return (
    <section className="space-y-4">
      {/* Resumen */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("reposicion.resumen.total")}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{resumen.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            {t("reposicion.resumen.pendientes")}
          </p>
          <p className="mt-1 text-3xl font-semibold text-amber-950">{resumen.pendientes}</p>
          <p className="mt-1 text-xs font-semibold text-amber-800">
            {t("reposicion.resumen.saldo", { saldo: saldoTexto(resumen.saldoHoras, hj) })}
            {resumen.parciales > 0 ? ` · ${t("reposicion.resumen.parciales", { n: resumen.parciales })}` : ""}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            {t("reposicion.resumen.repuestos")}
          </p>
          <p className="mt-1 text-3xl font-semibold text-emerald-950">{resumen.repuestos}</p>
        </div>
      </div>

      <Card
        title={t("reposicion.titulo")}
        icon="⟳"
        action={
          <button
            onClick={() => setModal(nuevo())}
            className="inline-flex min-h-touch items-center gap-1 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Icon name="plus" size={16} />
            <span className="hidden sm:inline">{t("reposicion.agregar")}</span>
            <span className="sm:hidden">{t("reposicion.agregarCorto")}</span>
          </button>
        }
      >
        <p className="mb-4 text-sm text-slate-600">{t("reposicion.subtitulo")}</p>

        <div role="tablist" aria-label={t("reposicion.tabsAria")} className="mb-4 inline-flex overflow-hidden rounded-xl border border-slate-300 bg-white">
          {[
            ["registros", t("reposicion.tabRegistros")],
            ["historial", t("reposicion.tabHistorial")],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-touch px-4 py-2 text-xs font-bold ${
                tab === id ? "bg-emerald-800 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "historial" ? (
          <HistorialFuncionario historial={historial} hj={hj} />
        ) : (
        <>
        <div className="mb-4 flex flex-wrap gap-2">
          {filtros.map(([id, label, n]) => (
            <button
              key={id}
              onClick={() => setFiltro(id)}
              className={`rounded-full border px-3 py-2 text-xs font-bold ${
                filtro === id ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {label} · {n}
            </button>
          ))}
        </div>

        {reposiciones.length === 0 ? (
          <EmptyState
            icon="refresh"
            title={t("reposicion.sinRegistrosTitulo")}
            description={t("reposicion.sinRegistrosDesc")}
          />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon="search"
            title={t("reposicion.sinResultadosTitulo")}
            description={t("reposicion.sinResultadosDesc")}
          />
        ) : (
          <div className="overflow-auto rounded-xl border border-slate-300">
            <table className="min-w-[940px] w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3">{t("reposicion.th.folio")}</th>
                  <th className="p-3">{t("reposicion.th.funcionario")}</th>
                  <th className="p-3">{t("reposicion.th.fecha")}</th>
                  <th className="p-3">{t("reposicion.th.tipoDia")}</th>
                  <th className="p-3">{t("reposicion.th.motivo")}</th>
                  <th className="p-3">{t("reposicion.th.tiempo")}</th>
                  <th className="p-3">{t("reposicion.th.estado")}</th>
                  <th className="p-3 text-right">{t("reposicion.th.acciones")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtrados.map((r) => {
                  const est = estadoReposicion(r, hj);
                  const saldo = saldoHoras(r, hj);
                  const cuotas = cuotasDe(r);
                  return (
                  <tr key={r.id} className="hover:bg-slate-50 align-top">
                    <td className="p-3 whitespace-nowrap">
                      <Badge className="border-slate-300 bg-white font-mono text-slate-700">{r.folio || "—"}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.funcionario || "—"} />
                        <div className="font-semibold">{r.funcionario || "—"}</div>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">{fecha(r.fecha)}</td>
                    <td className="p-3">
                      <Badge className="border-slate-200 bg-slate-100 text-slate-700">{r.tipoDia}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{r.motivo}</div>
                      {r.motivoDetalle && <div className="mt-0.5 text-xs text-slate-500">{r.motivoDetalle}</div>}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <Badge className="border-blue-200 bg-blue-100 text-blue-900">{magnitudLabel(r, t)}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={ESTADO_CLS[est]}>
                        {t(`reposicion.estado.${est}`)}
                      </Badge>
                      {saldo > 0 ? (
                        <div className="mt-1 text-xs font-semibold text-amber-800">
                          {t("reposicion.saldoLabel", { saldo: saldoTexto(saldo, hj) })}
                        </div>
                      ) : (
                        cuotas.length > 0 && (
                          <div className="mt-1 text-xs text-slate-500">
                            {t("reposicion.repuestoEl", { fecha: fecha(cuotas[cuotas.length - 1].fecha) })}
                          </div>
                        )
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {saldo > 0 && (
                        <button
                          onClick={() => setReponer(r)}
                          className="rounded-lg px-2 py-1 font-semibold text-emerald-800 hover:bg-emerald-50"
                        >
                          {t("reposicion.reponer")}
                        </button>
                      )}
                      {cuotas.length > 0 && (
                        <button
                          onClick={() => reabrir(r.id)}
                          className="rounded-lg px-2 py-1 font-semibold text-amber-800 hover:bg-amber-50"
                        >
                          {t("reposicion.reabrir")}
                        </button>
                      )}
                      <button
                        onClick={() => setModal({ ...r })}
                        className="rounded-lg px-2 py-1 font-semibold text-blue-800 hover:bg-blue-50"
                      >
                        {t("acciones.editar")}
                      </button>
                      <button
                        onClick={() => setBorrar(r.id)}
                        className="rounded-lg px-2 py-1 font-semibold text-red-800 hover:bg-red-50"
                      >
                        {t("acciones.eliminar")}
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </>
        )}

        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <strong>Control interno:</strong> {t("reposicion.nota")}
        </p>
      </Card>

      {modal && (
        <ModalReposicion
          valor={modal}
          personas={personas}
          reposiciones={reposiciones}
          hj={hj}
          cerrar={() => setModal(null)}
          guardar={guardar}
          eliminar={(id) => {
            setReposiciones((prev) => prev.filter((x) => x.id !== id));
            setModal(null);
          }}
        />
      )}

      {reponer && (
        <ModalReponer
          registro={reponer}
          hj={hj}
          cerrar={() => setReponer(null)}
          guardar={guardarCuota}
        />
      )}

      {borrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6">
            <h3 className="text-lg font-semibold text-red-900">{t("reposicion.eliminarTitulo")}</h3>
            <p className="mt-2 text-sm text-slate-700">{t("reposicion.eliminarConfirma")}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setBorrar(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold">
                {t("acciones.cancelar")}
              </button>
              <button
                onClick={() => {
                  setReposiciones((p) => p.filter((x) => x.id !== borrar));
                  setBorrar(null);
                }}
                className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
              >
                {t("acciones.eliminar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
