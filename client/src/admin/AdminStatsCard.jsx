export default function AdminStatsCard({ title, value, icon }) {
  return (
    <div className=" p-4 rounded-xl shadow flex items-center gap-4 border border-gray-200">
      {icon && <div className="text-2xl text-[var(--lightblue)]">{icon}</div>}
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
