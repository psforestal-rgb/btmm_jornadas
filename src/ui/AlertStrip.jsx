import Icon from "./Icon.jsx";

export default function AlertStrip({ alerts, setView }) {
  const criticas = alerts.filter((a) => a.t === "danger" || a.t === "warn");
  if (!criticas.length) return null;
  return (
    <section
      aria-label={`${criticas.length} alertas requieren atención`}
      className="rounded-2xl border border-red-200 bg-red-50 p-3"
    >
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-800">
        <Icon name="danger" size={14} className="text-red-700" />
        Requiere atención · {criticas.length}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {criticas.slice(0, 5).map((a, i) => (
          <button
            key={i}
            onClick={() => setView("alertas")}
            className="flex min-h-touch shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Icon name={a.icon} size={14} />
            <span className="max-w-[140px] truncate">{a.msg.split(" — ")[0]}</span>
            <Icon name="chevronRight" size={14} className="text-red-500" />
          </button>
        ))}
      </div>
    </section>
  );
}
