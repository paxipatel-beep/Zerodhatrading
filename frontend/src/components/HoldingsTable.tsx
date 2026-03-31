"use client";

import { useHoldings } from "@/lib/hooks";
import { formatCurrency, formatPercent, pnlColor } from "@/lib/format";
import Card from "./Card";

export default function HoldingsTable() {
  const { data, error, isLoading } = useHoldings();

  if (isLoading) return <Card title="Holdings"><Skeleton /></Card>;
  if (error) return <Card title="Holdings"><p className="text-kite-red text-sm">Failed to load holdings</p></Card>;

  const holdings = data as any[];
  if (!holdings?.length) return <Card title="Holdings"><p className="text-gray-400 text-sm">No holdings found</p></Card>;

  const totalInvestment = holdings.reduce((s, h) => s + h.average_price * h.quantity, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.last_price * h.quantity, 0);
  const totalPnl = totalCurrent - totalInvestment;
  const totalPnlPct = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  return (
    <Card title={`Holdings (${holdings.length})`}>
      <div className="flex justify-between text-sm mb-3 pb-2 border-b border-gray-700">
        <span className="text-gray-400">Total Invested: {formatCurrency(totalInvestment)}</span>
        <span className={pnlColor(totalPnl)}>
          P&L: {formatCurrency(totalPnl)} ({formatPercent(totalPnlPct)})
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs uppercase">
              <th className="text-left py-2">Stock</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Avg</th>
              <th className="text-right py-2">LTP</th>
              <th className="text-right py-2">P&L</th>
              <th className="text-right py-2">%</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h: any) => {
              const pnl = (h.last_price - h.average_price) * h.quantity;
              const pnlPct = h.average_price > 0 ? ((h.last_price - h.average_price) / h.average_price) * 100 : 0;
              return (
                <tr key={h.tradingsymbol} className="border-t border-gray-800 hover:bg-white/5">
                  <td className="py-2 font-medium">{h.tradingsymbol}</td>
                  <td className="text-right py-2">{h.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(h.average_price)}</td>
                  <td className="text-right py-2">{formatCurrency(h.last_price)}</td>
                  <td className={`text-right py-2 ${pnlColor(pnl)}`}>{formatCurrency(pnl)}</td>
                  <td className={`text-right py-2 ${pnlColor(pnlPct)}`}>{formatPercent(pnlPct)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-700 rounded w-full" />
      ))}
    </div>
  );
}
