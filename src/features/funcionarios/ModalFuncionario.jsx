import { useState } from "react";
import { opcionesPuesto, opcionesCondicion, opcionesEstado, opcionesModalidad } from "../../data/opciones.js";
import { opcionesPuestoOperativo } from "../../data/puestos.js";
import { useEscapeClose } from "../../lib/a11y.js";
import { useT } from "../../i18n/useT.js";

const cls = "w-full min-h-touch rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

/* A nivel de módulo: definidos dentro del componente cambiaban de identidad
   en cada render y React remontaba el input, perdiendo el foco al teclear. */
function Field({ label, children }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-bold uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Seccion({ id, titulo, cols = "md:grid-cols-2", children }) {
  return (
    <section aria-labelledby={id}>
      <h4 id={id} className="mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
        {titulo}
      </h4>
      <div className={`grid gap-4 ${cols}`}>{children}</div>
    </section>
  );
}

export default function ModalFuncionario({ valor, cerrar, guardar }) {
  useEscapeClose(cerrar);
  const t = useT();
  const [f, setF] = useState(valor);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const titulo = valor.nombre ? t("modalFuncionario.editar") : t("modalFuncionario.agregar");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="flex justify-between border-b p-5">
          <h3 className="text-lg font-semibold">{titulo}</h3>
          <button onClick={cerrar} aria-label={t("acciones.cerrar")} className="-mr-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          <Seccion id="sec-identificacion" titulo={t("modalFuncionario.sec.identificacion")}>
            <Field label={t("modalFuncionario.nombre")}><input className={cls} value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
            <Field label={t("modalFuncionario.cedula")}><input className={cls} value={f.cedula} onChange={(e) => set("cedula", e.target.value)} /></Field>
            <Field label={t("modalFuncionario.correo")}><input className={cls} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
          </Seccion>
          <Seccion id="sec-puesto" titulo={t("modalFuncionario.sec.puesto")}>
            <Field label={t("modalFuncionario.cargo")}>
              <select className={cls} value={f.puesto} onChange={(e) => set("puesto", e.target.value)}>
                {opcionesPuesto.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label={t("modalFuncionario.puesto")}>
              <select className={cls} value={f.puestoOperativo || "Puesto Quetzales"} onChange={(e) => set("puestoOperativo", e.target.value)}>
                {opcionesPuestoOperativo.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label={t("modalFuncionario.condicion")}>
              <select className={cls} value={f.condicion} onChange={(e) => set("condicion", e.target.value)}>
                {opcionesCondicion.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label={t("modalFuncionario.estado")}>
              <select className={cls} value={f.estado} onChange={(e) => set("estado", e.target.value)}>
                {opcionesEstado.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          </Seccion>
          <Seccion id="sec-jornada" titulo={t("modalFuncionario.sec.jornada")}>
            <Field label={t("modalFuncionario.jornada")}>
              <select className={cls} value={f.jornada} onChange={(e) => set("jornada", e.target.value)}>
                <option>Ordinaria</option>
                <option>Acumulativa</option>
              </select>
            </Field>
            <Field label={t("modalFuncionario.modalidad")}>
              <select className={cls} value={f.modalidad} onChange={(e) => set("modalidad", e.target.value)}>
                {opcionesModalidad.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          </Seccion>
          <Seccion id="sec-contratacion" titulo={t("modalFuncionario.sec.contratacion")}>
            <Field label={t("modalFuncionario.resolucion")}><input className={cls} value={f.resolucion} onChange={(e) => set("resolucion", e.target.value)} /></Field>
            <Field label={t("modalFuncionario.contrato")}><input className={cls} value={f.contrato} onChange={(e) => set("contrato", e.target.value)} /></Field>
            <Field label={t("modalFuncionario.vencimiento")}><input type="date" className={cls} value={f.vencimiento} onChange={(e) => set("vencimiento", e.target.value)} /></Field>
            <Field label={t("modalFuncionario.ingreso")}><input type="date" className={cls} value={f.ingreso} onChange={(e) => set("ingreso", e.target.value)} /></Field>
          </Seccion>
          <Seccion id="sec-atributos" titulo={t("modalFuncionario.sec.atributos")} cols="sm:grid-cols-2 md:grid-cols-4">
            {[
              ["disponibilidad", t("modalFuncionario.attr.disponibilidad")],
              ["policia", t("modalFuncionario.attr.policia")],
              ["brigada", t("modalFuncionario.attr.brigada")],
              ["ong", t("modalFuncionario.attr.ong")],
            ].map(([k, l]) => (
              <label key={k} className="flex min-h-touch items-center gap-2 rounded-xl border p-3 text-sm font-semibold">
                <input type="checkbox" checked={!!f[k]} onChange={(e) => set(k, e.target.checked)} />
                {l}
              </label>
            ))}
          </Seccion>
          <Seccion id="sec-obs" titulo={t("modalFuncionario.obs")} cols="grid-cols-1">
            <textarea className={`${cls} min-h-24`} value={f.obs} onChange={(e) => set("obs", e.target.value)} aria-label={t("modalFuncionario.obs")} />
          </Seccion>
        </div>
        <div className="flex justify-end gap-2 border-t bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button onClick={cerrar} className="min-h-touch rounded-xl border bg-white px-4 py-2 text-sm font-semibold">{t("acciones.cancelar")}</button>
          <button onClick={() => guardar(f)} className="min-h-touch rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">{t("acciones.guardar")}</button>
        </div>
      </div>
    </div>
  );
}
