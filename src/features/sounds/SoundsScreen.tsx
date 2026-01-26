import React, { useEffect, useRef, useState } from "react";
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

export default function SoundsScreen() {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Candado para que play/stop no se pisen (evita “colgados”)
  const busyRef = useRef(false);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [stopping, setStopping] = useState(false);

  // ✅ Sí: en bucle
  const LOOP = true;

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
      (async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
          } catch {}
          soundRef.current = null;
        }
      })();
    };
  }, []);

  const stop = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setStopping(true);

    try {
      if (soundRef.current) {
        try {
          // pause suele ser más fiable que stop en algunos móviles
          await soundRef.current.pauseAsync();
        } catch {}

        try {
          await soundRef.current.unloadAsync();
        } catch {}

        soundRef.current = null;
      }
      setPlayingId(null);
    } finally {
      setLoadingId(null);
      setStopping(false);
      busyRef.current = false;
    }
  };

  const play = async (item: SoundItem) => {
    if (busyRef.current) return;
    busyRef.current = true;

    // Toggle: si pulsas el que ya suena → parar
    if (playingId === item.id) {
      busyRef.current = false; // liberamos para que stop pueda entrar
      await stop();
      return;
    }

    setLoadingId(item.id);

    try {
      // Paramos lo anterior (si lo hay)
      if (soundRef.current) {
        try {
          await soundRef.current.pauseAsync();
        } catch {}
        try {
          await soundRef.current.unloadAsync();
        } catch {}
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
  };

  const renderItem = ({ item }: { item: SoundItem }) => {
    const isPlaying = playingId === item.id;
    const isLoading = loadingId === item.id;

    return (
      <Pressable
        onPress={() => play(item)}
        disabled={stopping} // si está deteniendo, no dejamos tocar
        style={({ pressed }) => [
          styles.tile,
          isPlaying && styles.tileActive,
          (pressed && !stopping) && { opacity: 0.9 },
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
        onPress={stop}
        disabled={!playingId || stopping || !!loadingId}
        style={({ pressed }) => [
          styles.stopBtn,
          (!playingId || stopping || !!loadingId) && styles.stopBtnDisabled,
          pressed && playingId && !stopping && !loadingId && { opacity: 0.9 },
        ]}
      >
        <Text style={styles.stopText}>
          {stopping ? "Deteniendo…" : "Detener"}
        </Text>
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
  tileActive: {
    borderColor: colors.primary,
  },
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
  tileTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
  },
  tileFooter: {
    marginTop: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tileMeta: {
    fontSize: 12,
    color: "rgba(74, 74, 74, 0.7)",
    fontWeight: "700",
  },
  stopBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  stopBtnDisabled: {
    opacity: 0.6,
  },
  stopText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
});
