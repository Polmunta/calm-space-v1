import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Image } from "react-native";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";
import { SESSIONS, type MeditationSession } from "./meditations.data";
import { setLastSession } from "./meditations.storage";

function mmss(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function MeditationPlayerScreen({ route }: any) {
  const { id } = route.params as { id: "meditacion" | "relajacion" };

  const session: MeditationSession | undefined = useMemo(
    () => SESSIONS.find((s) => s.id === id),
    [id]
  );

  const soundRef = useRef<Audio.Sound | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [posSec, setPosSec] = useState(0);
  const [durSec, setDurSec] = useState(0);

  useEffect(() => {
    mountedRef.current = true;

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
      mountedRef.current = false;
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

  const loadIfNeeded = async () => {
    if (!session) return;
    if (soundRef.current) return;

    const { sound } = await Audio.Sound.createAsync(session.audio, {
      shouldPlay: false,
      isLooping: false,
      volume: 1,
    });

    soundRef.current = sound;

    sound.setOnPlaybackStatusUpdate((st: any) => {
      if (!mountedRef.current) return;
      if (!st?.isLoaded) return;

      setIsLoaded(true);
      setIsPlaying(Boolean(st.isPlaying));

      const p = Math.floor((st.positionMillis ?? 0) / 1000);
      const d = Math.floor((st.durationMillis ?? 0) / 1000);

      setPosSec(p);
      setDurSec(d);

      if (st?.didJustFinish) {
        setIsPlaying(false);
      }
    });

    // Guardamos “última sesión” al abrir la pantalla
    void setLastSession(session.id);
  };

  const playPause = async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    try {
      await loadIfNeeded();
      if (!soundRef.current) return;

      const st: any = await soundRef.current.getStatusAsync();
      if (!st?.isLoaded) return;

      if (st.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch {
      // ignore
    } finally {
      busyRef.current = false;
    }
  };

  const stop = async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    try {
      if (!soundRef.current) return;
      try {
        await soundRef.current.stopAsync();
      } catch {}
      try {
        await soundRef.current.setPositionAsync(0);
      } catch {}

      if (mountedRef.current) {
        setIsPlaying(false);
        setPosSec(0);
      }
    } finally {
      busyRef.current = false;
    }
  };

  // ✅ PASO ACTIVO usando rangos fromSec/toSec
  const activeStepIndex = useMemo(() => {
    if (!session) return 0;

    const idx = session.steps.findIndex(
      (s) => posSec >= s.fromSec && posSec < s.toSec
    );

    if (idx === -1) {
      if (posSec < (session.steps[0]?.fromSec ?? 0)) return 0;
      return Math.max(0, session.steps.length - 1);
    }

    return idx;
  }, [posSec, session]);

  if (!session) {
    return (
      <View style={screenStyles.container}>
        <Text style={screenStyles.title}>No encontrada</Text>
        <Text style={screenStyles.subtitle}>Esta sesión no existe.</Text>
      </View>
    );
  }

  // ✅ Duración fallback (sin minutesLabel obligatorio)
  const lastToSec = session.steps[session.steps.length - 1]?.toSec ?? 0;
  const fallbackTotal =
    (typeof (session as any).minutesLabel === "string" && (session as any).minutesLabel) ||
    mmss(lastToSec);

  const totalLabel = durSec > 0 ? mmss(durSec) : fallbackTotal;
  const posLabel = mmss(clamp(posSec, 0, Math.max(0, durSec || lastToSec || 99999)));

  const progressPct = durSec > 0 ? clamp((posSec / durSec) * 100, 0, 100) : 0;

  return (
    <View style={screenStyles.container}>
      <View style={styles.hero}>
        <Image source={session.cover} style={styles.cover} />
        <View style={styles.overlay} />

        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{session.title}</Text>
          <Text style={styles.heroSub}>{session.description}</Text>

          <View style={styles.progressRow}>
            <Text style={styles.timeText}>{posLabel}</Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>

            <Text style={styles.timeText}>{totalLabel}</Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              onPress={playPause}
              style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.9 }]}
            >
              <MaterialCommunityIcons
                name={isPlaying ? "pause" : "play"}
                size={20}
                color="#fff"
              />
              <Text style={styles.playText}>{isPlaying ? "Pausar" : "Reproducir"}</Text>
            </Pressable>

            <Pressable
              onPress={stop}
              style={({ pressed }) => [styles.stopBtn, pressed && { opacity: 0.9 }]}
            >
              <MaterialCommunityIcons name="stop" size={18} color={colors.text} />
              <Text style={styles.stopText}>Detener</Text>
            </Pressable>
          </View>

          {!isLoaded ? (
            <Text style={styles.loadingHint}>
              Cargando audio…
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ height: 14 }} />

      <Text style={styles.stepsTitle}>Pasos</Text>

      <FlatList
        data={session.steps}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
        renderItem={({ item, index }) => {
          const active = index === activeStepIndex;

          // ✅ Duración del paso (más útil para el usuario)
          const stepDuration = mmss(item.toSec - item.fromSec);

          // Si prefieres mostrar rango, usa esto:
          // const range = `${mmss(item.fromSec)}–${mmss(item.toSec)}`;

          return (
            <View style={[styles.stepCard, active && styles.stepActive]}>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, active && styles.stepDotActive]} />
                <Text style={[styles.stepText, active && styles.stepTextActive]}>
                  {item.title}
                </Text>
                <Text style={styles.stepTime}>{stepDuration}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  cover: { width: "100%", height: 230 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.22)" },
  heroText: { position: "absolute", left: 14, right: 14, bottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  heroSub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "600",
  },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  timeText: { color: "rgba(255,255,255,0.9)", fontWeight: "900", fontSize: 12 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.85)" },

  controls: { flexDirection: "row", gap: 10, marginTop: 12 },
  playBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  playText: { color: "#fff", fontWeight: "900", fontSize: 13 },
  stopBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  stopText: { color: colors.text, fontWeight: "900", fontSize: 13 },

  loadingHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
  },

  stepsTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: 10 },
  stepCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  stepActive: { borderColor: colors.primary },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: "rgba(198, 183, 226, 0.45)" },
  stepDotActive: { backgroundColor: colors.primary },
  stepText: { flex: 1, fontWeight: "900", color: colors.text, fontSize: 13 },
  stepTextActive: { color: colors.text },
  stepTime: { fontWeight: "900", fontSize: 12, color: "rgba(74, 74, 74, 0.65)" },
});
