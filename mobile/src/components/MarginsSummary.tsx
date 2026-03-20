import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";
import { useMargins } from "../lib/hooks";
import { formatCurrency } from "../lib/format";
import Card from "./Card";

export default function MarginsSummary() {
  const { data, loading, error } = useMargins();

  if (loading) {
    return (
      <Card title="Margins">
        <ActivityIndicator color={colors.accent} />
      </Card>
    );
  }

  if (error || !data?.equity) {
    return (
      <Card title="Margins">
        <Text style={styles.error}>Failed to load margins</Text>
      </Card>
    );
  }

  const equity = data.equity;
  const available = equity.available?.live_balance ?? 0;
  const used = equity.utilised?.debits ?? 0;
  const opening = equity.available?.opening_balance ?? 0;

  return (
    <Card title="Margins">
      <View style={styles.statsRow}>
        <StatItem label="Available" value={available} />
        <StatItem label="Used" value={used} />
        <StatItem label="Opening" value={opening} />
      </View>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600",
  },
  error: {
    color: colors.red,
    fontSize: 13,
  },
});
