import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import AlertItem from "../../ui/AlertItem.jsx";

export default function Alertas({ alerts }) {
  return (
    <section className="space-y-4">
      <Card
        title={`Alertas del sistema (${alerts.length})`}
        icon="🔔"
        action={<Badge className="border-orange-200 bg-orange-100 text-orange-900">Requiere revisión</Badge>}
      >
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <AlertItem key={i} a={a} />
          ))}
        </div>
      </Card>
      <Card title="Semáforo normativo" icon="🚦">
        <div className="grid gap-3 md:grid-cols-5">
          {[
            ["🟢", "Verificado"],
            ["🟡", "Confirmación interna"],
            ["🟠", "Criterio RH/Jurídico"],
            ["🔴", "No automatizar"],
            ["🔵", "Dato pendiente"],
          ].map(([s, t]) => (
            <div key={t} className="rounded-xl bg-slate-50 p-3">
              <div className="text-xl">{s}</div>
              <div className="mt-1 text-sm font-semibold">{t}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
