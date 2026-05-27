import { useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import EmptyState from "../../ui/EmptyState.jsx";
import { meses } from "../../data/calendario.js";
import { dim, fecha, pad2 } from "../../domain/fechas.js";
import { useApp } from "../../context/AppContext.jsx";
import { useT } from "../../i18n/useT.js";

export default function AdelantoViaticos({ actividadesPlan, personas }) {
  const t = useT();
  const [vista, setVista] = useState("funcionario");
  const { reglas } = useApp();
  const diaCorte = reglas?.diaCorteViaticos ?? 15;
  const mesObjetivoConfig = reglas?.mesObjetivoViaticos ?? "siguiente";
  const permitirConsulta = reglas?.permitirConsultaDespuesCierre ?? true;

  const hoy = new Date();
  const enMesSiguiente = mesObjetivoConfig === "siguiente";
  const mesObjetivo = enMesSiguiente
    ? hoy.getMonth() === 11 ? 0 : hoy.getMonth() + 1
    : hoy.getMonth();
  const anoObjetivo = enMesSiguiente
    ? hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear()
    : hoy.getFullYear();
  const plazoAbierto = hoy.getDate() <= diaCorte;
  const inicioMes = `${anoObjetivo}-${pad2(mesObjetivo + 1)}-01`;
  const finMes = `${anoObjetivo}-${pad2(mesObjetivo + 1)}-${pad2(dim(anoObjetivo, mesObjetivo))}`;
  const actividades = actividadesPlan
    .filter((a) => a.viatico && a.inicio <= finMes && (a.fin || a.inicio) >= inicioMes)
    .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.titulo.localeCompare(b.titulo));
  const nombreMes = `${meses[mesObjetivo]} ${anoObjetivo}`;
  const mostrarListado = plazoAbierto || permitirConsulta;
  const registrosFuncionario = personas
    .filter((p) => actividades.some((a) => a.funcionarios.includes(p.nombre)))
    .map((p) => ({ funcionario: p, actividades: actividades.filter((a) => a.funcionarios.includes(p.nombre)) }))
    .sort((a, b) => a.funcionario.nombre.localeCompare(b.funcionario.nombre));
  const rango = (a) => (a.inicio === (a.fin || a.inicio) ? fecha(a.inicio) : `${fecha(a.inicio)} al ${fecha(a.fin)}`);
  return (
    <section className="space-y-4">
      <Card
        title={t("viaticos.titulo", { nombreMes })}
        icon="💵"
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVista("funcionario")}
              className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                vista === "funcionario" ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {t("viaticos.porFuncionario")}
            </button>
            <button
              onClick={() => setVista("actividad")}
              className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                vista === "actividad" ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {t("viaticos.porActividad")}
            </button>
          </div>
        }
      >
        <div
          className={`mb-4 rounded-2xl border p-4 text-sm ${
            plazoAbierto ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-red-200 bg-red-50 text-red-950"
          }`}
        >
          {plazoAbierto ? (
            <>
              <strong>{t("viaticos.plazoAbierto")}</strong> {t("viaticos.plazoAbiertoSub", { dia: diaCorte })}
            </>
          ) : (
            <>
              <strong>{t("viaticos.plazoCerrado")}</strong> {t("viaticos.plazoCerradoSub", { dia: diaCorte })}
            </>
          )}
          <div className="mt-1 text-xs font-bold opacity-80">
            {t("viaticos.pie", {
              nombreMes,
              dia: diaCorte,
              referencia: enMesSiguiente ? t("viaticos.referenciaAnterior") : t("viaticos.referenciaEnCurso"),
            })}
          </div>
        </div>
        {!mostrarListado ? (
          <EmptyState
            icon="banknote"
            title={t("viaticos.ocultoTitulo")}
            description={t("viaticos.ocultoDesc", { dia: diaCorte })}
            tone="warning"
          />
        ) : actividades.length === 0 ? (
          <EmptyState
            icon="banknote"
            title={t("viaticos.sinActividadesTitulo")}
            description={t("viaticos.sinActividadesDesc", { nombreMes })}
            tone="neutral"
          />
        ) : vista === "funcionario" ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {registrosFuncionario.map(({ funcionario, actividades }) => (
              <div key={funcionario.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={funcionario.nombre} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{funcionario.nombre}</div>
                    <div className="text-xs font-bold text-slate-500">
                      {funcionario.puestoOperativo} · {funcionario.puesto}
                    </div>
                  </div>
                  <Badge className="border-orange-200 bg-orange-100 text-orange-900">{actividades.length}</Badge>
                </div>
                <div className="space-y-2">
                  {actividades.map((a) => (
                    <div key={a.id} className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-orange-950">
                      <div className="text-sm font-semibold">{a.titulo}</div>
                      <div className="mt-1 text-xs font-bold">
                        {rango(a)} · {a.lugar || t("dia.sinLugar")}
                      </div>
                      {a.observaciones && <div className="mt-1 text-xs opacity-80">{a.observaciones}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {actividades.map((a) => (
              <div key={a.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-950 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-base font-semibold">{a.titulo}</div>
                    <div className="mt-1 text-sm font-bold">
                      {rango(a)} · {a.lugar || t("dia.sinLugar")}
                    </div>
                  </div>
                  <Badge className="border-orange-300 bg-orange-200 text-orange-950">
                    {t("viaticos.nFuncionarios", { n: a.funcionarios.length })}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.funcionarios.map((n) => (
                    <span
                      key={n}
                      className="rounded-full border border-orange-300 bg-white px-3 py-1 text-xs font-bold text-orange-950"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                {a.observaciones && <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs font-bold opacity-90">{a.observaciones}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
