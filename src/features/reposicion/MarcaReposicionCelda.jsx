import { folioNumero } from "../../domain/reposicion.js";
import { fecha } from "../../domain/fechas.js";
import { t } from "../../i18n/es-CR.js";
import { magnitudLabelCorta } from "./etiquetas.js";

/**
 * Marca superpuesta sobre una celda de la matriz de roles (o sobre una
 * tarjeta de día). NO altera el código del rol (T/L/V/I/O): solo señala,
 * en la esquina superior izquierda, que ese día:
 *  - se trabajó por requerimiento de la administración (bandera), o
 *  - se otorgó como reposición de un tiempo trabajado (flecha).
 *
 * En ambos casos muestra el número de folio para que el día trabajado y
 * el día de reposición sean identificables entre sí.
 */
export default function MarcaReposicionCelda({ trabajada, reposicion }) {
  if (!trabajada && !reposicion) return null;
  return (
    <span className="pointer-events-none absolute left-0 top-0 z-10 flex flex-col items-start gap-px">
      {trabajada && (
        <span
          title={t("reposicion.marca.trabajadaTitulo", {
            folio: trabajada.folio,
            tipoDia: String(trabajada.tipoDia || "").toLowerCase(),
            magnitud: magnitudLabelCorta(trabajada, t),
            estado: t(`reposicion.estado.${trabajada.estadoCalc || "Pendiente"}`),
          })}
          className={`flex items-center gap-0.5 rounded-br-md px-1 py-px text-[8px] font-bold leading-none text-white ${
            trabajada.estadoCalc === "Repuesto"
              ? "bg-emerald-700"
              : trabajada.estadoCalc === "Parcial"
              ? "bg-indigo-600"
              : "bg-amber-600"
          }`}
        >
          <span aria-hidden="true">⚑</span>
          {folioNumero(trabajada.folio)}
        </span>
      )}
      {reposicion && (
        <span
          title={t("reposicion.marca.reposicionTitulo", {
            folio: reposicion.folio,
            fecha: fecha(reposicion.fecha),
          })}
          className="flex items-center gap-0.5 rounded-br-md bg-sky-700 px-1 py-px text-[8px] font-bold leading-none text-white"
        >
          <span aria-hidden="true">⟲</span>
          {folioNumero(reposicion.folio)}
        </span>
      )}
    </span>
  );
}
