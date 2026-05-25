import Icon from "./Icon.jsx";

const TONE = {
  danger: { wrap: "border-red-700 bg-red-50 text-red-950", icon: "text-red-700" },
  warn: { wrap: "border-amber-600 bg-amber-50 text-amber-950", icon: "text-amber-700" },
  ok: { wrap: "border-emerald-700 bg-emerald-50 text-emerald-950", icon: "text-emerald-700" },
  info: { wrap: "border-blue-600 bg-blue-50 text-blue-950", icon: "text-blue-700" },
};

export default function AlertItem({ a }) {
  const tone = TONE[a.t] || TONE.info;
  return (
    <div className={`flex gap-3 rounded-xl border-l-4 p-3 ${tone.wrap}`} role={a.t === "danger" ? "alert" : "status"}>
      <div className={`mt-0.5 ${tone.icon}`}>
        <Icon name={a.icon} size={20} />
      </div>
      <div>
        <div className="text-sm font-semibold">{a.msg}</div>
        <div className="mt-1 text-xs opacity-80">{a.sub}</div>
      </div>
    </div>
  );
}
