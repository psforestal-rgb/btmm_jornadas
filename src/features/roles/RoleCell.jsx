import { memo } from "react";
import { codigoCls } from "../../ui/styles.js";

function RoleCell({ value, onOpen, onConflicto, finde, compact, editable, esInicio, conflicto }) {
  const v = String(value || "").toUpperCase();
  const handleClick = conflicto ? onConflicto : editable ? onOpen : undefined;
  const clickable = conflicto || editable;
  return (
    <td
      className={`border-b border-r border-slate-200 p-0 text-center font-semibold ${codigoCls(v, finde)} ${
        esInicio ? "ring-2 ring-inset ring-emerald-700" : ""
      } ${conflicto ? "ring-4 ring-inset ring-red-600" : ""}`}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={!clickable}
        className={`relative w-full ${compact ? "h-9 text-[11px]" : "min-h-touch h-12 text-[12px]"} font-semibold tracking-wide outline-none transition focus-visible:outline-none ${
          conflicto
            ? "cursor-pointer hover:brightness-90 focus:ring-2 focus:ring-red-500"
            : editable
            ? "cursor-pointer hover:brightness-95 focus:ring-2 focus:ring-emerald-700"
            : "cursor-default"
        }`}
        title={
          conflicto
            ? "Clic para resolver: rol vs actividad planificada"
            : editable
            ? "Cambiar marca del día"
            : "Active edición del funcionario para modificar"
        }
      >
        <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-white/45 px-1.5 py-0.5 shadow-sm ring-1 ring-black/5">
          {v || "—"}
        </span>
        {conflicto && (
          <span className="pnlq-pulse absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl-md bg-red-700 text-[10px] text-white">
            !
          </span>
        )}
        {esInicio && (
          <span className="absolute bottom-0 left-1 right-1 rounded-t bg-emerald-900 px-1 text-[8px] font-bold tracking-wider text-white">
            INICIO
          </span>
        )}
      </button>
    </td>
  );
}

// Comparación shallow personalizada: ignora cambios en `onOpen`/`onConflicto`
// si su identidad cambia pero el valor visible no. Esto evita re-renders
// cuando los handlers se re-crean en cada render del padre.
function areEqual(prev, next) {
  return (
    prev.value === next.value &&
    prev.finde === next.finde &&
    prev.compact === next.compact &&
    prev.editable === next.editable &&
    prev.esInicio === next.esInicio &&
    prev.conflicto === next.conflicto
  );
}

export default memo(RoleCell, areEqual);
