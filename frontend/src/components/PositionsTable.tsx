"use client";

import { usePositions } from "@/lib/hooks";
import { formatCurrency, formatPercent, pnlColor } from "@/lib/format";
import Card from "./Card";

export default function PositionsTable() {
  const { data, error, isLoading } = usePositions();

  if (isLoading) return <Card title="Positions"><Skeleton /></Card>;
  if (error) return <Card title="Positions"><p className="text-kite-red text-sm">Failed to load</p></Card>;

  const positions = data?.net ?? [];
  if (!positions.length) return <Card title="Positions"><p className="text-gray-400 text-sm">No open positions</p></Card>;

  const totalPnl = positions.reduce((s: number, p: any) => s + p.pnl, 0);

  return (
    <Card title={`Positions (${positions.length})`}>
      <div className="text-sm mb-3 pb-2 border-b border-gray-700">
        <span className={pnlColor(totalPnl)}>Day P&L: {formatCurrency(totalPnl)}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs uppercase">
              <th className="text-left py-2">Instrument</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Avg</th>
              <th className="text-right py-2">LTP</th>
              <th className="text-right py-2">P&L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p: any, i: number) => (
              <tr key={`${p.tradingsymbol}-${i}`} className="border-t border-gray-800 hover:bg-white/5">
                <td className="py-2 font-medium">
                  {p.tradingsymbol}
                  <span className="text-xs text-gray-500 ml-1">{p.exchange}</span>
                </td>
                <td className="text-right py-2">{p.quantity}</td>
                <td className="text-right py-2">{formatCurrency(p.average_price)}</td>
                <td className="text-right py-2">{formatCurrency(p.last_price)}</td>
                <td className={`text-right py-2 ${pnlColor(p.pnl)}`}>{formatCurrency(p.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
