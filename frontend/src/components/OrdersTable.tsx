"use client";

import { useOrders } from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";
import Card from "./Card";

const STATUS_COLORS: Record<string, string> = {
  COMPLETE: "text-kite-green",
  REJECTED: "text-kite-red",
  CANCELLED: "text-gray-500",
  OPEN: "text-kite-blue",
  PENDING: "text-yellow-400",
};

export default function OrdersTable() {
  const { data, error, isLoading } = useOrders();

  if (isLoading) return <Card title="Orders"><Skeleton /></Card>;
  if (error) return <Card title="Orders"><p className="text-kite-red text-sm">Failed to load</p></Card>;

  const orders = data as any[];
  if (!orders?.length) return <Card title="Orders"><p className="text-gray-400 text-sm">No orders today</p></Card>;

  return (
    <Card title={`Orders (${orders.length})`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs uppercase">
              <th className="text-left py-2">Time</th>
              <th className="text-left py-2">Instrument</th>
              <th className="text-left py-2">Type</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 20).map((o: any) => (
              <tr key={o.order_id} className="border-t border-gray-800 hover:bg-white/5">
                <td className="py-2 text-gray-400 text-xs">
                  {o.order_timestamp ? new Date(o.order_timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
                <td className="py-2 font-medium">{o.tradingsymbol}</td>
                <td className="py-2">
                  <span className={o.transaction_type === "BUY" ? "text-kite-green" : "text-kite-red"}>
                    {o.transaction_type}
                  </span>
                  <span className="text-gray-500 ml-1 text-xs">{o.order_type}</span>
                </td>
                <td className="text-right py-2">{o.quantity}</td>
                <td className="text-right py-2">{formatCurrency(o.average_price || o.price)}</td>
                <td className={`text-right py-2 text-xs font-medium ${STATUS_COLORS[o.status] || "text-gray-400"}`}>
                  {o.status}
                </td>
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
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-700 rounded w-full" />
      ))}
    </div>
  );
}
