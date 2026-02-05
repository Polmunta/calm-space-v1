import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";
import { incrementSOSUsage } from "./sos.storage";
import { useTranslation } from "react-i18next";


const MODE_LABEL: Record<string, string> = {
  calma: "Calma (4–4–6)",
  antiestres: "Anti-estrés (4–2–6)",
  cuadrada: "Cuadrada (4–4–4–4)",
  suave: "Suave (3–1–5)",
  sueno: "Sueño (4–0–8)",
};

const SOUND_LABEL: Record<string, string> = {
  lluvia: "Lluvia",
  olas: "Olas",
  bosque: "Bosque",
  rio: "Río",
  tormenta: "Tormenta",
};

export default function SOSDetailScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const item = route?.params?.item;

  useEffect(() => {
    if (item?.id) void incrementSOSUsage(item.id);
  }, [item?.id]);

  if (!item) {
    return (
      <View style={screenStyles.container}>
        <Text style={screenStyles.title}>{t("sos.title")}</Text>
        <Text style={screenStyles.subtitle}>{t("sos.notFound")}</Text>
      </View>
    );
  }

  const breathingModeId = item?.suggest?.breathingModeId as string | undefined;
  const soundId = item?.suggest?.soundId as string | undefined;

  const suggestionText = useMemo(() => {
  const a = breathingModeId ? t(`breathing.modes.${breathingModeId}.title`) : "";
  const b = soundId ? t(`sounds.items.${soundId}.title`) : "";
  if (a && b) return t("sos.suggestion.combo", { a, b });
  if (a) return t("sos.suggestion.single", { a });
  if (b) return t("sos.suggestion.single", { a: b });
  return "";
}, [breathingModeId, soundId, t]);

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>{t(`sos.items.${item.id}.detailTitle`)}</Text>
        <Text style={screenStyles.subtitle}>{t("sos.detailSubtitle")}</Text>

        {suggestionText ? <Text style={styles.suggestion}>{suggestionText}</Text> : null}
      </View>

      <View style={styles.card}>
        {(t(`sos.items.${item.id}.steps`, { returnObjects: true }) as string[]).map((s, idx) => (
         <Text key={idx} style={styles.step}>
            {s}
          </Text>
        ))}
      </View>

      <View style={{ height: 12 }} />

      {breathingModeId ? (
        <Pressable
          onPress={() =>
            navigation.navigate("TabBreathing", {
              screen: "Breathing",
              params: { modeId: breathingModeId },
            })
          }
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.primaryText}>{t("sos.goBreathing")}</Text>
        </Pressable>
      ) : null}

      {soundId ? (
        <Pressable
          onPress={() =>
            navigation.navigate("TabSounds", {
              screen: "Sounds",
              params: { autoPlayId: soundId },
            })
          }
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.secondaryText}>{t("sos.goSounds")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestion: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(74,74,74,0.65)",
  },
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
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  secondaryText: { color: colors.text, fontWeight: "900", fontSize: 14 },
});
