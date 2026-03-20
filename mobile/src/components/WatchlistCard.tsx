import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";
import { useQuote } from "../lib/hooks";
import { formatNumber, formatPercent, pnlColor } from "../lib/format";
import Card from "./Card";

const INSTRUMENTS = [
  "NSE:NIFTY 50",
  "NSE:NIFTY BANK",
  "NSE:RELIANCE",
  "NSE:TCS",
  "NSE:INFY",
  "NSE:HDFCBANK",
  "NSE:ICICIBANK",
  "NSE:SBIN",
];

export default function WatchlistCard() {
  const { data, loading, error } = useQuote(INSTRUMENTS.join(","));

  if (loading) {
    return (
      <Card title="Watchlist">
        <ActivityIndicator color={colors.accent} />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Watchlist">
        <Text style={styles.error}>Failed to load quotes</Text>
      </Card>
    );
  }

  return (
    <Card title="Watchlist">
      {INSTRUMENTS.map((instrument) => {
        const quote = data[instrument];
        if (!quote) return null;
        const change =
          quote.ohlc?.close > 0
            ? ((quote.last_price - quote.ohlc.close) / quote.ohlc.close) * 100
            : 0;
        const symbol = instrument.split(":")[1];

        return (
          <View key={instrument} style={styles.row}>
            <Text style={styles.symbol}>{symbol}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatNumber(quote.last_price)}</Text>
              <Text style={[styles.change, { color: pnlColor(change) }]}>
                {formatPercent(change)}
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
  symbol: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600",
  },
  change: {
    fontSize: 12,
    marginTop: 2,
  },
  error: {
    color: colors.red,
    fontSize: 13,
  },
});
