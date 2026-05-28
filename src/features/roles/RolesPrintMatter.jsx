import { APP_VERSION, formatBuildTime } from "../../lib/appVersion.js";
import { useT } from "../../i18n/useT.js";

/**
 * Encabezado oculto en pantalla, visible solo al imprimir. Aparece arriba
 * de la tabla del rol mensual para identificar la institución y el período.
 *
 * Para uso real en campo, una unidad puede colocar su logo institucional
 * con la regla `pnlq-print-only` y un `<img />`. Esta versión usa solo
 * texto para no depender de assets externos durante la impresión.
 */
export default function RolesPrintHeader({ mes, anio, puesto }) {
  const t = useT();
  return (
    <header className="pnlq-print-only border-b-2 border-black pb-2 text-black">
      <div className="text-center">
        <p className="text-[9pt] font-bold uppercase tracking-wider">{t("print.encabezadoMinisterio")}</p>
        <p className="text-[8pt] font-bold">{t("print.encabezadoSinac")}</p>
        <p className="text-[8pt]">{t("print.encabezadoAcc")}</p>
        <p className="text-[8pt] italic">{t("print.encabezadoUnidad")}</p>
        <p className="mt-1 text-[11pt] font-bold uppercase">{t("print.documentoTitulo")}</p>
      </div>
      <div className="mt-1 flex items-baseline justify-between text-[9pt]">
        <p className="font-bold">{t("print.periodo", { mes, anio })}</p>
        <p className="font-bold">{t("print.puestoLabel", { puesto })}</p>
      </div>
    </header>
  );
}

/**
 * Pie de página oculto en pantalla, visible al imprimir. Contiene la
 * leyenda de códigos, espacios para firmas y la metadata de versión.
 */
export function RolesPrintFooter() {
  const t = useT();
  const ahora = new Date().toISOString();
  return (
    <footer className="pnlq-print-only mt-3 border-t-2 border-black pt-2 text-[8pt] text-black">
      <section>
        <p className="font-bold uppercase">{t("print.leyendaTitulo")}</p>
        <p className="mt-0.5">
          {t("print.leyendaT")} · {t("print.leyendaL")} · {t("print.leyendaV")} · {t("print.leyendaI")} · {t("print.leyendaO")}
        </p>
      </section>
      <section className="mt-3 grid grid-cols-3 gap-3">
        {[
          { titulo: t("print.firma1"), cargo: t("print.firmaCargo1") },
          { titulo: t("print.firma2"), cargo: t("print.firmaCargo2") },
          { titulo: t("print.firma3"), cargo: t("print.firmaCargo3") },
        ].map((f) => (
          <div key={f.titulo} className="text-center">
            <div className="mb-6 border-b border-black" />
            <p className="font-bold uppercase">{f.titulo}</p>
            <p className="italic">{f.cargo}</p>
          </div>
        ))}
      </section>
      <p className="mt-3">{t("print.lugarFecha")}</p>
      <div className="mt-3 flex flex-wrap items-baseline justify-between text-[7pt] italic">
        <span>{t("print.pieDocumento", { version: APP_VERSION })}</span>
        <span>{t("print.pieFecha", { fecha: formatBuildTime(ahora) })}</span>
      </div>
      <p className="mt-1 text-[7pt] italic">{t("print.pieReglaDura")}</p>
    </footer>
  );
}
