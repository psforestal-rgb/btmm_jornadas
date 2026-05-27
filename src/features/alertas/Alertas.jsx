import Card from "../../ui/Card.jsx";
import Badge from "../../ui/Badge.jsx";
import AlertItem from "../../ui/AlertItem.jsx";
import { useT } from "../../i18n/useT.js";

export default function Alertas({ alerts }) {
  const t = useT();
  const semaforo = [
    ["🟢", t("alertas.semaforo.verde")],
    ["🟡", t("alertas.semaforo.amarillo")],
    ["🟠", t("alertas.semaforo.naranja")],
    ["🔴", t("alertas.semaforo.rojo")],
    ["🔵", t("alertas.semaforo.azul")],
  ];
  return (
    <section className="space-y-4">
      <Card
        title={t("alertas.titulo", { n: alerts.length })}
        icon="🔔"
        action={<Badge className="border-orange-200 bg-orange-100 text-orange-900">{t("alertas.requiereRevision")}</Badge>}
      >
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <AlertItem key={i} a={a} />
          ))}
        </div>
      </Card>
      <Card title={t("alertas.semaforoTitulo")} icon="🚦">
        <div className="grid gap-3 md:grid-cols-5">
          {semaforo.map(([s, txt]) => (
            <div key={txt} className="rounded-xl bg-slate-50 p-3">
              <div className="text-xl">{s}</div>
              <div className="mt-1 text-sm font-semibold">{txt}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
