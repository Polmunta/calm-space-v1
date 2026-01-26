import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";
import {
  getAIReflection,
  type JournalMode,
  type JournalSuggestion,
} from "../../services/aiJournal.service";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  createdAt: number;
};

type Conversation = {
  id: string;
  createdAt: number;
  title: string;
  mode: JournalMode;
  messages: Message[];
};

const STORAGE_KEY_V1_CONV = "calmspace.journal.conversations.v1";
const STORAGE_KEY_V2_CONV = "calmspace.journal.conversations.v2";
const STORAGE_KEY_V3_CONV = "calmspace.journal.conversations.v3";
const STORAGE_KEY_V1_LEGACY = "calmspace.journal.v1";

const STORAGE_KEY = STORAGE_KEY_V3_CONV;

const MAX_CONVERSATIONS = 10;
const MAX_MESSAGES_PER_CONVERSATION = 60;
const MAX_CHARS_PER_MESSAGE = 1000;

function formatTitle(ts: number) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${mi}`;
}

function safeParseArray(raw: string | null): any[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeConversationAny(c: any): Conversation | null {
  if (!c || typeof c !== "object") return null;

  const id = String(c.id ?? c.createdAt ?? Date.now());
  const createdAt = Number(c.createdAt ?? Date.now());
  const title = String(c.title ?? formatTitle(createdAt));
  const mode: JournalMode = (c.mode as JournalMode) ?? "suave";

  const messagesRaw = Array.isArray(c.messages) ? c.messages : [];
  const messages: Message[] = messagesRaw
    .map((m: any, idx: number) => {
      const role = m?.role === "ai" ? "ai" : m?.role === "user" ? "user" : null;
      if (!role) return null;

      const text = String(m?.text ?? "");
      const created = Number(m?.createdAt ?? createdAt + idx);

      return {
        id: String(m?.id ?? `${id}-${created}-${role}-${idx}`),
        role,
        text,
        createdAt: created,
      } as Message;
    })
    .filter(Boolean) as Message[];

  return { id, createdAt, title, mode, messages };
}

function normalizeFromArray(arr: any[] | null): Conversation[] {
  if (!arr || !Array.isArray(arr)) return [];
  const normalized = arr
    .map((c) => normalizeConversationAny(c))
    .filter(Boolean) as Conversation[];

  // ordenar por createdAt desc (no te importa el orden, pero así queda bien)
  normalized.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return normalized;
}

// Unir conversaciones sin duplicarlas (por id). Si se repiten, nos quedamos con la que tenga más mensajes.
function mergeConversations(lists: Conversation[][]): Conversation[] {
  const map = new Map<string, Conversation>();

  for (const list of lists) {
    for (const c of list) {
      const prev = map.get(c.id);
      if (!prev) {
        map.set(c.id, c);
      } else {
        const prevCount = prev.messages?.length ?? 0;
        const nextCount = c.messages?.length ?? 0;
        map.set(c.id, nextCount > prevCount ? c : prev);
      }
    }
  }

  const merged = Array.from(map.values());

  // recortar mensajes por conversación y ordenar mensajes por tiempo
  const cleaned = merged.map((c) => {
    const sortedMsgs = [...(c.messages ?? [])].sort(
      (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
    );
    const trimmed =
      sortedMsgs.length > MAX_MESSAGES_PER_CONVERSATION
        ? sortedMsgs.slice(sortedMsgs.length - MAX_MESSAGES_PER_CONVERSATION)
        : sortedMsgs;

    return { ...c, mode: c.mode ?? "suave", messages: trimmed };
  });

  cleaned.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  // máximo 10 conversaciones
  return cleaned.slice(0, MAX_CONVERSATIONS);
}

export default function JournalScreen({ navigation }: any) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<JournalSuggestion[]>([]);

  const lastTrimNoticeAtRef = useRef<number>(0);
  const didMigrateRef = useRef(false);

  // ✅ CARGA + MIGRACIÓN DEFINITIVA A V3 (fusiona v1/v2/v3)
  useEffect(() => {
    (async () => {
      try {
        // 1) cargar arrays si existen
        const rawV3 = await AsyncStorage.getItem(STORAGE_KEY_V3_CONV);
        const rawV2 = await AsyncStorage.getItem(STORAGE_KEY_V2_CONV);
        const rawV1Conv = await AsyncStorage.getItem(STORAGE_KEY_V1_CONV);
        const rawV1Legacy = await AsyncStorage.getItem(STORAGE_KEY_V1_LEGACY);

        const v3List = normalizeFromArray(safeParseArray(rawV3));
        const v2List = normalizeFromArray(safeParseArray(rawV2));
        const v1List = normalizeFromArray(safeParseArray(rawV1Conv));

        // legacy puede ser:
        // - un array de conversaciones
        // - o un objeto con { conversations: [...] }
        let legacyList: Conversation[] = [];
        if (rawV1Legacy) {
          try {
            const parsed = JSON.parse(rawV1Legacy);
            if (Array.isArray(parsed)) {
              legacyList = normalizeFromArray(parsed);
            } else if (parsed && Array.isArray(parsed.conversations)) {
              legacyList = normalizeFromArray(parsed.conversations);
            }
          } catch {
            // ignore
          }
        }

        const merged = mergeConversations([v3List, v2List, v1List, legacyList]);

        if (merged.length > 0) {
          setConversations(merged);
          setActiveId(merged[0].id);

          // 2) guardar en v3 (migración definitiva)
          if (!didMigrateRef.current) {
            didMigrateRef.current = true;
            await AsyncStorage.setItem(STORAGE_KEY_V3_CONV, JSON.stringify(merged));
          }
          return;
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // ✅ Guardado (siempre en v3)
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      } catch {
        // ignore
      }
    })();
  }, [conversations]);

  // Si no hay conversación, crear 1
  useEffect(() => {
    if (conversations.length === 0 && activeId === null) {
      const now = Date.now();
      const first: Conversation = {
        id: String(now),
        createdAt: now,
        title: formatTitle(now),
        mode: "suave",
        messages: [],
      };
      setConversations([first]);
      setActiveId(first.id);
    }
  }, [conversations.length, activeId]);

  const activeConversation = useMemo(() => {
    if (!activeId) return null;
    return conversations.find((c) => c.id === activeId) ?? null;
  }, [conversations, activeId]);

  const headerSubtitle = useMemo(() => {
    const n = conversations.length;
    return n === 1
      ? "Escribe y recibe una reflexión guiada."
      : `Guardadas ${n} conversaciones (máx ${MAX_CONVERSATIONS}).`;
  }, [conversations.length]);

  const createNewConversation = () => {
    const now = Date.now();
    const conv: Conversation = {
      id: String(now),
      createdAt: now,
      title: formatTitle(now),
      mode: "suave",
      messages: [],
    };

    setConversations((prev) => {
      const next = [conv, ...prev];
      return next.slice(0, MAX_CONVERSATIONS);
    });

    setActiveId(conv.id);
    setText("");
    setSuggestions([]);
  };

  const maybeShowTrimNotice = () => {
    const now = Date.now();
    if (now - lastTrimNoticeAtRef.current < 30_000) return;
    lastTrimNoticeAtRef.current = now;

    Alert.alert(
      "Diario",
      "Para que la app no pese demasiado, esta conversación guarda solo los últimos mensajes (límite de 30 turnos)."
    );
  };

  const appendMessagesToActive = (msgs: Message[]) => {
    if (!activeId) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;

        const combined = [...c.messages, ...msgs];
        const exceeded = combined.length > MAX_MESSAGES_PER_CONVERSATION;

        const trimmed = exceeded
          ? combined.slice(combined.length - MAX_MESSAGES_PER_CONVERSATION)
          : combined;

        if (exceeded) setTimeout(() => maybeShowTrimNotice(), 0);

        return { ...c, messages: trimmed };
      })
    );
  };

  const setModeForActive = (mode: JournalMode) => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, mode } : c))
    );
  };

  const onSend = async () => {
    if (!activeConversation) return;

    const raw = text.trim();
    if (!raw) {
      Alert.alert("Diario", "Escribe algo antes de enviar.");
      return;
    }

    const userText = raw.slice(0, MAX_CHARS_PER_MESSAGE);
    if (raw.length > MAX_CHARS_PER_MESSAGE) {
      Alert.alert(
        "Diario",
        `He recortado tu mensaje a ${MAX_CHARS_PER_MESSAGE} caracteres para mantener el diario ligero.`
      );
    }

    try {
      setLoading(true);

      const context = activeConversation.messages
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      const result = await getAIReflection(
        userText,
        context,
        activeConversation.mode
      );

      setSuggestions(result.suggestions);

      const now = Date.now();
      const newMsgs: Message[] = [
        { id: `${now}-u`, role: "user", text: userText, createdAt: now },
        { id: `${now}-a`, role: "ai", text: result.text, createdAt: now + 1 },
      ];

      appendMessagesToActive(newMsgs);
      setText("");
    } catch (e: any) {
      Alert.alert("Error", String(e?.message ?? "No se pudo generar la reflexión."));
    } finally {
      setLoading(false);
    }
  };

  const onClearActive = () => {
    if (!activeConversation) return;

    Alert.alert("Borrar conversación", "¿Quieres borrar solo esta conversación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: () => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConversation.id ? { ...c, messages: [] } : c
            )
          );
          setSuggestions([]);
        },
      },
    ]);
  };

  const onClearAll = () => {
    Alert.alert("Borrar todo", "¿Borrar todas las conversaciones guardadas?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar todo",
        style: "destructive",
        onPress: async () => {
          setConversations([]);
          setActiveId(null);
          setText("");
          setSuggestions([]);

          try {
            await AsyncStorage.removeItem(STORAGE_KEY_V3_CONV);
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  const messages = activeConversation?.messages ?? [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[screenStyles.container, { paddingBottom: 16 }]}>
        <View style={screenStyles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={screenStyles.title}>Diario</Text>
              <Text style={screenStyles.subtitle}>{headerSubtitle}</Text>
              <Text style={styles.activeHint}>
                Conversación actual:{" "}
                <Text style={{ fontWeight: "800" }}>
                  {activeConversation?.title ?? "-"}
                </Text>
              </Text>
            </View>

            <View style={styles.headerBtns}>
              <Pressable
                onPress={() => setPickerOpen(true)}
                style={({ pressed }) => [
                  styles.smallBtn,
                  pressed && styles.smallBtnPressed,
                ]}
              >
                <Text style={styles.smallBtnText}>Cambiar</Text>
              </Pressable>

              <Pressable
                onPress={createNewConversation}
                style={({ pressed }) => [
                  styles.smallBtnPrimary,
                  pressed && styles.smallBtnPressed,
                ]}
              >
                <Text style={styles.smallBtnPrimaryText}>Nueva</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.listWrap}>
          {messages.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Empieza cuando quieras</Text>
              <Text style={styles.emptyText}>
                Escribe una emoción o situación. Te responderé con una reflexión guiada.
              </Text>

              <View style={{ height: 10 }} />

              <Pressable
                onPress={onClearAll}
                style={({ pressed }) => [
                  styles.ghostBtn,
                  pressed && styles.ghostBtnPressed,
                ]}
              >
                <Text style={styles.ghostBtnText}>Borrar todo el historial</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(m) => m.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 12 }}
              renderItem={({ item }) => {
                const isUser = item.role === "user";
                return (
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.bubbleUser : styles.bubbleAI,
                    ]}
                  >
                    <Text style={styles.bubbleText}>{item.text}</Text>
                  </View>
                );
              }}
            />
          )}

          {suggestions.length > 0 && (
            <View style={styles.suggestRow}>
              {suggestions.includes("SOS") && (
                <Pressable
                  onPress={() => navigation.navigate("SOS")}
                  style={({ pressed }) => [
                    styles.suggestBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.suggestText}>Abrir SOS 60s</Text>
                </Pressable>
              )}

              {suggestions.includes("Breathing") && (
                <Pressable
                  onPress={() => navigation.navigate("Breathing")}
                  style={({ pressed }) => [
                    styles.suggestBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.suggestText}>Ir a Respiración</Text>
                </Pressable>
              )}

              {suggestions.includes("Sounds") && (
                <Pressable
                  onPress={() => navigation.navigate("Sounds")}
                  style={({ pressed }) => [
                    styles.suggestBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.suggestText}>Ir a Sonidos</Text>
                </Pressable>
              )}

              {suggestions.includes("Mindfulness") && (
                <Pressable
                  onPress={() => navigation.navigate("Mindfulness")}
                  style={({ pressed }) => [
                    styles.suggestBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.suggestText}>Atención plena</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        <View style={styles.composer}>
          <View style={styles.modeRow}>
            {(["suave", "practico", "preguntas", "breve"] as JournalMode[]).map(
              (m) => {
                const active = m === (activeConversation?.mode ?? "suave");
                return (
                  <Pressable
                    key={m}
                    onPress={() => setModeForActive(m)}
                    style={({ pressed }) => [
                      styles.modeChip,
                      active && styles.modeChipActive,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeText,
                        active && styles.modeTextActive,
                      ]}
                    >
                      {m === "suave"
                        ? "Suave"
                        : m === "practico"
                        ? "Práctico"
                        : m === "preguntas"
                        ? "Preguntas"
                        : "Breve"}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escribe aquí..."
            placeholderTextColor="rgba(74, 74, 74, 0.45)"
            multiline
            editable={!loading}
            style={styles.input}
          />

          <View style={styles.composerRow}>
            <Pressable
              onPress={onClearActive}
              disabled={loading}
              style={({ pressed }) => [
                styles.clearBtn,
                pressed && styles.clearBtnPressed,
              ]}
            >
              <Text style={styles.clearBtnText}>Borrar esta</Text>
            </Pressable>

            <Pressable
              onPress={onSend}
              disabled={loading}
              style={({ pressed }) => [
                styles.sendBtn,
                (pressed || loading) && styles.sendBtnPressed,
              ]}
            >
              <Text style={styles.sendBtnText}>
                {loading ? "..." : "Enviar"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Modal visible={pickerOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Conversaciones</Text>

              <FlatList
                data={conversations}
                keyExtractor={(c) => c.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isActive = item.id === activeId;
                  return (
                    <Pressable
                      onPress={() => {
                        setActiveId(item.id);
                        setPickerOpen(false);
                        setSuggestions([]);
                      }}
                      style={({ pressed }) => [
                        styles.convRow,
                        isActive && styles.convRowActive,
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <Text style={styles.convTitle}>{item.title}</Text>
                      <Text style={styles.convMeta}>
                        {item.messages.length} mensajes · Modo:{" "}
                        {item.mode === "suave"
                          ? "Suave"
                          : item.mode === "practico"
                          ? "Práctico"
                          : item.mode === "preguntas"
                          ? "Preguntas"
                          : "Breve"}
                      </Text>
                    </Pressable>
                  );
                }}
              />

              <View style={{ height: 10 }} />

              <Pressable
                onPress={() => setPickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && styles.modalClosePressed,
                ]}
              >
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerBtns: { gap: 10, alignItems: "flex-end" },
  activeHint: { marginTop: 8, fontSize: 12, color: "rgba(74, 74, 74, 0.65)" },

  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  smallBtnPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  smallBtnPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  smallBtnText: { color: colors.text, fontWeight: "800", fontSize: 12 },
  smallBtnPrimaryText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },

  listWrap: { flex: 1 },
  emptyCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 13, color: "rgba(74, 74, 74, 0.7)", lineHeight: 18 },

  bubble: { maxWidth: "92%", borderRadius: 16, padding: 12, marginBottom: 10 },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: "rgba(198, 183, 226, 0.35)" },
  bubbleAI: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  bubbleText: { color: colors.text, fontSize: 14, lineHeight: 19 },

  suggestRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10, marginBottom: 6 },
  suggestBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  suggestText: { fontSize: 12, fontWeight: "900", color: colors.text },

  composer: {
    marginTop: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    padding: 12,
    gap: 10,
  },

  modeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modeChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  modeChipActive: { backgroundColor: "rgba(198, 183, 226, 0.35)", borderColor: colors.primary },
  modeText: { fontSize: 12, fontWeight: "800", color: "rgba(74, 74, 74, 0.75)" },
  modeTextActive: { color: colors.text },

  input: {
    minHeight: 70,
    maxHeight: 160,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    color: colors.text,
    textAlignVertical: "top",
  },
  composerRow: { flexDirection: "row", gap: 10 },
  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  clearBtnPressed: { opacity: 0.9 },
  clearBtnText: { color: colors.text, fontWeight: "900", fontSize: 13 },
  sendBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  sendBtnPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  sendBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },

  ghostBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  ghostBtnPressed: { opacity: 0.9 },
  ghostBtnText: { color: colors.text, fontWeight: "800", fontSize: 12 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", padding: 20 },
  modalCard: {
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: colors.text, marginBottom: 12 },
  convRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    marginBottom: 10,
  },
  convRowActive: { borderColor: colors.primary },
  convTitle: { fontWeight: "900", color: colors.text, fontSize: 13 },
  convMeta: { marginTop: 4, fontSize: 12, color: "rgba(74, 74, 74, 0.65)" },
  modalClose: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  modalClosePressed: { opacity: 0.9 },
  modalCloseText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
});
