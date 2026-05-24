export default function AlertItem({ a }) {
  const c =
    a.t === "danger"
      ? "border-red-600 bg-red-50 text-red-950"
      : a.t === "warn"
      ? "border-yellow-500 bg-yellow-50 text-yellow-950"
      : a.t === "ok"
      ? "border-emerald-600 bg-emerald-50 text-emerald-950"
      : "border-blue-500 bg-blue-50 text-blue-950";
  return (
    <div className={`flex gap-3 rounded-xl border-l-4 p-3 ${c}`}>
      <div>{a.icon}</div>
      <div>
        <div className="text-sm font-semibold">{a.msg}</div>
        <div className="mt-1 text-xs opacity-80">{a.sub}</div>
      </div>
    </div>
  );
}
