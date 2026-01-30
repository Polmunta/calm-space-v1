import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

import { getProfileName, setProfileName } from "./profile.storage";
import { getProgress } from "./progress.storage";

function mmss(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

export default function ProfileScreen() {
  const [name, setName] = useState("");

  const [streak, setStreak] = useState(0);
  const [totalCalmSeconds, setTotalCalmSeconds] = useState(0);
  const [lastActivityLabel, setLastActivityLabel] = useState<string>("—");

  useEffect(() => {
    (async () => {
      const n = await getProfileName();
      setName(n);

      const p = await getProgress();
      setStreak(p.streak ?? 0);
      setTotalCalmSeconds(p.totalCalmSeconds ?? 0);
      setLastActivityLabel(p.lastActivityLabel ?? "—");
    })();
  }, []);

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        {/* ✅ “Perfil” del header ya sale en lavanda; el texto interior lo ponemos en gris */}
        <Text style={styles.grayTitle}>Perfil</Text>
        <Text style={screenStyles.subtitle}>Tu progreso.</Text>
      </View>

      {/* ✅ Tarjeta nombre */}
      <View style={styles.nameCard}>
        <Text style={styles.nameLabel}>Tu nombre</Text>

        <TextInput
          value={name}
          onChangeText={(v) => {
            const trimmed = v.slice(0, 20);
            setName(trimmed);
            void setProfileName(trimmed);
          }}
          placeholder="Escribe tu nombre…"
          placeholderTextColor="rgba(74,74,74,0.45)"
          maxLength={20}
          style={styles.input}
        />

        <Text style={styles.nameHint}>Máx 20 caracteres</Text>
      </View>

      {/* ✅ Progreso */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Racha: {streak} días</Text>
        <Text style={styles.cardLine}>Tiempo total de calma: {mmss(totalCalmSeconds)}</Text>
        <Text style={styles.cardLine}>Última actividad: {lastActivityLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grayTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "rgba(74,74,74,0.75)",
  },

  nameCard: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  nameLabel: { fontSize: 13, fontWeight: "900", color: colors.text },
  input: {
    marginTop: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  nameHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(74,74,74,0.6)",
  },

  card: {
    marginTop: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: colors.text },
  cardLine: { fontSize: 13, fontWeight: "800", color: "rgba(74,74,74,0.7)" },
});
