import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

type RoutineItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
};

export default function RoutineScreen({ navigation }: any) {
  // ✅ navegar a tabs (sibling) de forma robusta
  const navToTab = useCallback(
    (tabName: string, params: any) => {
      // intenta navegar al padre (Tabs). Si no, navega directo.
      const parent = navigation.getParent?.();
      if (parent?.navigate) parent.navigate(tabName, params);
      else navigation.navigate(tabName, params);
    },
    [navigation]
  );

  const routines: RoutineItem[] = [
    {
      id: "2calma",
      title: "2 min · Calma",
      subtitle: "Respiración calma + lluvia",
      icon: "weather-windy",
      onPress: () =>
        navToTab("TabBreathing", {
          screen: "Breathing",
          params: {
            modeId: "calma",
            totalSeconds: 120,     // ✅ 2 min exactos
            ambientOn: true,       // ✅ lluvia sugerida en tu mapping
            autoStart: false,       // ✅ arranca solo
          },
        }),
    },
    {
      id: "5foco",
      title: "5 min · Foco",
      subtitle: "Respiración cuadrada + bosque",
      icon: "target",
      onPress: () =>
        navToTab("TabBreathing", {
          screen: "Breathing",
          params: {
            modeId: "cuadrada",
            totalSeconds: 300,
            ambientOn: true,       // ✅ bosque sugerido en tu mapping
            autoStart: false,
          },
        }),
    },
    {
      id: "10sueno",
      title: "10 min · Sueño",
      subtitle: "Respiración sueño + olas",
      icon: "sleep",
      onPress: () =>
        navToTab("TabBreathing", {
          screen: "Breathing",
          params: {
            modeId: "sueno",
            totalSeconds: 600,
            ambientOn: true,       // ✅ olas sugeridas en tu mapping
            autoStart: false,
          },
        }),
    },
  ];

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Rutina rápida</Text>
        <Text style={screenStyles.subtitle}>
          Elige una duración y empieza al momento.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {routines.map((r) => (
          <Pressable
            key={r.id}
            onPress={r.onPress}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
          >
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={r.icon} size={22} color={colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{r.title}</Text>
              <Text style={styles.sub}>{r.subtitle}</Text>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(74,74,74,0.55)" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.45)",
  },
  title: { fontSize: 15, fontWeight: "900", color: colors.text },
  sub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.65)" },
});
