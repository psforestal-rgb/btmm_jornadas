export default function Card({ title, icon, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span>{icon}</span>
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
