import { pnlColor } from "@/lib/format";

export default function StatCard({
  label,
  value,
  subValue,
  pnl,
}: {
  label: string;
  value: string;
  subValue?: string;
  pnl?: number;
}) {
  return (
    <div className="bg-kite-dark-card rounded-xl p-4 shadow-lg">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {subValue && (
        <p className={`text-sm mt-1 ${pnl !== undefined ? pnlColor(pnl) : "text-gray-400"}`}>
          {subValue}
        </p>
      )}
    </div>
  );
}
