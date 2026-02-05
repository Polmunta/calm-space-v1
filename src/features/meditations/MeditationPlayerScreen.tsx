import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Image, Modal } from "react-native";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import i18n from "../../shared/i18n/i18n";



import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";
import { SESSIONS, type MeditationSession, getSessionAudio } from "./meditations.data";

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
    const { t } = useTranslation();

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
  const [volume, setVolume] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Para que el slider sea “pinchable” sin pelearse con el update
  const draggingRef = useRef(false);
  const [dragSec, setDragSec] = useState<number | null>(null);

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
        await stopAndUnload("unmount");
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAndUnload = async (_reason: "blur" | "unmount") => {
    // forzado: aunque esté “busy”
    busyRef.current = true;
    try {
      if (soundRef.current) {
        try { await soundRef.current.stopAsync(); } catch {}
        try { await soundRef.current.unloadAsync(); } catch {}
        soundRef.current = null;
      }
      if (mountedRef.current) {
        setIsPlaying(false);
        setIsLoaded(false);
        setPosSec(0);
      }
    } finally {
      busyRef.current = false;
    }
  };

  // ✅ al salir de pantalla (tab/back): parar
  useFocusEffect(
    useCallback(() => {
      return () => {
        void stopAndUnload("blur");
      };
    }, [])
  );

  const loadIfNeeded = async () => {
    if (!session) return;
    if (soundRef.current) return;

    const { sound } = await Audio.Sound.createAsync(getSessionAudio(session), {

      shouldPlay: false,
      isLooping: false,
      volume,
    });

    soundRef.current = sound;

    sound.setOnPlaybackStatusUpdate((st: any) => {
      if (!mountedRef.current) return;
      if (!st?.isLoaded) return;

      setIsLoaded(true);
      setIsPlaying(Boolean(st.isPlaying));

      const p = Math.floor((st.positionMillis ?? 0) / 1000);
      const d = Math.floor((st.durationMillis ?? 0) / 1000);

      // si estoy arrastrando, no machacamos el slider
      if (!draggingRef.current) setPosSec(p);
      setDurSec(d);

      if (st?.didJustFinish) setIsPlaying(false);
    });

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

      if (st.isPlaying) await soundRef.current.pauseAsync();
      else await soundRef.current.playAsync();
    } catch {
    } finally {
      busyRef.current = false;
    }
  };

  const stop = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      if (!soundRef.current) return;
      try { await soundRef.current.stopAsync(); } catch {}
      try { await soundRef.current.setPositionAsync(0); } catch {}
      if (mountedRef.current) {
        setIsPlaying(false);
        setPosSec(0);
      }
    } finally {
      busyRef.current = false;
    }
  };

  const seekTo = async (sec: number, autoPlay = true) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      await loadIfNeeded();
      if (!soundRef.current) return;

      const ms = Math.max(0, Math.floor(sec * 1000));
      try { await soundRef.current.setPositionAsync(ms); } catch {}

      if (autoPlay) {
        const st: any = await soundRef.current.getStatusAsync();
        if (st?.isLoaded && !st.isPlaying) {
          try { await soundRef.current.playAsync(); } catch {}
        }
      }
      if (mountedRef.current) setPosSec(Math.floor(sec));
    } finally {
      busyRef.current = false;
    }
  };

  const jump = async (deltaSec: number) => {
    const base = dragSec ?? posSec;
    const next = clamp(base + deltaSec, 0, Math.max(0, durSec || 999999));
    await seekTo(next, true);
  };

  const setPlayerVolume = async (v: number) => {
    setVolume(v);
    if (soundRef.current) {
      try { await soundRef.current.setVolumeAsync(v); } catch {}
    }
  };

  const activeStepIndex = useMemo(() => {
    if (!session) return 0;
    const p = dragSec ?? posSec;

    const idx = session.steps.findIndex((s) => p >= s.fromSec && p < s.toSec);
    if (idx === -1) {
      if (p < (session.steps[0]?.fromSec ?? 0)) return 0;
      return Math.max(0, session.steps.length - 1);
    }
    return idx;
  }, [posSec, dragSec, session]);

  if (!session) {
    return (
      <View style={screenStyles.container}>
        <Text style={screenStyles.title}>{t("meditations.notFoundTitle")}</Text>
        <Text style={screenStyles.subtitle}>{t("meditations.notFoundSubtitle")}</Text>
      </View>
    );
  }

  const lastToSec = session.steps[session.steps.length - 1]?.toSec ?? 0;
  const totalLabel = durSec > 0 ? mmss(durSec) : mmss(lastToSec);
  const showPos = dragSec ?? posSec;
  const posLabel = mmss(clamp(showPos, 0, Math.max(0, durSec || lastToSec || 99999)));

  return (
    <View style={screenStyles.container}>
      <View style={styles.hero}>
        <Image source={session.cover} style={styles.cover} />
        <View style={styles.overlay} />

        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>
          {t(`meditations.items.${session.id}.title`, { defaultValue: session.title })}
        </Text>
          <Text style={styles.heroSub}>
          {t(`meditations.items.${session.id}.description`, { defaultValue: session.description })}
        </Text>

          {/* Barra + tiempos */}
          <View style={styles.sliderWrap}>
            <Slider
              value={showPos}
              minimumValue={0}
              maximumValue={Math.max(1, durSec || lastToSec || 1)}
              minimumTrackTintColor="rgba(255,255,255,0.95)"
              maximumTrackTintColor="rgba(255,255,255,0.30)"
              thumbTintColor="rgba(255,255,255,0.95)"
              onSlidingStart={() => {
                draggingRef.current = true;
              }}
              onValueChange={(v) => setDragSec(Math.floor(v))}
              onSlidingComplete={(v) => {
                draggingRef.current = false;
                setDragSec(null);
                void seekTo(Math.floor(v), false); // no autoPlay aquí, solo mover
              }}
            />

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{posLabel}</Text>
              <Text style={styles.timeText}>{totalLabel}</Text>
            </View>
          </View>

          {/* Controles tipo “imagen” */}
          <View style={styles.controlsRow}>
            <Pressable
              onPress={() => setSettingsOpen(true)}
              style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.9 }]}
            >
              <MaterialCommunityIcons name="tune-vertical" size={20} color="#fff" />
            </Pressable>

            <Pressable
              onPress={() => void jump(-15)}
              style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.9 }]}
            >
              <MaterialCommunityIcons name="rewind-15" size={22} color="#fff" />
            </Pressable>

            <Pressable
              onPress={() => void playPause()}
              style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.9 }]}
            >
              <MaterialCommunityIcons name={isPlaying ? "pause" : "play"} size={30} color="#fff" />
            </Pressable>

            <Pressable
              onPress={() => void jump(15)}
              style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.9 }]}
            >
              <MaterialCommunityIcons name="fast-forward-15" size={22} color="#fff" />
            </Pressable>

            <Pressable
              onPress={() => void stop()}
              style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.9 }]}
            >
              <MaterialCommunityIcons name="square" size={18} color="#fff" />
            </Pressable>
          </View>

          {!isLoaded ? <Text style={styles.loadingHint}>{t("meditations.player.loadingAudio")}</Text> : null}
        </View>
      </View>

      <View style={{ height: 14 }} />
      <Text style={styles.stepsTitle}>{t("meditations.player.stepsTitle")}</Text>

      <FlatList
        data={session.steps}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
        renderItem={({ item, index }) => {
          const active = index === activeStepIndex;
          const stepDuration = mmss(item.toSec - item.fromSec);
          const hintKey = `meditations.items.${session.id}.steps.${index}.hint`;
          const hintText = i18n.exists(hintKey) ? t(hintKey) : "";



          return (
            <View>
              <Pressable
                onPress={() => void seekTo(item.fromSec, true)}
                style={({ pressed }) => [
                  styles.stepCard,
                  active && styles.stepActive,
                  pressed && { opacity: 0.92 },
                ]}
              >
                <View style={styles.stepRow}>
                  <View style={[styles.stepDot, active && styles.stepDotActive]} />
                  <Text style={[styles.stepText, active && styles.stepTextActive]}>
                    {t(`meditations.items.${session.id}.steps.${index}.title`, { defaultValue: item.title })}
                  </Text>
                  <Text style={styles.stepTime}>{stepDuration}</Text>
                </View>
              </Pressable>

              {/* ✅ Caja resumen SOLO bajo el paso activo */}
              {active && hintText ? (
                <View style={styles.stepHintBox}>
                  <Text style={styles.stepHintText}>{hintText}</Text>
                </View>
              ) : null}
            </View>
          );
        }}
      />

      {/* Modal ajustes volumen */}
      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t("meditations.player.settingsTitle")}</Text>
            <Text style={styles.modalLabel}>{t("meditations.player.volume")}</Text>

            <Slider
              value={volume}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="rgba(74,74,74,0.25)"
              thumbTintColor={colors.primary}
              onValueChange={(v) => void setPlayerVolume(v)}
            />

            <Text style={styles.modalSmall}>
              {Math.round(volume * 100)}%
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
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
  cover: { width: "100%", height: 250 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.28)" },
  heroText: { position: "absolute", left: 14, right: 14, bottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  heroSub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "600",
  },

  sliderWrap: { marginTop: 12 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  timeText: { color: "rgba(255,255,255,0.92)", fontWeight: "900", fontSize: 12 },

  controlsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  ctrlBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingHint: { marginTop: 8, fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.85)" },

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

  // ✅ hint bajo paso activo
  stepHintBox: {
    marginTop: 6,
    marginLeft: 10,
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(155, 125, 210, 0.55)", // lavanda más fuerte
    borderWidth: 1,
    borderColor: "rgba(155, 125, 210, 0.65)",
  },
  stepHintText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.28)", padding: 18, justifyContent: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(198, 183, 226, 0.35)" },
  modalTitle: { fontSize: 15, fontWeight: "900", color: colors.text, marginBottom: 12 },
  modalLabel: { fontSize: 12, fontWeight: "900", color: "rgba(74,74,74,0.7)", marginBottom: 6 },
  modalSmall: { marginTop: 8, textAlign: "center", fontSize: 12, fontWeight: "900", color: colors.primary },
});
