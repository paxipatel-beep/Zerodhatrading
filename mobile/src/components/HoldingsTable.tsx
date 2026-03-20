import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";
import { useHoldings } from "../lib/hooks";
import { formatCurrency, formatPercent, pnlColor } from "../lib/format";
import Card from "./Card";

export default function HoldingsTable() {
  const { data: holdings, loading, error } = useHoldings();

  if (loading) {
    return (
      <Card title="Holdings">
        <ActivityIndicator color={colors.accent} />
      </Card>
    );
  }

  if (error || !holdings) {
    return (
      <Card title="Holdings">
        <Text style={styles.error}>Failed to load holdings</Text>
      </Card>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card title="Holdings">
        <Text style={styles.empty}>No holdings found</Text>
      </Card>
    );
  }

  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.average_price * h.quantity,
    0
  );
  const totalCurrent = holdings.reduce(
    (sum, h) => sum + h.last_price * h.quantity,
    0
  );
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <Card title="Holdings">
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>
          Invested: {formatCurrency(totalInvested)}
        </Text>
        <Text style={[styles.summaryPnl, { color: pnlColor(totalPnl) }]}>
          P&L: {formatCurrency(totalPnl)} ({formatPercent(totalPnlPct)})
        </Text>
      </View>

      {holdings.map((h: any, i: number) => {
        const pnl = (h.last_price - h.average_price) * h.quantity;
        const pnlPct =
          h.average_price > 0
            ? ((h.last_price - h.average_price) / h.average_price) * 100
            : 0;
        return (
          <View key={i} style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.symbol}>{h.tradingsymbol}</Text>
              <Text style={styles.detail}>
                {h.quantity} x {formatCurrency(h.average_price)}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.ltp}>{formatCurrency(h.last_price)}</Text>
              <Text style={[styles.pnl, { color: pnlColor(pnl) }]}>
                {formatCurrency(pnl)} ({formatPercent(pnlPct)})
              </Text>
            </View>
          </View>
        );
      })}
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
