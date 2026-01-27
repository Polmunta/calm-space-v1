import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "./shared/theme/colors";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrap}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.brandIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandTitle}>CalmSpace</Text>
        </View>

        <Text style={styles.subtitle}>Tu espacio de calma, paso a paso</Text>
      </View>

      {/* SOS grande */}
      <Pressable
        onPress={() => navigation.navigate("SOS")}
        style={({ pressed }) => [styles.sosCard, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.sosIconWrap}>
            <MaterialCommunityIcons name="lifebuoy" size={24} color={colors.primary} />
          </View>

          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>SOS</Text>
            <Text style={styles.cardSubText}>Ayuda rápida para calmarte ahora</Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
        </View>
      </Pressable>

      {/* Grid */}
      <View style={styles.grid}>
        <Pressable
          onPress={() => navigation.navigate("Breathing")}
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
        >
          <View style={styles.gridIconWrap}>
            <MaterialCommunityIcons name="weather-windy" size={22} color={colors.primary} />
          </View>
          <Text style={styles.gridTitle}>Respiración</Text>
          <Text style={styles.gridSub}>Ejercicios guiados</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Mindfulness")}
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
        >
          <View style={styles.gridIconWrap}>
            {/* ✅ Concentración */}
            <MaterialCommunityIcons name="target" size={22} color={colors.primary} />
          </View>
          <Text style={styles.gridTitle}>Atención plena</Text>
          <Text style={styles.gridSub}>Presencia y foco</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Sounds")}
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
        >
          <View style={styles.gridIconWrap}>
            <MaterialCommunityIcons name="music" size={22} color={colors.primary} />
          </View>
          <Text style={styles.gridTitle}>Sonidos</Text>
          <Text style={styles.gridSub}>Naturaleza & relax</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Meditations")}
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
        >
          <View style={styles.gridIconWrap}>
            {/* ✅ Meditaciones usa “meditación” */}
            <MaterialCommunityIcons name="meditation" size={22} color={colors.primary} />
          </View>
          <Text style={styles.gridTitle}>Meditaciones</Text>
          <Text style={styles.gridSub}>Sesiones guiadas</Text>
        </Pressable>
      </View>

      {/* Diario grande (abajo) */}
      <Pressable
        onPress={() => navigation.navigate("Journal")}
        style={({ pressed }) => [styles.journalCard, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="notebook-outline" size={22} color={colors.primary} />
          </View>

          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Diario</Text>
            <Text style={styles.cardSubText}>Escribe y reflexiona con ayuda</Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 22 },

  header: { marginBottom: 14 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  brandIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(198, 183, 226, 0.20)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandIcon: { width: 28, height: 28, opacity: 0.95 },
  brandTitle: {
    fontSize: 38, // ✅ más grande
    fontWeight: "900",
    color: colors.primary, // ✅ lila fuerte
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(74, 74, 74, 0.7)",
    textAlign: "center",
  },

  cardPressed: { transform: [{ scale: 0.99 }], opacity: 0.92 },

  sosCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: 6,
    marginBottom: 14,
  },
  sosIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  gridCard: {
    width: "48%",
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    minHeight: 120,
  },
  gridIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridTitle: { fontSize: 15, fontWeight: "900", color: colors.text },
  gridSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "rgba(74, 74, 74, 0.65)" },

  journalCard: {
    marginTop: 14,
    backgroundColor: colors.primarySoft,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },

  cardRow: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "900", color: colors.text },
  cardSubText: { marginTop: 4, fontSize: 13, color: "rgba(74, 74, 74, 0.7)", fontWeight: "700" },
});
