import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";
import { getAppLanguage, setAppLanguage, type AppLang } from "../../shared/i18n/i18n";

const LANGS: { id: AppLang; title: string; subtitle: string }[] = [
  { id: "es", title: "Español", subtitle: "Idioma principal" },
  { id: "en", title: "English", subtitle: "English" },
  { id: "ca", title: "Català", subtitle: "Català" },
];

export default function LanguageScreen() {
  const { t } = useTranslation(); // ✅ (opcional por ahora, pero ya listo para traducir pantalla)
  const [selected, setSelected] = useState<AppLang>(getAppLanguage()); // ✅ REACTIVO

  // ✅ por si al entrar el idioma guardado es distinto
  useEffect(() => {
    setSelected(getAppLanguage());
  }, []);

  const onPick = async (lang: AppLang) => {
    setSelected(lang);        // ✅ marca AL INSTANTE
    await setAppLanguage(lang); // ✅ cambia idioma AL INSTANTE + guarda
  };

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.subtitle}>
          {t("language.subtitle")}
        </Text>
      </View>

      <View style={{ height: 12 }} />

      {LANGS.map((l) => {
        const active = l.id === selected;

        return (
          <Pressable
            key={l.id}
            onPress={() => void onPick(l.id)}
            style={({ pressed }) => [
              styles.row,
              active && styles.rowActive,
              pressed && { opacity: 0.92 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, active && { color: colors.primary }]}>{l.title}</Text>
              <Text style={styles.sub}>{l.subtitle}</Text>
            </View>

            <View style={[styles.dot, active && styles.dotActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  rowActive: { borderColor: colors.primary },
  title: { fontSize: 15, fontWeight: "900", color: colors.text },
  sub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.65)" },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(198, 183, 226, 0.55)",
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
