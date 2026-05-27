import { useRef, useState } from "react";
import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Icon from "../../ui/Icon.jsx";
import { useApp } from "../../context/AppContext.jsx";
import { exportSnapshot, parseSnapshot, SCHEMA_VERSION } from "../../lib/storage.js";
import { formatBuildTime } from "../../lib/appVersion.js";
import { useT } from "../../i18n/useT.js";
import { plural } from "../../i18n/es-CR.js";

function descargarArchivo(nombre, contenido) {
  try {
    const blob = new Blob([contenido], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export default function Datos() {
  const t = useT();
  const ctx = useApp();
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState(null);
  const [importOk, setImportOk] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const totalPersonas = (ctx.personas || []).length;
  const totalActividades = (ctx.actividadesPlan || []).length;
  const totalRoleEntries = Object.keys(ctx.roleData || {}).length;

  const onExport = () => {
    const snap = exportSnapshot({
      personas: ctx.personas,
      actividadesPlan: ctx.actividadesPlan,
      roleData: ctx.roleData,
    });
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    descargarArchivo(`pnlq-snapshot-${ts}.json`, JSON.stringify(snap, null, 2));
  };

  const onPickImport = () => fileInputRef.current?.click();

  const onImportFile = async (e) => {
    setImportError(null);
    setImportOk(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseSnapshot(text);
      if (!parsed.ok) {
        setImportError(parsed.reason);
        return;
      }
      ctx.replaceState({
        personas: parsed.state.personas ?? ctx.personas,
        actividadesPlan: parsed.state.actividadesPlan ?? ctx.actividadesPlan,
        roleData: parsed.state.roleData ?? ctx.roleData,
      });
      setImportOk({ exportadoEn: parsed.exportadoEn, archivo: file.name });
    } catch (err) {
      setImportError(`Error al leer archivo: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  };

  const onReset = () => {
    ctx.resetToSeed();
    setConfirmReset(false);
    setImportOk(null);
    setImportError(null);
  };

  const estado = ctx.pendingChanges > 0
    ? {
        tono: "warning",
        icon: "alert",
        msg: t("datos.estadoPendiente", { n: ctx.pendingChanges, plural: plural(ctx.pendingChanges) }),
      }
    : ctx.lastSavedAt
    ? { tono: "ok", icon: "check", msg: t("datos.estadoOk", { fecha: formatBuildTime(ctx.lastSavedAt) }) }
    : { tono: "info", icon: "info", msg: t("datos.estadoVacio") };

  const porQue = t("datos.porQue").map((m) => m.replace("{n}", SCHEMA_VERSION));

  return (
    <section className="space-y-4">
      <Card
        title={t("datos.titulo")}
        icon="🛡️"
        action={
          <Badge className="border-slate-300 bg-slate-100 text-slate-700">
            {t("datos.esquema", { n: SCHEMA_VERSION })}
          </Badge>
        }
      >
        <div
          className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 ${
            estado.tono === "warning"
              ? "border-amber-300 bg-amber-50 text-amber-950"
              : estado.tono === "ok"
              ? "border-emerald-300 bg-emerald-50 text-emerald-950"
              : "border-blue-200 bg-blue-50 text-blue-950"
          }`}
        >
          <Icon name={estado.icon} size={20} />
          <div>
            <p className="text-sm font-semibold">{estado.msg}</p>
            <p className="mt-1 text-xs opacity-80">{t("datos.estadoNota")}</p>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("datos.funcionarios")}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{totalPersonas}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("datos.actividadesPlanificadas")}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{totalActividades}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("datos.celdasOverride")}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{totalRoleEntries}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <Icon name="banknote" size={18} />
            {t("datos.exportar")}
          </button>
          <button
            type="button"
            onClick={onPickImport}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            <Icon name="clipboard" size={18} />
            {t("datos.importar")}
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-2xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-800 shadow-sm hover:bg-red-50"
          >
            <Icon name="refresh" size={18} />
            {t("datos.reiniciar")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onImportFile}
            className="hidden"
            aria-label={t("datos.archivoAria")}
          />
        </div>

        {importError && (
          <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-950" role="alert">
            <p className="font-semibold">{t("datos.importRechazado")}</p>
            <p className="mt-1 text-xs opacity-90">{importError}</p>
          </div>
        )}
        {importOk && (
          <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950" role="status">
            <p className="font-semibold">{t("datos.importadoTitulo")}</p>
            <p className="mt-1 text-xs opacity-90">
              {t("datos.importadoDesc", {
                archivo: importOk.archivo,
                exportadoEn: importOk.exportadoEn ? t("datos.importadoExtra", { fecha: formatBuildTime(importOk.exportadoEn) }) : "",
              })}
            </p>
          </div>
        )}

        {confirmReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={t("datos.reiniciarTitulo")}>
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-red-900">{t("datos.reiniciarTitulo")}</h3>
              <p className="mt-2 text-sm text-slate-700">{t("datos.reiniciarSub")}</p>
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
                {t("datos.reiniciarRec")}
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setConfirmReset(false)} className="min-h-touch rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">
                  {t("acciones.cancelar")}
                </button>
                <button type="button" onClick={onReset} className="min-h-touch rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
                  {t("datos.confirmarReiniciar")}
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card title={t("datos.porQueTitulo")} icon="ℹ️">
        <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-700">
          {porQue.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </Card>
    </section>
  );
}
