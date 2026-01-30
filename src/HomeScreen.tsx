import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "./shared/theme/colors";
import { screenStyles } from "./shared/ui/screenStyles";

const BRAND_LOGO = require("../assets/logo.png"); // ✅ usa tu logo 486x486

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={[screenStyles.container, { paddingTop: 0 }]}>
      {/* ✅ FILA 1: iconos arriba (zona azul) */}
      <View style={styles.topBar}>
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
          <MaterialCommunityIcons
            name="translate"
            size={26}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ✅ FILA 2: marca (zona amarilla) */}
        <View style={styles.brand}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconWrap}>
              <Image source={BRAND_LOGO} style={styles.brandLogo} />
            </View>
            <Text style={styles.appName}>CalmSpace</Text>
          </View>
          <Text style={styles.appTagline}>Tu espacio de calma, paso a paso</Text>
        </View>

        {/* ✅ FILA 3: tarjetas más abajo (zona roja) */}
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
                <Text style={styles.sosTitle}>SOS</Text>
                <Text style={styles.sosSub}>Ayuda rápida para calmarte ahora</Text>
              </View>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="rgba(74,74,74,0.6)"
            />
          </Pressable>

          {/* Grid */}
          <View style={styles.grid}>
            <Tile
              icon="weather-windy"
              title="Respiración"
              subtitle="Ejercicios guiados"
              onPress={() => navigation.navigate("TabBreathing")}
            />
            <Tile
              icon="target"
              title="Atención plena"
              subtitle="Presencia y foco"
              onPress={() => navigation.navigate("TabMindfulness")}
            />
            <Tile
              icon="music-note-outline"
              title="Sonidos"
              subtitle="Naturaleza & relax"
              onPress={() => navigation.navigate("TabSounds")}
            />
            <Tile
              icon="meditation"
              title="Meditaciones"
              subtitle="Sesiones guiadas"
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
                <Text style={styles.diaryTitle}>Diario</Text>
                <Text style={styles.diarySub}>Escribe y reflexiona con ayuda</Text>
              </View>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="rgba(74,74,74,0.6)"
            />
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
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSub}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    // ✅ Esto es la CLAVE: centrar verticalmente el contenido
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 22,
    // “baja” todo el bloque sin depender de números locos
    paddingTop: 12,
  
    
  },

  // ✅ Zona azul: iconos arriba, un poco más abajo que el borde
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "android" ? 36 : 28,
    paddingBottom: 6,
  },
  topBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

 
  // ✅ Zona amarilla: CalmSpace más abajo (no pegado a iconos)
  brand: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 0,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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

  // ✅ Zona roja: baja TODO el bloque de tarjetas
  cardsWrap: {
    paddingTop: 28, // 🔥 esto es lo que las baja al “recuadro rojo”
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
    gap: 12,
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
  },
  sosTitle: { fontSize: 16, fontWeight: "900", color: colors.text },
  sosSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.65)" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  tile: {
    width: "48%",
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198,183,226,0.35)",
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
  diaryLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  diaryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198,183,226,0.35)",
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
