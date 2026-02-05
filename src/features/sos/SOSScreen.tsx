import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";
import { useTranslation } from "react-i18next";


import { getSOSFavorites, toggleSOSFavorite, getSOSUsage } from "./sos.storage";

type SOSId = "anxiety" | "overwhelmed" | "sleep" | "sad" | "focus" | "body";

type SOSItem = {
  id: SOSId;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  suggest?: {
    breathingModeId?: "calma" | "antiestres" | "cuadrada" | "suave" | "sueno";
    soundId?: "lluvia" | "olas" | "bosque" | "rio" | "tormenta";
  };
};

const SOS_ITEMS: SOSItem[] = [
  { id: "anxiety", icon: "heart-pulse", suggest: { breathingModeId: "antiestres", soundId: "lluvia" } },
  { id: "overwhelmed", icon: "alert-circle-outline", suggest: { breathingModeId: "calma", soundId: "rio" } },
  { id: "sleep", icon: "sleep", suggest: { breathingModeId: "sueno", soundId: "olas" } },
  { id: "sad", icon: "weather-cloudy", suggest: { breathingModeId: "calma", soundId: "rio" } },
  { id: "focus", icon: "target", suggest: { breathingModeId: "cuadrada", soundId: "bosque" } },
  { id: "body", icon: "arm-flex-outline", suggest: { breathingModeId: "suave", soundId: "lluvia" } }
];

export default function SOSScreen({ navigation }: any) {
  const [favs, setFavs] = useState<string[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      setFavs(await getSOSFavorites());
      setUsage(await getSOSUsage());
    })();
  }, []);

  const favSet = useMemo(() => new Set(favs), [favs]);

  const data = useMemo(() => {
    const base = [...SOS_ITEMS];
    base.sort((a, b) => {
      const aFav = favSet.has(a.id) ? 1 : 0;
      const bFav = favSet.has(b.id) ? 1 : 0;
      if (bFav !== aFav) return bFav - aFav;

      const aUse = usage[a.id] ?? 0;
      const bUse = usage[b.id] ?? 0;
      if (bUse !== aUse) return bUse - aUse;

      return 0; // mantiene orden original si empatan
    });
    return base;
  }, [favSet, usage]);

  const onToggleFav = async (id: string) => {
    const next = await toggleSOSFavorite(id);
    setFavs(next);
  };

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>{t("sos.title")}</Text>
        <Text style={screenStyles.subtitle}>{t("sos.subtitle")}</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        renderItem={({ item }) => {
          const isFav = favSet.has(item.id);
          const times = usage[item.id] ?? 0;

          return (
            <Pressable
              onPress={() => navigation.navigate("SOSDetail", { item })}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.titleText}>{t(`sos.items.${item.id}.title`)}</Text>
                  <Text style={styles.subText}>{t(`sos.items.${item.id}.subtitle`)}</Text>

                  {/* ✅ micro-info sin recargar */}
                  {times > 0 ? (
                    <Text style={styles.metaText}>{t("sos.usedTimes", { count: times })}</Text>
                  ) : null}
                </View>

                <Pressable onPress={() => onToggleFav(item.id)} hitSlop={10}>
                  <MaterialCommunityIcons
                    name={isFav ? "star" : "star-outline"}
                    size={22}
                    color={isFav ? colors.primary : "rgba(74,74,74,0.55)"}
                  />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
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
  subText: { marginTop: 4, fontSize: 13, color: "rgba(74, 74, 74, 0.7)" },
  metaText: { marginTop: 6, fontSize: 12, fontWeight: "800", color: "rgba(74,74,74,0.55)" },
});
