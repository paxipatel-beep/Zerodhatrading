import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";
import { usePositions } from "../lib/hooks";
import { formatCurrency, pnlColor } from "../lib/format";
import Card from "./Card";

export default function PositionsTable() {
  const { data, loading, error } = usePositions();

  if (loading) {
    return (
      <Card title="Positions">
        <ActivityIndicator color={colors.accent} />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Positions">
        <Text style={styles.error}>Failed to load positions</Text>
      </Card>
    );
  }

  const positions = data.net || [];

  if (positions.length === 0) {
    return (
      <Card title="Positions">
        <Text style={styles.empty}>No open positions</Text>
      </Card>
    );
  }

  const totalPnl = positions.reduce((sum: number, p: any) => sum + (p.pnl || 0), 0);

  return (
    <Card title="Positions">
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Day P&L</Text>
        <Text style={[styles.summaryPnl, { color: pnlColor(totalPnl) }]}>
          {formatCurrency(totalPnl)}
        </Text>
      </View>

      {positions.map((p: any, i: number) => (
        <View key={i} style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.symbol}>{p.tradingsymbol}</Text>
            <Text style={styles.detail}>
              Qty: {p.quantity} | Avg: {formatCurrency(p.average_price)}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.ltp}>{formatCurrency(p.last_price)}</Text>
            <Text style={[styles.pnl, { color: pnlColor(p.pnl || 0) }]}>
              {formatCurrency(p.pnl || 0)}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryPnl: {
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  left: {},
  right: {
    alignItems: "flex-end",
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
  ltp: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600",
  },
  pnl: {
    fontSize: 12,
    marginTop: 2,
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
