import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "./shared/theme/colors";
import { screenStyles } from "./shared/ui/screenStyles";

const BRAND_LOGO = require("../assets/logo.png"); // ✅ usa tu logo 486x486

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[screenStyles.container, { paddingTop: 0 }]} edges={["top", "left", "right"]}>
      {/* ✅ FILA 1: iconos arriba */}
      <View style={[styles.topBar, { paddingTop: insets.top + (Platform.OS === "android" ? 10 : 6) }]}>
        <Pressable
          onPress={() => navigation.navigate("Profile")}
          style={({ pressed }) => [styles.topBtn, pressed && styles.pressedLite]}
          hitSlop={12}
        >
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={28}
            color={colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Language")}
          style={({ pressed }) => [styles.topBtn, pressed && styles.pressedLite]}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="translate" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          // ✅ evita que el contenido quede debajo del tabBar / botones del sistema
          { paddingBottom: 22 + insets.bottom },
        ]}
      >
        {/* ✅ FILA 2: marca */}
        <View style={styles.brand}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconWrap}>
              <Image source={BRAND_LOGO} style={styles.brandLogo} />
            </View>
            <Text style={styles.appName}>CalmSpace</Text>
          </View>
          <Text style={styles.appTagline}>{t("home.tagline")}</Text>
        </View>

        {/* ✅ FILA 3: tarjetas */}
        <View style={styles.cardsWrap}>
          {/* SOS */}
          <Pressable
            onPress={() => navigation.navigate("TabSOS")}
            style={({ pressed }) => [
              styles.sosCard,
              styles.pressableShadow,
              pressed && styles.pressedCard,
            ]}
          >
            <View style={styles.sosLeft}>
              <View style={styles.sosIconWrap}>
                <MaterialCommunityIcons name="lifebuoy" size={22} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.sosTitle}>{t("home.sosTitle")}</Text>
                <Text style={styles.sosSub}>{t("home.sosSub")}</Text>
              </View>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(74,74,74,0.6)" />
          </Pressable>

          {/* Rutina rápida */}
          <View style={styles.quickRow}>
            <Pressable
              onPress={() => navigation.navigate("Routine")}
              style={({ pressed }) => [styles.quickMini, pressed && { opacity: 0.9 }]}
            >
              <View style={styles.quickMiniIcon}>
                <MaterialCommunityIcons name="timer-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.quickMiniText}>{t("home.routine")}</Text>
            </Pressable>
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            <Tile
              icon="weather-windy"
              title={t("home.tileBreathingTitle")}
              subtitle={t("home.tileBreathingSub")}
              onPress={() => navigation.navigate("TabBreathing")}
            />
            <Tile
              icon="target"
              title={t("home.tileMindTitle")}
              subtitle={t("home.tileMindSub")}
              onPress={() => navigation.navigate("TabMindfulness")}
            />
            <Tile
              icon="music-note-outline"
              title={t("home.tileSoundsTitle")}
              subtitle={t("home.tileSoundsSub")}
              onPress={() => navigation.navigate("TabSounds")}
            />
            <Tile
              icon="meditation"
              title={t("home.tileMeditationsTitle")}
              subtitle={t("home.tileMeditationsSub")}
              onPress={() => navigation.navigate("TabMeditations")}
            />
          </View>

          {/* Diario */}
          <Pressable
            onPress={() => navigation.navigate("TabJournal")}
            style={({ pressed }) => [
              styles.diaryCard,
              styles.pressableShadow,
              pressed && styles.pressedCard,
            ]}
          >
            <View style={styles.diaryLeft}>
              <View style={styles.diaryIconWrap}>
                <MaterialCommunityIcons name="notebook-outline" size={22} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.diaryTitle}>{t("home.diaryTitle")}</Text>
                <Text style={styles.diarySub}>{t("home.diarySub")}</Text>
              </View>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(74,74,74,0.6)" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        styles.pressableShadow,
        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.tileIconWrap}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.tileTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.tileSub} numberOfLines={2}>
        {subtitle}
      </Text>
    </Pressable>
  );
}
const H_PADDING = 16;
const GRID_GAP = 12;
const TILE_WIDTH =
  (Dimensions.get("window").width - H_PADDING * 2 - GRID_GAP) / 2;



const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  topBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  brand: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 0,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.45)",
    overflow: "hidden",
    marginRight: 10, // ✅ en vez de gap
  },
  brandLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  appName: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.primary,
  },
  appTagline: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(74,74,74,0.65)",
  },

  cardsWrap: {
    paddingTop: 28,
  },

  sosCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(155, 125, 210, 0.60)",
    marginBottom: 14,
  },
  sosLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sosIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.45)",
    marginRight: 12, // ✅ en vez de gap
  },
  sosTitle: { fontSize: 16, fontWeight: "900", color: colors.text },
  sosSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.65)" },

  // ✅ Grid robusto (sin gap)
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  tile: {
    width: TILE_WIDTH,
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198,183,226,0.35)",
    marginBottom: GRID_GAP, // ✅ en vez de gap
  },
  tileIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198,183,226,0.35)",
  },
  tileTitle: { marginTop: 10, fontSize: 14, fontWeight: "900", color: colors.text },
  tileSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.65)" },

  diaryCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198,183,226,0.35)",
  },
  diaryLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  diaryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198,183,226,0.35)",
    marginRight: 12, // ✅ en vez de gap
  },
  diaryTitle: { fontSize: 15, fontWeight: "900", color: colors.text },
  diarySub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.65)" },

  pressedCard: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  pressedLite: {
    opacity: 0.85,
  },

  quickRow: {
    alignItems: "center",
    marginBottom: 12,
  },

  quickMini: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    width: "56%",
    justifyContent: "center",
  },

  quickMiniIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.45)",
    marginRight: 10, // ✅ en vez de gap
  },

  quickMiniText: {
    fontSize: 13,
    fontWeight: "900",
    color: "rgba(74,74,74,0.78)",
  },

  pressableShadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
});
