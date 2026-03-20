import React from "react";
import { ScrollView, StyleSheet, RefreshControl, View, Text } from "react-native";
import { colors } from "../lib/theme";
import Header from "../components/Header";
import WatchlistCard from "../components/WatchlistCard";
import MarginsSummary from "../components/MarginsSummary";
import HoldingsTable from "../components/HoldingsTable";
import PositionsTable from "../components/PositionsTable";
import OrdersTable from "../components/OrdersTable";

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [key, setKey] = React.useState(0);

  const onRefresh = () => {
    setRefreshing(true);
    setKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <WatchlistCard key={`w-${key}`} />
        <MarginsSummary key={`m-${key}`} />
        <HoldingsTable key={`h-${key}`} />
        <PositionsTable key={`p-${key}`} />
        <OrdersTable key={`o-${key}`} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
});
