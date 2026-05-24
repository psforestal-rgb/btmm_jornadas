import { useState } from "react";
import { opcionesPuesto, opcionesCondicion, opcionesEstado, opcionesModalidad } from "../../data/opciones.js";
import { opcionesPuestoOperativo } from "../../data/puestos.js";

export default function ModalFuncionario({ valor, cerrar, guardar }) {
  const [f, setF] = useState(valor);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const cls = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none";
  const Field = ({ label, children }) => (
    <label>
      <span className="mb-1 block text-xs font-bold uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4">
      <div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="flex justify-between border-b p-5">
          <h3 className="text-lg font-semibold">{valor.nombre ? "Editar funcionario" : "Agregar funcionario"}</h3>
          <button onClick={cerrar} className="font-black">✕</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre"><input className={cls} value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
            <Field label="Cédula"><input className={cls} value={f.cedula} onChange={(e) => set("cedula", e.target.value)} /></Field>
            <Field label="Correo"><input className={cls} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Cargo institucional">
              <select className={cls} value={f.puesto} onChange={(e) => set("puesto", e.target.value)}>
                {opcionesPuesto.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Puesto operativo">
              <select className={cls} value={f.puestoOperativo || "Puesto Quetzales"} onChange={(e) => set("puestoOperativo", e.target.value)}>
                {opcionesPuestoOperativo.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Condición">
              <select className={cls} value={f.condicion} onChange={(e) => set("condicion", e.target.value)}>
                {opcionesCondicion.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select className={cls} value={f.estado} onChange={(e) => set("estado", e.target.value)}>
                {opcionesEstado.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Jornada">
              <select className={cls} value={f.jornada} onChange={(e) => set("jornada", e.target.value)}>
                <option>Ordinaria</option>
                <option>Acumulativa</option>
              </select>
            </Field>
            <Field label="Modalidad">
              <select className={cls} value={f.modalidad} onChange={(e) => set("modalidad", e.target.value)}>
                {opcionesModalidad.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Resolución"><input className={cls} value={f.resolucion} onChange={(e) => set("resolucion", e.target.value)} /></Field>
            <Field label="Contrato"><input className={cls} value={f.contrato} onChange={(e) => set("contrato", e.target.value)} /></Field>
            <Field label="Vencimiento"><input type="date" className={cls} value={f.vencimiento} onChange={(e) => set("vencimiento", e.target.value)} /></Field>
            <Field label="Ingreso"><input type="date" className={cls} value={f.ingreso} onChange={(e) => set("ingreso", e.target.value)} /></Field>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["disponibilidad", "Disponibilidad"],
              ["policia", "Autoridad policía"],
              ["brigada", "Brigada"],
              ["ong", "ONG-Invest-Volunt"],
            ].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold">
                <input type="checkbox" checked={!!f[k]} onChange={(e) => set(k, e.target.checked)} />
                {l}
              </label>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Observaciones</span>
            <textarea className={`${cls} min-h-24`} value={f.obs} onChange={(e) => set("obs", e.target.value)} />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t bg-slate-50 p-4">
          <button onClick={cerrar} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">Cancelar</button>
          <button onClick={() => guardar(f)} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">Guardar</button>
        </div>
      </div>
    </div>
  );
}
