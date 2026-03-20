"use client";

import { useMargins } from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";
import Card from "./Card";

export default function MarginsSummary() {
  const { data, error, isLoading } = useMargins();

  if (isLoading) return <Card title="Margins"><Skeleton /></Card>;
  if (error) return <Card title="Margins"><p className="text-kite-red text-sm">Failed to load</p></Card>;

  const margins = data as any;
  const equity = margins?.equity;
  if (!equity) return null;

  const items = [
    { label: "Available", value: equity.available?.live_balance ?? 0 },
    { label: "Used", value: equity.utilised?.debits ?? 0 },
    { label: "Opening Balance", value: equity.available?.opening_balance ?? 0 },
  ];

  return (
    <Card title="Margins (Equity)">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between">
            <span className="text-gray-400 text-sm">{item.label}</span>
            <span className="font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-700 rounded w-full" />
      ))}
    </div>
  );
}
