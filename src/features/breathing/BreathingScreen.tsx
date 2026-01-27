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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

type ModeId = "calma" | "ansiedad" | "dormir" | "foco" | "cuerpo";

type Mode = {
  id: ModeId;
  title: string;
  subtitle: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
};

const MODES: Mode[] = [
  {
    id: "calma",
    title: "Calma (4–4–6)",
    subtitle: "Baja revoluciones y vuelve al centro.",
    inhale: 4,
    hold: 4,
    exhale: 6,
    rest: 0,
  },
  {
    id: "ansiedad",
    title: "Ansiedad (4–2–6)",
    subtitle: "Útil cuando estás acelerado o con nervios.",
    inhale: 4,
    hold: 2,
    exhale: 6,
    rest: 0,
  },
  {
    id: "dormir",
    title: "Dormir (4–0–8)",
    subtitle: "Exhala más largo para soltar tensión y conciliar sueño.",
    inhale: 4,
    hold: 0,
    exhale: 8,
    rest: 0,
  },
  {
    id: "foco",
    title: "Foco (4–4–4–4)",
    subtitle: "Equilibra y estabiliza: perfecto para concentrarte.",
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
  },
  {
    id: "cuerpo",
    title: "Soltar cuerpo (3–1–5)",
    subtitle: "Suave y progresivo para descargar tensión corporal.",
    inhale: 3,
    hold: 1,
    exhale: 5,
    rest: 0,
  },
];

