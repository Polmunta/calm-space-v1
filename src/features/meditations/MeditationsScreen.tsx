import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, FlatList, ImageBackground } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "../../shared/theme/colors";
import { screenStyles } from "../../shared/ui/screenStyles";
import { SESSIONS, type MeditationSession } from "./meditations.data";
import {
  getFavorites,
  toggleFavorite,
  getLastSession,
  type MeditationId,
} from "./meditations.storage";

export default function MeditationsScreen({ navigation }: any) {
  const [favs, setFavs] = useState<MeditationId[]>([]);
  const [last, setLast] = useState<MeditationId | null>(null);

  useEffect(() => {
    (async () => {
      setFavs(await getFavorites());
      setLast(await getLastSession());
    })();
  }, []);

  const favSet = useMemo(() => new Set(favs), [favs]);

  const onToggleFav = async (id: MeditationId) => {
    const next = await toggleFavorite(id);
    setFavs(next);
  };

  const renderItem = ({ item }: { item: MeditationSession }) => {
    const isFav = favSet.has(item.id as MeditationId);
    const isLast = last === item.id;

    return (
      <Pressable
        onPress={() => navigation.navigate("MeditationPlayer", { id: item.id })}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      >
        {/* ✅ IMAGEN: fondo blur + imagen completa (contain). No se recorta */}
        <ImageBackground
          source={item.cover}
          style={styles.media}
          blurRadius={18}
          resizeMode="cover"
        >
          <View style={styles.mediaOverlay} />
          <Image source={item.cover} style={styles.mediaImg} resizeMode="contain" />
        </ImageBackground>

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>

            {/* ✅ MUY IMPORTANTE: que NO dispare la navegación */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                void onToggleFav(item.id as MeditationId);
              }}
              hitSlop={12}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <MaterialCommunityIcons
                name={isFav ? "heart" : "heart-outline"}
                size={22}
                color={isFav ? colors.primary : "rgba(74,74,74,0.55)"}
              />
            </Pressable>
          </View>

          <Text style={styles.desc}>{item.description}</Text>

          <View style={styles.badges}>
            {item.recommended ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Recomendada</Text>
              </View>
            ) : null}

            {isLast ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Última</Text>
              </View>
            ) : null}

            {isFav ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Favorita</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Meditaciones</Text>
        <Text style={screenStyles.subtitle}>Sesiones guiadas para relajarte</Text>
      </View>

      <FlatList
        data={SESSIONS}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ paddingBottom: 14, gap: 12 }}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    overflow: "hidden",
  },

  media: {
    width: "100%",
    height: 150,
    backgroundColor: "rgba(198, 183, 226, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(250, 249, 252, 0.10)",
  },
  mediaImg: {
    width: "92%",
    height: "92%",
  },

  cardBody: { padding: 14 },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "900", color: colors.text },
  desc: { marginTop: 6, fontSize: 13, color: "rgba(74,74,74,0.7)", fontWeight: "700" },

  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  badgeText: { fontWeight: "900", fontSize: 12, color: "rgba(74,74,74,0.75)" },
});
