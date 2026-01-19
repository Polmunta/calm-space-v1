import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "./shared/theme/colors";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calm Space</Text>
      <Text style={styles.subtitle}>Tu espacio de calma, paso a paso</Text>

      <Pressable
        onPress={() => navigation.navigate("Breathing")}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="weather-windy" size={22} color={colors.primary} />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Respiración</Text>
            <Text style={styles.cardSubText}>Ejercicios guiados para calmarte</Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Mindfulness")}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="meditation" size={22} color={colors.primary} />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Atención plena</Text>
            <Text style={styles.cardSubText}>Presencia, foco y paz mental</Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Journal")}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="notebook-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Diario</Text>
            <Text style={styles.cardSubText}>Escribe y reflexiona con ayuda</Text>
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
    marginBottom: 26,
    fontSize: 14,
    color: "rgba(74, 74, 74, 0.7)",
    textAlign: "center",
  },
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