type Phase = "idle" | "countdown" | "inhale" | "hold" | "exhale" | "rest" | "paused";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function BreathingScreen({ route, navigation }: any) {
  const initialModeId = ((route?.params?.modeId as ModeId | undefined) ?? "calma");

  const [modeId, setModeId] = useState<ModeId>(initialModeId);
  const mode = useMemo(() => MODES.find((m) => m.id === modeId) ?? MODES[0], [modeId]);

  const [pickerOpen, setPickerOpen] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [phaseLeft, setPhaseLeft] = useState(0);
  const [breathsDone, setBreathsDone] = useState(0);

  const runningRef = useRef(false);

  const tickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scale = useRef(new Animated.Value(0.55)).current;
  const glow = useRef(new Animated.Value(0.35)).current;

  // ✅ si entras desde SOS con preset, actualiza modo y limpia param
  useEffect(() => {
    const nextId = route?.params?.modeId as ModeId | undefined;
    if (nextId && nextId !== modeId) {
      onReset();
      setModeId(nextId);
      try {
        navigation.setParams({ modeId: undefined });
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.modeId]);

  const clearAllTimers = () => {
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    tickTimerRef.current = null;
    phaseTimerRef.current = null;
    countdownTimerRef.current = null;
  };

  const stopAnimations = () => {
    scale.stopAnimation();
    glow.stopAnimation();
  };

  const animateToOver = (toScale: number, durationMs: number) => {
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
  };

  const stopEverything = useCallback(() => {
    runningRef.current = false;
    clearAllTimers();
    stopAnimations();

    setPhase("idle");
    setCountdown(3);
    setPhaseLeft(0);

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
  }, [glow, scale]);

  // ✅ al salir de pantalla: detener
  useFocusEffect(
    useCallback(() => {
      return () => {
        stopEverything();
      };
    }, [stopEverything])
  );

  const startPhase = (next: Phase) => {
    if (!runningRef.current) return;

    setPhase(next);

    const secs =
      next === "inhale"
        ? mode.inhale
        : next === "hold"
        ? mode.hold
        : next === "exhale"
        ? mode.exhale
        : next === "rest"
        ? mode.rest
        : 0;

    setPhaseLeft(secs);

    // Animación suave
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

    // tick
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(() => {
      setPhaseLeft((prev) => clamp(prev - 1, 0, 9999));
    }, 1000);

    // avance de fase
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
  };

  const startCountdownThenRun = () => {
    clearAllTimers();
    runningRef.current = true;
    setBreathsDone(0);
    setCountdown(3);
    setPhase("countdown");

    animateToOver(0.75, 300);

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
  };

  // ✅ Pausa/reanuda sin romper continuidad
  const onPressStartPause = () => {
    const isRunningPhase =
      phase === "inhale" || phase === "hold" || phase === "exhale" || phase === "rest";

    if (runningRef.current && isRunningPhase) {
      runningRef.current = false;
      clearAllTimers();
      stopAnimations();
      setPhase("paused");
      return;
    }

    if (phase === "paused") {
      runningRef.current = true;

      // reanuda fase “lógica” (si no tenemos left, reentra en inhale)
      const resumePhase: Phase =
        phaseLeft > 0
          ? (phase === "paused" ? "inhale" : "inhale")
          : "inhale";

      // ✅ lo más estable: reanudar desde inhale si estabas pausado
      // (si quisieras continuidad exacta por milisegundo, habría que guardar timestamps)
      startPhase(resumePhase);
      return;
    }

    startCountdownThenRun();
  };

  const onReset = () => {
    runningRef.current = false;
    clearAllTimers();
    stopAnimations();
    setBreathsDone(0);
    setPhase("idle");
    setCountdown(3);
    setPhaseLeft(0);
    animateToOver(0.55, 260);
  };

  const phaseLabel =
    phase === "idle"
      ? "Listo"
      : phase === "countdown"
      ? `Empieza en ${countdown}`
      : phase === "inhale"
      ? `Inhala · ${phaseLeft}s`
      : phase === "hold"
      ? `Mantén · ${phaseLeft}s`
      : phase === "exhale"
      ? `Exhala · ${phaseLeft}s`
      : phase === "rest"
      ? `Pausa · ${phaseLeft}s`
      : "Pausado";

  const bigText =
    phase === "countdown"
      ? String(countdown)
      : phase === "idle"
      ? "Comenzar"
      : phase === "paused"
      ? "Pausado"
      : phase === "inhale"
      ? "Inhala"
      : phase === "hold"
      ? "Mantén"
      : phase === "exhale"
      ? "Exhala"
      : "Pausa";

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Ejercicio de Respiración</Text>
        <Text style={screenStyles.subtitle}>
          Sigue la guía visual para practicar respiración consciente. Elige el modo que más te encaje hoy.
        </Text>
      </View>

      <View style={styles.card}>
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.modeBtn, pressed && { opacity: 0.92 }]}
        >
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

        <View style={styles.visualWrap}>
          <Animated.View style={[styles.glow, { opacity: glow, transform: [{ scale }] }]} />
          <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
            <Text style={styles.circleText}>{bigText}</Text>
          </Animated.View>
        </View>

        <Text style={styles.phaseLabel}>{phaseLabel}</Text>

        <View style={styles.controls}>
          <Pressable
            onPress={onPressStartPause}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          >
            <MaterialCommunityIcons
              name={
                phase === "inhale" || phase === "hold" || phase === "exhale" || phase === "rest"
                  ? "pause"
                  : "play"
              }
              size={18}
              color="#fff"
            />
            <Text style={styles.primaryText}>
              {phase === "inhale" || phase === "hold" || phase === "exhale" || phase === "rest"
                ? "Pausar"
                : "Comenzar"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onReset}
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
          >
            <MaterialCommunityIcons name="restart" size={18} color={colors.text} />
            <Text style={styles.secondaryText}>Reiniciar</Text>
          </Pressable>
        </View>

        <Text style={styles.counter}>Respiraciones realizadas: {breathsDone}</Text>

        <Text style={styles.hint}>
          Consejo: si estás tenso, prueba un modo con exhalación más larga (por ejemplo “Dormir” 4–0–8).
        </Text>
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Elige un modo</Text>

            <FlatList
              data={MODES}
              keyExtractor={(m) => m.id}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => {
                const active = item.id === modeId;
                return (
                  <Pressable
                    onPress={() => {
                      onReset();
                      setModeId(item.id);
                      setPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.modalItem,
                      active && styles.modalItemActive,
                      pressed && { opacity: 0.92 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalItemTitle, active && { color: colors.primary }]}>
                        {item.title}
                      </Text>
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

  visualWrap: { marginTop: 16, alignItems: "center", justifyContent: "center", height: 240 },

  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(198, 183, 226, 0.35)",
  },

  circle: {
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(198, 183, 226, 0.25)",
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: { fontSize: 20, fontWeight: "900", color: colors.primary },

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

  counter: { marginTop: 14, textAlign: "center", fontSize: 12, fontWeight: "800", color: "rgba(74,74,74,0.7)" },
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
