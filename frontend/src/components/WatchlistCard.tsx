"use client";

import { useState } from "react";
import { useQuote } from "@/lib/hooks";
import { formatCurrency, formatPercent, pnlColor } from "@/lib/format";
import Card from "./Card";

const DEFAULT_WATCHLIST = "NSE:NIFTY 50,NSE:NIFTY BANK,NSE:RELIANCE,NSE:TCS,NSE:INFY,NSE:HDFCBANK,NSE:ICICIBANK,NSE:SBIN";

export default function WatchlistCard() {
  const [instruments] = useState(DEFAULT_WATCHLIST);
  const { data, error, isLoading } = useQuote(instruments);

  if (isLoading) return <Card title="Watchlist"><Skeleton /></Card>;
  if (error) return <Card title="Watchlist"><p className="text-kite-red text-sm">Failed to load quotes</p></Card>;

  const quotes = data as Record<string, any>;
  if (!quotes) return null;

  return (
    <Card title="Watchlist">
      <div className="space-y-1">
        {Object.entries(quotes).map(([symbol, q]) => {
          const change = q.net_change ?? (q.last_price - q.ohlc?.close);
          const changePct = q.ohlc?.close ? (change / q.ohlc.close) * 100 : 0;
          const shortName = symbol.split(":")[1] || symbol;
          return (
            <div key={symbol} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
              <span className="font-medium text-sm truncate mr-2">{shortName}</span>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-medium">{formatCurrency(q.last_price)}</span>
                <span className={`text-xs ml-2 ${pnlColor(change)}`}>
                  {formatPercent(changePct)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-700 rounded w-full" />
      ))}
    </div>
  );
}
