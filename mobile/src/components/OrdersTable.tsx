import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";
import { useOrders } from "../lib/hooks";
import { formatCurrency } from "../lib/format";
import Card from "./Card";

const STATUS_COLORS: Record<string, string> = {
  COMPLETE: colors.green,
  REJECTED: colors.red,
  CANCELLED: colors.textSecondary,
  OPEN: colors.blue,
  PENDING: colors.yellow,
};

export default function OrdersTable() {
  const { data: orders, loading, error } = useOrders();

  if (loading) {
    return (
      <Card title="Orders">
        <ActivityIndicator color={colors.accent} />
      </Card>
    );
  }

  if (error || !orders) {
    return (
      <Card title="Orders">
        <Text style={styles.error}>Failed to load orders</Text>
      </Card>
    );
  }

  const recentOrders = orders.slice(0, 20);

  if (recentOrders.length === 0) {
    return (
      <Card title="Orders">
        <Text style={styles.empty}>No orders today</Text>
      </Card>
    );
  }

  return (
    <Card title="Orders">
      {recentOrders.map((o: any, i: number) => {
        const time = o.order_timestamp
          ? new Date(o.order_timestamp).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--";
        const statusColor = STATUS_COLORS[o.status] || colors.textSecondary;
        const isBuy = o.transaction_type === "BUY";

        return (
          <View key={i} style={styles.row}>
            <View style={styles.left}>
              <View style={styles.symbolRow}>
                <Text
                  style={[
                    styles.txnType,
                    { color: isBuy ? colors.green : colors.red },
                  ]}
                >
                  {o.transaction_type}
                </Text>
                <Text style={styles.symbol}>{o.tradingsymbol}</Text>
              </View>
              <Text style={styles.detail}>
                {time} | Qty: {o.quantity} | {formatCurrency(o.price || o.average_price || 0)}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={[styles.status, { color: statusColor }]}>
                {o.status}
              </Text>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  left: {
    flex: 1,
  },
  right: {
    marginLeft: 12,
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  txnType: {
    fontSize: 12,
    fontWeight: "700",
  },
  symbol: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  detail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
  error: {
    color: colors.red,
    fontSize: 13,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
