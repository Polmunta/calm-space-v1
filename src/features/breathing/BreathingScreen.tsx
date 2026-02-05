import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  Animated,
  Easing,
  ScrollView,
  Switch,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";


import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

type Mode = {
  id: "calma" | "antiestres" | "cuadrada" | "suave" | "sueno";
  title: string;
  subtitle: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
};

const MODES_BASE: Omit<Mode, "title" | "subtitle">[] = [
  { id: "calma", inhale: 4, hold: 4, exhale: 6, rest: 0 },
  { id: "antiestres", inhale: 4, hold: 2, exhale: 6, rest: 0 },
  { id: "cuadrada", inhale: 4, hold: 4, exhale: 4, rest: 4 },
  { id: "suave", inhale: 3, hold: 1, exhale: 5, rest: 0 },
  { id: "sueno", inhale: 4, hold: 0, exhale: 8, rest: 0 },
];


type Phase = "idle" | "countdown" | "inhale" | "hold" | "exhale" | "rest" | "paused";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mmssFromSeconds(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type AmbientId = "lluvia" | "olas" | "bosque";

const AMBIENT_BY_MODE: Record<Mode["id"], AmbientId> = {
  calma: "lluvia",
  antiestres: "lluvia",
  sueno: "olas",
  cuadrada: "bosque",
  suave: "lluvia",
};

const AMBIENT_FILES: Record<AmbientId, any> = {
  lluvia: require("../../../assets/audio/lluvia.wav"),
  olas: require("../../../assets/audio/olas.wav"),
  bosque: require("../../../assets/audio/bosque.wav"),
};

type TotalPreset = "libre" | "5" | "10";

export default function BreathingScreen({ route, navigation }: any) {
  const { t } = useTranslation();
    const MODES: Mode[] = useMemo(
    () =>
      MODES_BASE.map((m) => ({
        ...m,
        title: t(`breathing.modes.${m.id}.title`),
        subtitle: t(`breathing.modes.${m.id}.subtitle`),
      })),
    [t]
  );

  const { i18n } = useTranslation();

  const initialModeId = (route?.params?.modeId as Mode["id"] | undefined) ?? MODES[0].id;

  const [modeId, setModeId] = useState<Mode["id"]>(initialModeId);
  const mode = useMemo(
   () => MODES.find((m) => m.id === modeId) ?? MODES[0],
   [modeId, i18n.language]
  );


  const [pickerOpen, setPickerOpen] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [phaseLeft, setPhaseLeft] = useState(0);
  const [breathsDone, setBreathsDone] = useState(0);

  // ⏱️ tiempo total: preset + override (rutina)
  const [totalPreset, setTotalPreset] = useState<TotalPreset>("libre");
  const presetLimitSec = totalPreset === "5" ? 5 * 60 : totalPreset === "10" ? 10 * 60 : null;

  const [totalLimitOverrideSec, setTotalLimitOverrideSec] = useState<number | null>(null);

  const totalLimitSec = totalLimitOverrideSec ?? presetLimitSec;
  const [totalElapsed, setTotalElapsed] = useState(0);
  const remainingSec = totalLimitSec == null ? null : Math.max(0, totalLimitSec - totalElapsed);

  // 🔈 ambiente
  const [ambientOn, setAmbientOn] = useState(false);
  const ambientSoundRef = useRef<Audio.Sound | null>(null);
  const ambientBusyRef = useRef(false);

  const runningRef = useRef(false);

  const tickTimerRef = useRef<any>(null);
  const phaseTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const totalTimerRef = useRef<any>(null);

  const scale = useRef(new Animated.Value(0.55)).current;
  const glow = useRef(new Animated.Value(0.35)).current;

  // ✅ evita que el efecto de params se dispare en bucle
  const lastParamsKeyRef = useRef<string>("");

  // ---------- AUDIO MODE ----------
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
  }, []);

  const clearAllTimers = useCallback(() => {
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);

    tickTimerRef.current = null;
    phaseTimerRef.current = null;
    countdownTimerRef.current = null;
    totalTimerRef.current = null;
  }, []);

  const stopAnimations = useCallback(() => {
    scale.stopAnimation();
    glow.stopAnimation();
  }, [glow, scale]);

  const stopAmbient = useCallback(async () => {
    if (ambientBusyRef.current) return;
    ambientBusyRef.current = true;
    try {
      if (ambientSoundRef.current) {
        try { await ambientSoundRef.current.pauseAsync(); } catch {}
        try { await ambientSoundRef.current.unloadAsync(); } catch {}
        ambientSoundRef.current = null;
      }
    } finally {
      ambientBusyRef.current = false;
    }
  }, []);

  const startAmbient = useCallback(async () => {
    if (!ambientOn) return;

    const ambientId = AMBIENT_BY_MODE[mode.id] ?? "lluvia";
    const file = AMBIENT_FILES[ambientId];
    if (!file) return;

    await stopAmbient();

    try {
      const { sound } = await Audio.Sound.createAsync(file, {
        shouldPlay: true,
        isLooping: true,
        volume: 0.35,
      });
      ambientSoundRef.current = sound;
    } catch {}
  }, [ambientOn, mode.id, stopAmbient]);

  const stopEverything = useCallback(async () => {
    runningRef.current = false;
    clearAllTimers();
    stopAnimations();

    setPhase("idle");
    setCountdown(3);
    setPhaseLeft(0);
    setBreathsDone(0);
    setTotalElapsed(0);

    Animated.timing(scale, {
      toValue: 0.55,
      duration: 260,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();

    Animated.timing(glow, {
      toValue: 0.35,
      duration: 260,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();

    await stopAmbient();
  }, [clearAllTimers, glow, scale, stopAmbient, stopAnimations]);

  // ✅ al salir de pantalla: parar todo SIEMPRE (tabs/back)
  useFocusEffect(
    useCallback(() => {
      return () => {
        void stopEverything();
      };
    }, [stopEverything])
  );

  useEffect(() => {
    const unsub = navigation?.addListener?.("blur", () => {
      void stopEverything();
    });
    return unsub;
  }, [navigation, stopEverything]);

  const onToggleAmbient = useCallback(
    async (next: boolean) => {
      setAmbientOn(next);

      // ✅ Si NO está corriendo, NUNCA reproducir audio
      if (!runningRef.current) {
        await stopAmbient();
        return;
      }

      // ✅ Si está corriendo, aplicar
      if (!next) await stopAmbient();
      else await startAmbient();
    },
    [startAmbient, stopAmbient]
  );

  const animateToOver = useCallback(
    (toScale: number, durationMs: number) => {
      stopAnimations();
      Animated.parallel([
        Animated.timing(scale, {
          toValue: toScale,
          duration: Math.max(120, durationMs),
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(glow, {
          toValue: toScale > 0.85 ? 0.55 : 0.35,
          duration: Math.max(120, durationMs),
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ]).start();
    },
    [glow, scale, stopAnimations]
  );

  const hapticPhase = async (next: Phase) => {
    try {
      if (next === "inhale") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (next === "hold") await Haptics.selectionAsync();
      if (next === "exhale") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (next === "rest") await Haptics.selectionAsync();
    } catch {}
  };

  const startTotalTimer = useCallback(() => {
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    totalTimerRef.current = setInterval(() => {
      setTotalElapsed((t) => t + 1);
    }, 1000);
  }, []);

  const startPhase = useCallback(
    (next: Phase) => {
      if (!runningRef.current) return;

      setPhase(next);
      void hapticPhase(next);

      const secs =
        next === "inhale" ? mode.inhale :
        next === "hold" ? mode.hold :
        next === "exhale" ? mode.exhale :
        next === "rest" ? mode.rest : 0;

      setPhaseLeft(secs);

      if (next === "inhale") animateToOver(1.05, secs * 1000);
      if (next === "hold") {
        stopAnimations();
        Animated.timing(glow, {
          toValue: 0.55,
          duration: 180,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }).start();
      }
      if (next === "exhale") animateToOver(0.6, secs * 1000);
      if (next === "rest") animateToOver(0.55, secs * 1000);

      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
      tickTimerRef.current = setInterval(() => {
        setPhaseLeft((prev) => clamp(prev - 1, 0, 9999));
      }, 1000);

      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = setTimeout(() => {
        if (!runningRef.current) return;

        if (next === "exhale" && mode.rest === 0) setBreathsDone((b) => b + 1);
        if (next === "rest") setBreathsDone((b) => b + 1);

        if (next === "inhale") {
          if (mode.hold > 0) startPhase("hold");
          else startPhase("exhale");
        } else if (next === "hold") {
          startPhase("exhale");
        } else if (next === "exhale") {
          if (mode.rest > 0) startPhase("rest");
          else startPhase("inhale");
        } else if (next === "rest") {
          startPhase("inhale");
        }
      }, secs * 1000);
    },
    [animateToOver, glow, mode.exhale, mode.hold, mode.inhale, mode.rest, stopAnimations]
  );

  // ✅ auto-stop si hay límite
  useEffect(() => {
    if (!runningRef.current) return;
    if (totalLimitSec == null) return;

    if (totalElapsed >= totalLimitSec) {
      void stopEverything();
    }
  }, [totalElapsed, totalLimitSec, stopEverything]);

  // ✅ ESTO es lo que te estaba “rompiendo”: ahora es estable con useCallback
  const startCountdownThenRun = useCallback(async () => {
    clearAllTimers();
    runningRef.current = true;

    setBreathsDone(0);
    setTotalElapsed(0);

    setCountdown(3);
    setPhase("countdown");

    animateToOver(0.75, 300);
    startTotalTimer();

    // ✅ arranca ambiente SOLO cuando se inicia (y sin solapes)
    await stopAmbient();
    if (ambientOn) await startAmbient();

    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        const next = c - 1;
        if (next <= 0) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          startPhase("inhale");
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [
    ambientOn,
    animateToOver,
    clearAllTimers,
    startAmbient,
    startPhase,
    startTotalTimer,
    stopAmbient,
  ]);

  const onPressStartPause = useCallback(async () => {
    const isRunningPhase =
      phase === "inhale" || phase === "hold" || phase === "exhale" || phase === "rest";

    if (runningRef.current && isRunningPhase) {
      runningRef.current = false;
      clearAllTimers();
      stopAnimations();
      setPhase("paused");

      try {
        if (ambientSoundRef.current) await ambientSoundRef.current.pauseAsync();
      } catch {}
      return;
    }

    if (phase === "paused") {
      runningRef.current = true;
      startTotalTimer();

      try {
        if (ambientOn && ambientSoundRef.current) await ambientSoundRef.current.playAsync();
        if (ambientOn && !ambientSoundRef.current) await startAmbient();
      } catch {}

      startPhase("inhale");
      return;
    }

    await startCountdownThenRun();
  }, [
    ambientOn,
    clearAllTimers,
    phase,
    startAmbient,
    startCountdownThenRun,
    startPhase,
    startTotalTimer,
    stopAnimations,
  ]);

  const onReset = useCallback(async () => {
    runningRef.current = false;
    clearAllTimers();
    stopAnimations();

    setBreathsDone(0);
    setTotalElapsed(0);

    setPhase("idle");
    setCountdown(3);
    setPhaseLeft(0);

    animateToOver(0.55, 260);
    await stopAmbient();
  }, [animateToOver, clearAllTimers, stopAmbient, stopAnimations]);

  // ✅ Params: aplicar modo / tiempo / ambient… SIN re-dispararse en bucle
  useEffect(() => {
    const nextId = route?.params?.modeId as Mode["id"] | undefined;
    const totalSeconds = route?.params?.totalSeconds as number | undefined;
    const ambientParam = route?.params?.ambientOn as boolean | undefined;

    const key = JSON.stringify({
      nextId: nextId ?? null,
      totalSeconds: typeof totalSeconds === "number" ? totalSeconds : null,
      ambientParam: typeof ambientParam === "boolean" ? ambientParam : null,
    });

    if (lastParamsKeyRef.current === key) return;
    lastParamsKeyRef.current = key;

    // si llegan params nuevos, corta todo para evitar solapes
    void stopEverything();

    if (nextId) setModeId(nextId);

    if (typeof totalSeconds === "number" && totalSeconds > 0) {
      setTotalLimitOverrideSec(Math.floor(totalSeconds));
      setTotalElapsed(0);
    }

    if (typeof ambientParam === "boolean") {
      setAmbientOn(ambientParam);
      void stopAmbient(); // ✅ jamás arrancar audio aquí
    }
  }, [route?.params?.modeId, route?.params?.totalSeconds, route?.params?.ambientOn, stopEverything, stopAmbient]);

   const phaseLabel =
    phase === "idle"
      ? t("breathing.phase.ready")
      : phase === "countdown"
      ? `${t("breathing.phase.startsIn")} ${countdown}`
      : phase === "inhale"
      ? `${t("breathing.phase.inhale")} · ${phaseLeft}s`
      : phase === "hold"
      ? `${t("breathing.phase.hold")} · ${phaseLeft}s`
      : phase === "exhale"
      ? `${t("breathing.phase.exhale")} · ${phaseLeft}s`
      : phase === "rest"
      ? `${t("breathing.phase.rest")} · ${phaseLeft}s`
      : t("breathing.phase.paused");

    const bigText =
    phase === "countdown"
      ? String(countdown)
      : phase === "idle"
      ? t("breathing.controls.start")
      : phase === "paused"
      ? t("breathing.phase.paused")
      : phase === "inhale"
      ? t("breathing.phase.inhale")
      : phase === "hold"
      ? t("breathing.phase.hold")
      : phase === "exhale"
      ? t("breathing.phase.exhale")
      : t("breathing.phase.rest");


  const cycleSeconds = mode.inhale + mode.hold + mode.exhale + mode.rest;

  return (
    <View style={screenStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={screenStyles.header}>
          <Text style={screenStyles.title}>{t("breathing.title")}</Text>
          <Text style={screenStyles.subtitle}>
            {t("breathing.subtitle")}</Text>
        </View>

        <View style={styles.card}>
          {/* Selector de modo */}
          <Pressable onPress={() => setPickerOpen(true)} style={({ pressed }) => [styles.modeBtn, pressed && { opacity: 0.92 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeSub}>{mode.subtitle}</Text>
            </View>

            <View style={styles.modeRight}>
              <Text style={styles.modeMeta}>
                {mode.inhale}-{mode.hold}-{mode.exhale}
                {mode.rest > 0 ? `-${mode.rest}` : ""}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color={colors.primary} />
            </View>
          </Pressable>

          {/* 🔈 Sonido ambiente */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>{t("breathing.ambient.title")}</Text>
              <Text style={styles.toggleSub}>
                {t("breathing.ambient.suggested")}{" "}
                {AMBIENT_BY_MODE[mode.id] === "lluvia"
                 ? t("breathing.ambient.rain")
                 : AMBIENT_BY_MODE[mode.id] === "olas"
                 ? t("breathing.ambient.waves")
                 : t("breathing.ambient.forest")}
             </Text>
            </View>
            <Switch value={ambientOn} onValueChange={(v) => void onToggleAmbient(v)} />
          </View>

          {/* ⏱️ Tiempo total */}
          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>{t("breathing.totalTime.title")}</Text>

            <View style={styles.presetPills}>
              <Pressable
                onPress={() => {
                  setTotalLimitOverrideSec(null);
                  setTotalPreset("5");
                }}
                style={({ pressed }) => [styles.pill, totalPreset === "5" && styles.pillActive, pressed && { opacity: 0.92 }]}
              >
                <Text style={[styles.pillText, totalPreset === "5" && styles.pillTextActive]}>{t("breathing.totalTime.five")}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setTotalLimitOverrideSec(null);
                  setTotalPreset("10");
                }}
                style={({ pressed }) => [styles.pill, totalPreset === "10" && styles.pillActive, pressed && { opacity: 0.92 }]}
              >
                <Text style={[styles.pillText, totalPreset === "10" && styles.pillTextActive]}>{t("breathing.totalTime.ten")}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setTotalLimitOverrideSec(null);
                  setTotalPreset("libre");
                }}
                style={({ pressed }) => [styles.pill, totalPreset === "libre" && styles.pillActive, pressed && { opacity: 0.92 }]}
              >
                <Text style={[styles.pillText, totalPreset === "libre" && styles.pillTextActive]}>{t("breathing.totalTime.free")}</Text>
              </Pressable>
            </View>

            <Text style={styles.smallTime}>
              {totalLimitSec == null
               ? `${t("breathing.totalTime.elapsed")}: ${mmssFromSeconds(totalElapsed)}`
               : `${t("breathing.totalTime.remaining")}: ${mmssFromSeconds(remainingSec ?? 0)}`}

            </Text>
          </View>

          {/* Visual */}
          <View style={styles.visualWrap}>
            <Animated.View style={[styles.glow, { opacity: glow, transform: [{ scale }] }]} />
            <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
              <Text style={styles.circleText}>{bigText}</Text>
            </Animated.View>
          </View>

          <Text style={styles.phaseLabel}>{phaseLabel}</Text>

          <View style={styles.controls}>
            <Pressable onPress={() => void onPressStartPause()} style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}>
              <MaterialCommunityIcons
                name={phase === "inhale" || phase === "hold" || phase === "exhale" || phase === "rest" ? "pause" : "play"}
                size={18}
                color="#fff"
              />
              <Text style={styles.primaryText}>
                {phase === "inhale" || phase === "hold" || phase === "exhale" || phase === "rest" ? t("breathing.controls.pause")
               : t("breathing.controls.start")}
              </Text>
            </Pressable>

            <Pressable onPress={() => void onReset()} style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}>
              <MaterialCommunityIcons name="restart" size={18} color={colors.text} />
              <Text style={styles.secondaryText}>{t("breathing.controls.reset")}</Text>
            </Pressable>
          </View>

          <Text style={styles.counter}>
           {t("breathing.stats.breaths")}: {breathsDone} · {t("breathing.stats.cycle")}: {cycleSeconds}s
          </Text>

          <Text style={styles.hint}>{t("breathing.hint")}</Text>

        </View>

        {/* Modal modos */}
        <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>{t("breathing.modal.title")}</Text>

              <FlatList
                data={MODES}
                keyExtractor={(m) => m.id}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => {
                  const active = item.id === modeId;
                  return (
                    <Pressable
                      onPress={() => {
                        void onReset();
                        setModeId(item.id);
                        setPickerOpen(false);
                      }}
                      style={({ pressed }) => [styles.modalItem, active && styles.modalItemActive, pressed && { opacity: 0.92 }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalItemTitle, active && { color: colors.primary }]}>{item.title}</Text>
                        <Text style={styles.modalItemSub}>{item.subtitle}</Text>
                      </View>

                      <Text style={styles.modalItemMeta}>
                        {item.inhale}-{item.hold}-{item.exhale}
                        {item.rest > 0 ? `-${item.rest}` : ""}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },

  modeBtn: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modeTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  modeSub: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.7)" },
  modeRight: { alignItems: "flex-end" },
  modeMeta: { fontSize: 12, fontWeight: "900", color: "rgba(74,74,74,0.65)", marginBottom: 2 },

  toggleRow: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toggleTitle: { fontSize: 13, fontWeight: "900", color: colors.text },
  toggleSub: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.65)" },

  presetRow: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  presetLabel: { fontSize: 13, fontWeight: "900", color: colors.text, marginBottom: 10 },
  presetPills: { flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(198, 183, 226, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.28)",
    alignItems: "center",
  },
  pillActive: { backgroundColor: "rgba(198, 183, 226, 0.30)", borderColor: colors.primary },
  pillText: { fontSize: 12, fontWeight: "900", color: "rgba(74,74,74,0.70)" },
  pillTextActive: { color: colors.primary },

  smallTime: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(74,74,74,0.70)",
  },

  visualWrap: { marginTop: 12, alignItems: "center", justifyContent: "center", height: 200 },
  glow: { position: "absolute", width: 190, height: 190, borderRadius: 999, backgroundColor: "rgba(198, 183, 226, 0.35)" },
  circle: {
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: "rgba(198, 183, 226, 0.25)",
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: { fontSize: 18, fontWeight: "900", color: colors.primary },

  phaseLabel: { textAlign: "center", marginTop: 6, fontSize: 13, fontWeight: "800", color: "rgba(74,74,74,0.75)" },

  controls: { flexDirection: "row", gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  secondaryText: { color: colors.text, fontWeight: "900", fontSize: 14 },

  counter: { marginTop: 12, textAlign: "center", fontSize: 12, fontWeight: "800", color: "rgba(74,74,74,0.7)" },
  hint: { marginTop: 10, textAlign: "center", fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.62)" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", padding: 18, justifyContent: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(198, 183, 226, 0.35)" },
  modalTitle: { fontSize: 15, fontWeight: "900", color: colors.text, marginBottom: 10 },
  modalItem: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalItemActive: { borderColor: colors.primary },
  modalItemTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  modalItemSub: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.7)" },
  modalItemMeta: { fontSize: 12, fontWeight: "900", color: "rgba(74,74,74,0.65)" },
});
