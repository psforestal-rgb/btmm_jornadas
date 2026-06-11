import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../i18n/useT.js";

/**
 * Indicador global de conexión y respaldo, siempre visible en la Topbar.
 *
 * Muestra en un solo "pill" compacto:
 *  - Estado de red: en línea (verde) / sin conexión (ámbar).
 *  - Hora del último respaldo local (lastSavedAt del AppContext).
 *  - "Guardando…" mientras hay cambios en la cola de debounce.
 *
 * En móvil se reduce a punto de color + hora para no saturar la barra;
 * el detalle completo vive en la vista «Datos · respaldo».
 */
export default function SyncStatus() {
  const { lastSavedAt, pendingChanges } = useApp();
  const t = useT();
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const hora = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })
    : null;

  const label = pendingChanges > 0
    ? t("sync.guardando")
    : hora
    ? t("sync.guardado", { hora })
    : t("sync.sinRespaldo");

  const ariaLabel = `${online ? t("sync.enLinea") : t("sync.sinConexion")} · ${label}`;

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        online
          ? "border-slate-200 bg-white text-slate-500"
          : "border-amber-300 bg-amber-50 text-amber-800"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${
          pendingChanges > 0 ? "animate-pulse bg-sky-500" : online ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      <span className="hidden sm:inline">{label}</span>
      {hora && <span className="sm:hidden">{hora}</span>}
    </span>
  );
}
