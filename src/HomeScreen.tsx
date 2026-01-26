import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "./shared/theme/colors";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calm Space</Text>
      <Text style={styles.subtitle}>Tu espacio de calma, paso a paso</Text>

      {/* ✅ BOTÓN PRINCIPAL: SOS */}
      <Pressable
        onPress={() => navigation.navigate("SOS")}
        style={({ pressed }) => [
          styles.sosCard,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardRow}>
          <View style={styles.sosIconWrap}>
            <MaterialCommunityIcons
              name="clock-fast"
              size={26}
              color={colors.primary}
            />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.sosTitle}>SOS 60s</Text>
            <Text style={styles.cardSubText}>
              Calma rápida cuando lo necesitas ahora
            </Text>
          </View>
        </View>
      </Pressable>

      {/* RESPIRACIÓN */}
      <Pressable
        onPress={() => navigation.navigate("Breathing")}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="weather-windy"
              size={22}
              color={colors.primary}
            />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Respiración</Text>
            <Text style={styles.cardSubText}>
              Ejercicios guiados para calmarte
            </Text>
          </View>
        </View>
      </Pressable>

      {/* ATENCIÓN PLENA */}
      <Pressable
        onPress={() => navigation.navigate("Mindfulness")}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="meditation"
              size={22}
              color={colors.primary}
            />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Atención plena</Text>
            <Text style={styles.cardSubText}>
              Presencia, foco y paz mental
            </Text>
          </View>
        </View>
      </Pressable>

      {/* DIARIO */}
      <Pressable
        onPress={() => navigation.navigate("Journal")}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="notebook-outline"
              size={22}
              color={colors.primary}
            />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Diario</Text>
            <Text style={styles.cardSubText}>
              Escribe y reflexiona con ayuda
            </Text>
          </View>
        </View>
      </Pressable>

      {/* SONIDOS */}
      <Pressable
        onPress={() => navigation.navigate("Sounds")}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="waveform"
              size={22}
              color={colors.primary}
            />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Sonidos</Text>
            <Text style={styles.cardSubText}>
              Lluvia, olas, bosque… en bucle
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    fontSize: 14,
    color: "rgba(74, 74, 74, 0.7)",
    textAlign: "center",
  },

  /* SOS */
  sosCard: {
    backgroundColor: colors.primarySoft,
    padding: 18,
    borderRadius: 22,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  sosTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  sosIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "rgba(198, 183, 226, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  /* Cards normales */
  card: {
    backgroundColor: colors.primarySoft,
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  cardSubText: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(74, 74, 74, 0.7)",
  },
});
