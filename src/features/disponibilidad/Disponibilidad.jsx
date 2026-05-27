import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import Avatar from "../../ui/Avatar.jsx";
import { faltan, fecha } from "../../domain/fechas.js";
import { useT } from "../../i18n/useT.js";

export default function Disponibilidad({ personas }) {
  const t = useT();
  const con = personas.filter((f) => f.disponibilidad);
  const sin = personas.filter((f) => !f.disponibilidad);
  const lista = (arr) => (
    <div className="divide-y divide-slate-200">
      {arr.map((f) => {
        const d = faltan(f.vencimiento);
        return (
          <div key={f.id} className="flex items-center gap-3 py-3">
            <Avatar name={f.nombre} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{f.nombre}</div>
              <div className="text-xs text-slate-500">
                {f.contrato || f.puesto} · {f.vencimiento ? `vence ${fecha(f.vencimiento)}` : f.condicion}
              </div>
            </div>
            <Badge
              className={
                d !== null && d <= 60
                  ? "border-orange-200 bg-orange-100 text-orange-900"
                  : "border-slate-200 bg-slate-100 text-slate-700"
              }
            >
              {d === null ? t("disponibilidad.sinContrato") : t("disponibilidad.nDias", { n: d })}
            </Badge>
          </div>
        );
      })}
    </div>
  );
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <Card
        title={t("disponibilidad.activosTitulo")}
        icon="🛡️"
        action={<Badge className="border-emerald-200 bg-emerald-100 text-emerald-900">{con.length}</Badge>}
      >
        {lista(con)}
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <strong>Control:</strong> {t("disponibilidad.controlNota").replace(/^Control:\s*/, "")}
        </div>
      </Card>
      <Card
        title={t("disponibilidad.sinActivosTitulo")}
        icon="🛡️"
        action={<Badge className="border-slate-200 bg-slate-100 text-slate-700">{sin.length}</Badge>}
      >
        {lista(sin)}
      </Card>
    </section>
  );
}
