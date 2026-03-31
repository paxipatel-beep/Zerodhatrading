import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../lib/theme";
import { useProfile } from "../lib/hooks";

export default function Header() {
  const { data: profile } = useProfile();
  const displayName = profile?.user_name || profile?.user_id || "User";

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>Zerodha Dashboard</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.dot} />
        <Text style={styles.name}>{displayName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  name: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
