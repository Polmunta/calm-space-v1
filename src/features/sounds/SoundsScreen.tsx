import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

type SoundItem = {
  id: string;
  title: string;
  file: any;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const SOUNDS: SoundItem[] = [
  { id: "lluvia", title: "Lluvia", file: require("../../../assets/audio/lluvia.wav"), icon: "weather-rainy" },
  { id: "olas", title: "Olas", file: require("../../../assets/audio/olas.wav"), icon: "waves" },
  { id: "bosque", title: "Bosque", file: require("../../../assets/audio/bosque.wav"), icon: "pine-tree" },
  { id: "rio", title: "Río", file: require("../../../assets/audio/rio.wav"), icon: "water" },
  { id: "tormenta", title: "Tormenta", file: require("../../../assets/audio/tormenta.wav"), icon: "weather-lightning-rainy" },
];

type StopReason = "blur" | "unmount" | "manual" | "switch" | "autoplay";

export default function SoundsScreen({ route, navigation }: any) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const busyRef = useRef(false);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [stopping, setStopping] = useState(false);

  const LOOP = true;

  const stopAndUnloadForced = useCallback(async (_reason: StopReason) => {
    setStopping(true);
    try {
      if (soundRef.current) {
        try { await soundRef.current.stopAsync(); } catch {}
        try { await soundRef.current.pauseAsync(); } catch {}
        try { await soundRef.current.unloadAsync(); } catch {}
        soundRef.current = null;
      }
      setPlayingId(null);
    } finally {
      setLoadingId(null);
      setStopping(false);
      busyRef.current = false;
    }
  }, []);

  const stopAndUnload = useCallback(async (reason: StopReason) => {
    if (busyRef.current) return;
    busyRef.current = true;
    await stopAndUnloadForced(reason);
  }, [stopAndUnloadForced]);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });
      } catch {}
    })();

    return () => {
      void stopAndUnloadForced("unmount");
    };
  }, [stopAndUnloadForced]);

  // ✅ al salir de la pantalla/tab SIEMPRE paramos (forzado)
  useFocusEffect(
    useCallback(() => {
      return () => {
        void stopAndUnloadForced("blur");
      };
    }, [stopAndUnloadForced])
  );

  const play = useCallback(async (item: SoundItem, reason: StopReason = "manual") => {
    if (busyRef.current) return;
    busyRef.current = true;

    if (playingId === item.id) {
      busyRef.current = false;
      await stopAndUnload("manual");
      return;
    }

    setLoadingId(item.id);

    try {
      if (soundRef.current) {
        try { await soundRef.current.stopAsync(); } catch {}
        try { await soundRef.current.pauseAsync(); } catch {}
        try { await soundRef.current.unloadAsync(); } catch {}
        soundRef.current = null;
        setPlayingId(null);
      }

      const { sound } = await Audio.Sound.createAsync(item.file, {
        shouldPlay: true,
        isLooping: LOOP,
        volume: 1.0,
      });

      soundRef.current = sound;
      setPlayingId(item.id);
    } catch {
      setPlayingId(null);
    } finally {
      setLoadingId(null);
      busyRef.current = false;
    }
  }, [LOOP, playingId, stopAndUnload]);

  // ✅ AutoPlay desde SOS
  useFocusEffect(
    useCallback(() => {
      const autoId = route?.params?.autoPlayId as string | undefined;
      if (!autoId) return;

      const item = SOUNDS.find((s) => s.id === autoId);
      if (!item) return;

      const t = setTimeout(() => {
        void play(item, "autoplay");
        try { navigation.setParams({ autoPlayId: undefined }); } catch {}
      }, 150);

      return () => clearTimeout(t);
    }, [route?.params?.autoPlayId, navigation, play])
  );

  const stop = async () => {
    await stopAndUnload("manual");
  };

  const renderItem = ({ item }: { item: SoundItem }) => {
    const isPlaying = playingId === item.id;
    const isLoading = loadingId === item.id;

    return (
      <Pressable
        onPress={() => void play(item, "manual")}
        disabled={stopping}
        style={({ pressed }) => [
          styles.tile,
          isPlaying && styles.tileActive,
          pressed && !stopping && { opacity: 0.9 },
          stopping && { opacity: 0.7 },
        ]}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
        </View>

        <Text style={styles.tileTitle}>{item.title}</Text>

        <View style={styles.tileFooter}>
          {isLoading ? (
            <View style={styles.statusRow}>
              <ActivityIndicator />
              <Text style={styles.tileMeta}>Cargando…</Text>
            </View>
          ) : (
            <Text style={styles.tileMeta}>
              {isPlaying ? "Reproduciendo" : "Tocar para reproducir"}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Sonidos Naturaleza</Text>
        <Text style={screenStyles.subtitle}>Sonidos para dormir o relajarte.</Text>
      </View>

      <FlatList
        data={SOUNDS}
        keyExtractor={(s) => s.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        renderItem={renderItem}
      />

      <Pressable
        onPress={() => void stop()}
        disabled={!playingId || stopping || !!loadingId}
        style={({ pressed }) => [
          styles.stopBtn,
          (!playingId || stopping || !!loadingId) && styles.stopBtnDisabled,
          pressed && playingId && !stopping && !loadingId && { opacity: 0.9 },
        ]}
      >
        <Text style={styles.stopText}>{stopping ? "Deteniendo…" : "Detener"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    minHeight: 120,
  },
  tileActive: { borderColor: colors.primary },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tileTitle: { fontSize: 15, fontWeight: "900", color: colors.text },
  tileFooter: { marginTop: 6 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tileMeta: { fontSize: 12, color: "rgba(74, 74, 74, 0.7)", fontWeight: "700" },
  stopBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  stopBtnDisabled: { opacity: 0.6 },
  stopText: { color: "#fff", fontWeight: "900", fontSize: 14 },
});
