import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

type SOSItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  detailTitle: string;
  steps: string[];
  suggest?: {
    breathingModeId?: "calma" | "ansiedad" | "dormir" | "foco" | "cuerpo";
    soundId?: "lluvia" | "olas" | "bosque" | "rio" | "tormenta";
  };
};

const SOS_ITEMS: SOSItem[] = [
  {
    id: "anxiety",
    title: "Bajar ansiedad",
    subtitle: "Para cuando te sube de golpe",
    icon: "heart-pulse",
    detailTitle: "Bajar ansiedad (60s)",
    steps: [
      "1) Suelta hombros y mandíbula.",
      "2) Exhala largo 3 veces (como si empañaras un cristal).",
      "3) Respira 4-2-6 durante 6 ciclos.",
      "4) Nombra 5 cosas que ves.",
    ],
    suggest: { breathingModeId: "ansiedad", soundId: "lluvia" },
  },
  {
    id: "overwhelmed",
    title: "Estoy agobiada",
    subtitle: "Demasiadas cosas a la vez",
    icon: "alert-circle-outline",
    detailTitle: "Bajar el agobio (60s)",
    steps: [
      "1) Escribe: ‘Ahora mismo solo tengo que…’",
      "2) Elige 1 tarea pequeña (máx 5 min).",
      "3) Elige 1 cosa que puedes dejar para mañana.",
    ],
    suggest: { breathingModeId: "calma", soundId: "rio" },
  },
  {
    id: "sleep",
    title: "Me cuesta dormir",
    subtitle: "Calmar mente y cuerpo",
    icon: "sleep",
    detailTitle: "Dormir mejor (60s)",
    steps: [
      "1) Baja la luz de la pantalla.",
      "2) Exhala lento 8 segundos x 6 veces.",
      "3) Relaja la lengua (al paladar suave) y la frente.",
    ],
    suggest: { breathingModeId: "dormir", soundId: "olas" },
  },
  {
    id: "sad",
    title: "Me siento triste",
    subtitle: "Sostener el bajón con cariño",
    icon: "weather-cloudy",
    detailTitle: "Acompañar la tristeza (60s)",
    steps: [
      "1) Pon una mano en el pecho y nota el contacto.",
      "2) Dite: ‘Esto es difícil, y no estoy sola en sentirlo’.",
      "3) Escribe una frase: ‘Hoy necesito…’.",
    ],
    suggest: { breathingModeId: "calma", soundId: "rio" },
  },
  {
    id: "focus",
    title: "Necesito foco",
    subtitle: "Volver a la tarea",
    icon: "target",
    detailTitle: "Enfocar (60s)",
    steps: [
      "1) Respira 3 veces lento.",
      "2) Elige 1 micro-tarea (5 min).",
      "3) Empieza sin perfección. Solo empezar.",
    ],
    suggest: { breathingModeId: "foco", soundId: "bosque" },
  },
  {
    id: "body",
    title: "Soltar el cuerpo",
    subtitle: "Tensión en cuello/hombros",
    icon: "arm-flex-outline",
    detailTitle: "Soltar tensión (60s)",
    steps: [
      "1) Sube hombros 3s y suelta 6s (x3).",
      "2) Aprieta puños 3s y suelta 6s (x3).",
      "3) Gira cuello suave a ambos lados.",
    ],
    suggest: { breathingModeId: "cuerpo", soundId: "lluvia" },
  },
];

export default function SOSScreen({ navigation }: any) {
  // ✅ orden “humano”: primero ansiedad y dormir (lo más típico)
  const data = useMemo(() => {
    const priority = ["anxiety", "sleep"];
    return [...SOS_ITEMS].sort((a, b) => {
      const pa = priority.indexOf(a.id);
      const pb = priority.indexOf(b.id);
      if (pa === -1 && pb === -1) return 0;
      if (pa === -1) return 1;
      if (pb === -1) return -1;
      return pa - pb;
    });
  }, []);

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>SOS 60s</Text>
        <Text style={screenStyles.subtitle}>Accesos rápidos para volver a la calma.</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("SOSDetail", { item })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name={item.icon} size={22} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.subText}>{item.subtitle}</Text>

                {(item.suggest?.breathingModeId || item.suggest?.soundId) ? (
                  <View style={styles.badges}>
                    {item.suggest?.breathingModeId ? (
                      <View style={styles.badge}>
                        <MaterialCommunityIcons name="weather-windy" size={14} color={colors.primary} />
                        <Text style={styles.badgeText}>Respiración</Text>
                      </View>
                    ) : null}
                    {item.suggest?.soundId ? (
                      <View style={styles.badge}>
                        <MaterialCommunityIcons name="music-note-outline" size={14} color={colors.primary} />
                        <Text style={styles.badgeText}>Sonidos</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>

              <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(74,74,74,0.45)" />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  cardPressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: { fontSize: 16, fontWeight: "900", color: colors.text },
  subText: { marginTop: 4, fontSize: 13, color: "rgba(74, 74, 74, 0.7)", fontWeight: "700" },

  badges: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  badgeText: { fontSize: 12, fontWeight: "900", color: "rgba(74,74,74,0.75)" },
});
