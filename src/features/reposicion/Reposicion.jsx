import { useMemo, useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import Icon from "../../ui/Icon.jsx";
import EmptyState from "../../ui/EmptyState.jsx";
import { fecha } from "../../domain/fechas.js";
import { resumenReposiciones, ordenarPorFecha, estaRepuesto } from "../../domain/reposicion.js";
import { useT } from "../../i18n/useT.js";
import ModalReposicion from "./ModalReposicion.jsx";

// Fecha de hoy (ISO) para prellenar registros y reposiciones.
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reposicion({ personas, reposiciones, setReposiciones }) {
  const t = useT();
  const [modal, setModal] = useState(null);
  const [borrar, setBorrar] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const resumen = useMemo(() => resumenReposiciones(reposiciones), [reposiciones]);

  const filtrados = useMemo(() => {
    const base = ordenarPorFecha(reposiciones);
    if (filtro === "pendientes") return base.filter((r) => !estaRepuesto(r));
    if (filtro === "repuestos") return base.filter((r) => estaRepuesto(r));
    return base;
  }, [reposiciones, filtro]);

  const nuevo = () => ({
    id: `rep${Date.now()}`,
    funcionario: "",
    fecha: hoyISO(),
    tipoDia: "Día libre",
    motivo: "Emergencia",
    motivoDetalle: "",
    magnitud: "diaEntero",
    horas: 0,
    estado: "Pendiente",
    fechaReposicion: "",
    observaciones: "",
  });

  const guardar = (obj) => {
    if (!obj.funcionario || !obj.fecha) return;
    setReposiciones((prev) =>
      prev.some((x) => x.id === obj.id) ? prev.map((x) => (x.id === obj.id ? obj : x)) : [obj, ...prev],
    );
    setModal(null);
  };

  const marcarRepuesto = (id) =>
    setReposiciones((prev) =>
      prev.map((x) => (x.id === id ? { ...x, estado: "Repuesto", fechaReposicion: x.fechaReposicion || hoyISO() } : x)),
    );

  const reabrir = (id) =>
    setReposiciones((prev) => prev.map((x) => (x.id === id ? { ...x, estado: "Pendiente", fechaReposicion: "" } : x)));

  const magnitudLabel = (r) =>
    r.magnitud === "horas"
      ? t("reposicion.horasN", { n: r.horas })
      : r.magnitud === "medioDia"
      ? t("modalReposicion.magnitudMedioDia")
      : t("modalReposicion.magnitudDiaEntero");

  const desglose = (d) =>
    t("reposicion.resumen.desglose", { dias: d.diasEnteros, medios: d.mediosDias, horas: d.horas });

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
          <p className="mt-1 text-xs font-semibold text-amber-800">{desglose(resumen.pend)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            {t("reposicion.resumen.repuestos")}
          </p>
          <p className="mt-1 text-3xl font-semibold text-emerald-950">{resumen.repuestos}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-800">{desglose(resumen.rep)}</p>
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
            <table className="min-w-[900px] w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
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
                {filtrados.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 align-top">
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
                      <Badge className="border-blue-200 bg-blue-100 text-blue-900">{magnitudLabel(r)}</Badge>
                    </td>
                    <td className="p-3">
                      {estaRepuesto(r) ? (
                        <>
                          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">
                            {t("modalReposicion.estadoRepuesto")}
                          </Badge>
                          {r.fechaReposicion && (
                            <div className="mt-1 text-xs text-slate-500">
                              {t("reposicion.repuestoEl", { fecha: fecha(r.fechaReposicion) })}
                            </div>
                          )}
                        </>
                      ) : (
                        <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                          {t("modalReposicion.estadoPendiente")}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {estaRepuesto(r) ? (
                        <button
                          onClick={() => reabrir(r.id)}
                          className="rounded-lg px-2 py-1 font-semibold text-amber-800 hover:bg-amber-50"
                        >
                          {t("reposicion.reabrir")}
                        </button>
                      ) : (
                        <button
                          onClick={() => marcarRepuesto(r.id)}
                          className="rounded-lg px-2 py-1 font-semibold text-emerald-800 hover:bg-emerald-50"
                        >
                          {t("reposicion.marcarRepuesto")}
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
                ))}
              </tbody>
            </table>
          </div>
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
          cerrar={() => setModal(null)}
          guardar={guardar}
          eliminar={(id) => {
            setReposiciones((prev) => prev.filter((x) => x.id !== id));
            setModal(null);
          }}
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
