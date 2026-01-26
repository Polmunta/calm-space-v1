import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";
import { SESSIONS, type MeditationSession } from "./meditations.data";
import {
  formatWhen,
  getFavorites,
  getLastSession,
  toggleFavorite,
  type SessionId,
} from "./meditations.storage";

export default function MeditationsScreen({ navigation }: any) {
  const [favorites, setFavorites] = useState<SessionId[]>([]);
  const [last, setLast] = useState<{ id: SessionId; at: number } | null>(null);

  useEffect(() => {
    (async () => {
      setFavorites(await getFavorites());
      setLast(await getLastSession());
    })();
  }, []);

  const lastLabel = useMemo(() => {
    if (!last) return null;
    const s = SESSIONS.find((x) => x.id === last.id);
    if (!s) return null;
    return `Última sesión: ${s.title} · ${formatWhen(last.at)}`;
  }, [last]);

  const onToggleFav = async (id: SessionId) => {
    const next = await toggleFavorite(id);
    setFavorites(next);
  };

  const renderItem = ({ item }: { item: MeditationSession }) => {
    const fav = favorites.includes(item.id);

    return (
      <Pressable
        onPress={() => navigation.navigate("MeditationPlayer", { id: item.id })}
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] },
        ]}
      >
        <Image source={item.cover} style={styles.cover} />
        <View style={styles.overlay} />

        <Pressable
          onPress={() => onToggleFav(item.id)}
          style={({ pressed }) => [
            styles.favBtn,
            pressed && { opacity: 0.9 },
          ]}
        >
          <MaterialCommunityIcons
            name={fav ? "heart" : "heart-outline"}
            size={18}
            color={fav ? "#E86AAE" : "#fff"}
          />
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.sub}>{item.subtitle}</Text>
          <Text style={styles.desc}>{item.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={colors.text} />
              <Text style={styles.metaText}>{item.minutesLabel}</Text>
            </View>

            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="playlist-check" size={14} color={colors.text} />
              <Text style={styles.metaText}>{item.steps.length} pasos</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // Orden: favoritos primero, luego el resto
  const data = useMemo(() => {
    const favs = SESSIONS.filter((s) => favorites.includes(s.id));
    const rest = SESSIONS.filter((s) => !favorites.includes(s.id));
    return [...favs, ...rest];
  }, [favorites]);

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Meditaciones</Text>
        <Text style={screenStyles.subtitle}>Sesiones guiadas para empezar.</Text>

        {lastLabel && <Text style={styles.lastLabel}>{lastLabel}</Text>}
      </View>

      <FlatList
        data={data}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  cover: { width: "100%", height: 170 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  favBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  content: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
  },
  title: { color: "#fff", fontWeight: "900", fontSize: 18 },
  sub: { marginTop: 4, color: "rgba(255,255,255,0.92)", fontWeight: "800", fontSize: 13 },
  desc: { marginTop: 6, color: "rgba(255,255,255,0.88)", fontWeight: "600", fontSize: 12, lineHeight: 16 },

  metaRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  metaText: { fontSize: 12, fontWeight: "900", color: colors.text },

  lastLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(74, 74, 74, 0.65)",
  },
});
