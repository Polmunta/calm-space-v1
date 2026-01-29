import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

import {
  MINDFULNESS_EXERCISES,
  MINDFULNESS_QUESTIONS,
  type MindfulnessExercise,
  type MindfulnessQuestion,
} from "./mindfulness.data";

import {
  loadFavorites,
  saveFavorites,
  loadSeen,
  saveSeen,
  clearSeen,
  loadLastMode,
  saveLastMode,
} from "./mindfulness.storage";

type Mode = "preguntas" | "ejercicios";
type QuestionFilter = "all" | "fav";

function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function MindfulnessScreen() {
  const [mode, setMode] = useState<Mode>("preguntas");
  const [qFilter, setQFilter] = useState<QuestionFilter>("all");

  // Favoritas (ids)
  const [favorites, setFavorites] = useState<string[]>([]);
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  // “No repetir hasta completar todas”
  const [seenAll, setSeenAll] = useState<string[]>([]);
  const [seenFav, setSeenFav] = useState<string[]>([]);
  const seenAllSet = useMemo(() => new Set(seenAll), [seenAll]);
  const seenFavSet = useMemo(() => new Set(seenFav), [seenFav]);

  // Historial para botón “Anterior”
  const historyRef = useRef<string[]>([]);
  const [currentQId, setCurrentQId] = useState<string | null>(null);

  // Ejercicios
  const [activeExerciseId, setActiveExerciseId] = useState<MindfulnessExercise["id"]>("54321");
  const [stepIndex, setStepIndex] = useState(0);

  const activeExercise = useMemo(
    () => MINDFULNESS_EXERCISES.find((e) => e.id === activeExerciseId) ?? MINDFULNESS_EXERCISES[0],
    [activeExerciseId]
  );

  // Load persisted
  useEffect(() => {
    (async () => {
      const [favs, sa, sf, last] = await Promise.all([
        loadFavorites(),
        loadSeen("all"),
        loadSeen("fav"),
        loadLastMode(),
      ]);

      setFavorites(favs);
      setSeenAll(sa);
      setSeenFav(sf);
      setMode(last);

      // inicializa pregunta actual
      const first = MINDFULNESS_QUESTIONS[0]?.id ?? null;
      setCurrentQId(first);
    })();
  }, []);

  // Guardar modo
  useEffect(() => {
    void saveLastMode(mode);
  }, [mode]);

  // Lista de preguntas según filtro
  const filteredQuestions: MindfulnessQuestion[] = useMemo(() => {
    if (qFilter === "all") return MINDFULNESS_QUESTIONS;
    return MINDFULNESS_QUESTIONS.filter((q) => favSet.has(q.id));
  }, [qFilter, favSet]);

  const currentQuestion = useMemo(() => {
    if (!currentQId) return filteredQuestions[0] ?? null;
    return filteredQuestions.find((q) => q.id === currentQId) ?? filteredQuestions[0] ?? null;
  }, [currentQId, filteredQuestions]);

  const isFavMode = qFilter === "fav";

  const currentSeenSet = isFavMode ? seenFavSet : seenAllSet;
  const currentSeenArr = isFavMode ? seenFav : seenAll;

  const saveSeenCurrent = async (nextSeen: string[]) => {
    if (isFavMode) {
      setSeenFav(nextSeen);
      await saveSeen("fav", nextSeen);
    } else {
      setSeenAll(nextSeen);
      await saveSeen("all", nextSeen);
    }
  };

  const clearSeenCurrent = async () => {
    if (isFavMode) {
      setSeenFav([]);
      await clearSeen("fav");
    } else {
      setSeenAll([]);
      await clearSeen("all");
    }
  };

  // Cuando cambias a Favoritas y está vacío → fuerza a “Todas”
  useEffect(() => {
    if (qFilter === "fav" && filteredQuestions.length === 0) {
      setQFilter("all");
    }
  }, [qFilter, filteredQuestions.length]);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const next = favSet.has(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
      setFavorites(next);
      await saveFavorites(next);

      // si estabas en Favoritas y quitas la actual, salta a otra
      if (qFilter === "fav") {
        const list = MINDFULNESS_QUESTIONS.filter((q) => next.includes(q.id));
        if (list.length === 0) {
          setQFilter("all");
        } else if (currentQId && !next.includes(currentQId)) {
          setCurrentQId(list[0].id);
        }
      }
    },
    [favorites, favSet, qFilter, currentQId]
  );

  // ✅ “Siguiente” inteligente: no repite hasta completar todas
  const nextQuestion = useCallback(async () => {
    if (!currentQuestion) return;

    // mete la actual al historial para “Anterior”
    historyRef.current.push(currentQuestion.id);

    const allIds = filteredQuestions.map((q) => q.id);
    const remaining = allIds.filter((id) => !currentSeenSet.has(id));

    // si no quedan, resetea ciclo
    if (remaining.length === 0) {
      await clearSeenCurrent();
      // arrancamos nuevo ciclo: todo disponible
      const next = pickRandom(allIds);
      setCurrentQId(next);
      await saveSeenCurrent([next]);
      return;
    }

    // elige una de las no vistas (y evita repetir la actual si puede)
    const pool = remaining.filter((id) => id !== currentQuestion.id);
    const next = pickRandom(pool.length > 0 ? pool : remaining);

    setCurrentQId(next);

    const nextSeen = Array.from(new Set([...currentSeenArr, next]));
    await saveSeenCurrent(nextSeen);
  }, [
    currentQuestion,
    filteredQuestions,
    currentSeenSet,
    currentSeenArr,
    clearSeenCurrent,
    saveSeenCurrent,
  ]);

  const prevQuestion = useCallback(() => {
    const h = historyRef.current;
    if (h.length === 0) return;
    const prev = h.pop()!;
    setCurrentQId(prev);
  }, []);

  // UX: al cambiar filtro, resetea historial y elige una inicial
  useEffect(() => {
    historyRef.current = [];
    const first = filteredQuestions[0]?.id ?? null;
    setCurrentQId(first);
  }, [qFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ por si el usuario se va de la pantalla: no hace falta limpiar nada,
  // pero lo dejamos preparado si luego añades audio/haptics aquí.
  useFocusEffect(
    useCallback(() => {
      return () => {};
    }, [])
  );

  // Progreso del ciclo (visto / total)
  const cycleTotal = filteredQuestions.length;
  const cycleSeen = Math.min(currentSeenSet.size, cycleTotal);

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Preguntas de Atención Plena</Text>
        <Text style={screenStyles.subtitle}>
          Reflexiona con preguntas breves o haz un ejercicio rápido para volver al presente.
        </Text>
      </View>

      {/* Tabs principales */}
      <View style={styles.topTabs}>
        <Pressable
          onPress={() => setMode("preguntas")}
          style={({ pressed }) => [
            styles.topTab,
            mode === "preguntas" && styles.topTabActive,
            pressed && { opacity: 0.92 },
          ]}
        >
          <Text style={[styles.topTabText, mode === "preguntas" && styles.topTabTextActive]}>
            Preguntas
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("ejercicios")}
          style={({ pressed }) => [
            styles.topTab,
            mode === "ejercicios" && styles.topTabActive,
            pressed && { opacity: 0.92 },
          ]}
        >
          <Text style={[styles.topTabText, mode === "ejercicios" && styles.topTabTextActive]}>
            Ejercicios
          </Text>
        </Pressable>
      </View>

      {mode === "preguntas" ? (
        <>
          {/* Filtro: Todas / Favoritas */}
          <View style={styles.filterRow}>
            <Pressable
              onPress={() => setQFilter("all")}
              style={({ pressed }) => [
                styles.chip,
                qFilter === "all" && styles.chipActive,
                pressed && { opacity: 0.92 },
              ]}
            >
              <Text style={[styles.chipText, qFilter === "all" && styles.chipTextActive]}>Todas</Text>
            </Pressable>

            <Pressable
              onPress={() => setQFilter("fav")}
              disabled={favorites.length === 0}
              style={({ pressed }) => [
                styles.chip,
                qFilter === "fav" && styles.chipActive,
                favorites.length === 0 && { opacity: 0.5 },
                pressed && favorites.length > 0 && { opacity: 0.92 },
              ]}
            >
              <MaterialCommunityIcons
                name="heart"
                size={16}
                color={qFilter === "fav" ? colors.primary : "rgba(74,74,74,0.7)"}
              />
              <Text style={[styles.chipText, qFilter === "fav" && styles.chipTextActive]}>
                Favoritas
              </Text>
            </Pressable>

            <View style={{ flex: 1 }} />

            <Text style={styles.progressText}>
              {cycleSeen}/{cycleTotal}
            </Text>
          </View>

          {/* Card pregunta */}
          <View style={styles.bigCard}>
            <View style={styles.bigCardTop}>
              <Text style={styles.bigTitle}>Pregunta</Text>

              {currentQuestion ? (
                <Pressable
                  onPress={() => void toggleFavorite(currentQuestion.id)}
                  style={({ pressed }) => [styles.favBtn, pressed && { opacity: 0.9 }]}
                >
                  <MaterialCommunityIcons
                    name={favSet.has(currentQuestion.id) ? "heart" : "heart-outline"}
                    size={20}
                    color={favSet.has(currentQuestion.id) ? colors.primary : "rgba(74,74,74,0.7)"}
                  />
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.questionText}>
              {currentQuestion?.text ?? "Cargando…"}
            </Text>

            <View style={styles.qControls}>
              <Pressable
                onPress={prevQuestion}
                disabled={historyRef.current.length === 0}
                style={({ pressed }) => [
                  styles.navBtn,
                  historyRef.current.length === 0 && styles.navBtnDisabled,
                  pressed && historyRef.current.length > 0 && { opacity: 0.92 },
                ]}
              >
                <MaterialCommunityIcons name="chevron-left" size={20} color={colors.text} />
                <Text style={styles.navBtnText}>Anterior</Text>
              </Pressable>

              <Pressable
                onPress={() => void nextQuestion()}
                style={({ pressed }) => [styles.navBtnPrimary, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.navBtnPrimaryText}>Siguiente</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
              </Pressable>
            </View>

            <Text style={styles.hint}>
              Tip: si te distraes, vuelve a la respiración 1 vez y retoma.
            </Text>
          </View>
        </>
      ) : (
        <>
          {/* Grid ejercicios */}
          <FlatList
            data={MINDFULNESS_EXERCISES}
            keyExtractor={(i) => i.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
            renderItem={({ item }) => {
              const active = item.id === activeExerciseId;
              return (
                <Pressable
                  onPress={() => {
                    setActiveExerciseId(item.id);
                    setStepIndex(0);
                  }}
                  style={({ pressed }) => [
                    styles.exerciseTile,
                    active && styles.exerciseTileActive,
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  <Text style={[styles.exerciseTitle, active && { color: colors.primary }]}>
                    {item.title}
                  </Text>

                  {/* ✅ descripción breve (lo que pediste) */}
                  <Text style={styles.exerciseShort}>{item.short}</Text>
                </Pressable>
              );
            }}
          />

          {/* Detalle ejercicio */}
          <View style={styles.bigCard}>
            <Text style={styles.exerciseHeader}>{activeExercise.title}</Text>
            <Text style={styles.exerciseDesc}>{activeExercise.description}</Text>

            <View style={styles.stepBox}>
              <Text style={styles.stepTitle}>{activeExercise.steps[stepIndex]?.title}</Text>
              <Text style={styles.stepText}>{activeExercise.steps[stepIndex]?.text}</Text>

              <View style={styles.stepControls}>
                <Pressable
                  onPress={() => setStepIndex((i) => Math.max(0, i - 1))}
                  disabled={stepIndex === 0}
                  style={({ pressed }) => [
                    styles.navBtn,
                    stepIndex === 0 && styles.navBtnDisabled,
                    pressed && stepIndex > 0 && { opacity: 0.92 },
                  ]}
                >
                  <MaterialCommunityIcons name="chevron-left" size={20} color={colors.text} />
                  <Text style={styles.navBtnText}>Anterior</Text>
                </Pressable>

                <Pressable
                  onPress={() => setStepIndex((i) => Math.min(activeExercise.steps.length - 1, i + 1))}
                  disabled={stepIndex >= activeExercise.steps.length - 1}
                  style={({ pressed }) => [
                    styles.navBtnPrimary,
                    stepIndex >= activeExercise.steps.length - 1 && styles.navBtnDisabledPrimary,
                    pressed && stepIndex < activeExercise.steps.length - 1 && { opacity: 0.92 },
                  ]}
                >
                  <Text style={styles.navBtnPrimaryText}>Siguiente</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
                </Pressable>
              </View>

              <Text style={styles.hint}>{activeExercise.tip}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topTabs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  topTab: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  topTabActive: {
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    borderColor: colors.primary,
  },
  topTabText: {
    fontWeight: "900",
    color: "rgba(74,74,74,0.7)",
  },
  topTabTextActive: {
    color: colors.primary,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  chip: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
  },
  chipText: {
    fontWeight: "900",
    color: "rgba(74,74,74,0.7)",
  },
  chipTextActive: {
    color: colors.primary,
  },
  progressText: {
    fontWeight: "900",
    color: "rgba(74,74,74,0.65)",
  },

  bigCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },

  bigCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bigTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
  },
  favBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },

  questionText: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "900",
    color: colors.text,
  },

  qControls: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  // ✅ BOTONES NUEVOS (mejor padding + centrado + iconos)
  navBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  navBtnDisabled: {
    opacity: 0.55,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.text,
  },

  navBtnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  navBtnDisabledPrimary: {
    opacity: 0.55,
  },
  navBtnPrimaryText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#fff",
  },

  hint: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(74,74,74,0.62)",
  },

  // Ejercicios grid
  exerciseTile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    minHeight: 90,
  },
  exerciseTileActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(198, 183, 226, 0.18)",
  },
  exerciseTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
  },
  exerciseShort: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(74,74,74,0.65)",
  },

  exerciseHeader: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  exerciseDesc: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(74,74,74,0.7)",
  },

  stepBox: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.primary,
  },
  stepText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(74,74,74,0.78)",
  },
  stepControls: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
});
