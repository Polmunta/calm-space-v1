import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

export default function SOSDetailScreen({ route, navigation }: any) {
  const item = route?.params?.item;

  if (!item) {
    return (
      <View style={screenStyles.container}>
        <Text style={screenStyles.title}>SOS</Text>
        <Text style={screenStyles.subtitle}>No se encontró el ejercicio.</Text>
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>{item.detailTitle}</Text>
        <Text style={screenStyles.subtitle}>Un minuto. Un paso.</Text>
      </View>

      <View style={styles.card}>
        {item.steps.map((s: string, idx: number) => (
          <Text key={idx} style={styles.step}>
            {s}
          </Text>
        ))}
      </View>

      <View style={{ height: 12 }} />

      {item.suggest?.breathing && (
        <Pressable
          onPress={() => navigation.navigate("Breathing")}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.primaryText}>Ir a Respiración</Text>
        </Pressable>
      )}

      {item.suggest?.sounds && (
        <Pressable
          onPress={() => navigation.navigate("Sounds")}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.secondaryText}>Ir a Sonidos</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    gap: 10,
  },
  step: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    fontWeight: "700",
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  secondaryText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 14,
  },
});
