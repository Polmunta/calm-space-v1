import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Image, Modal, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

import { getProfileName, setProfileName } from "./profile.storage";
import { getProgress } from "./progress.storage";
import {
  getProfileAvatarUri,
  setProfileAvatarUri,
  clearProfileAvatarUri,
} from "./profile.storage";

function mmss(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

/** ✅ Avatares predefinidos (tú metes los PNG en assets/avatars) */
const PRESET_AVATARS = [
  { id: "a1", img: require("../../../assets/avatars/avatar1.png") },
  { id: "a2", img: require("../../../assets/avatars/avatar2.png") },
  { id: "a3", img: require("../../../assets/avatars/avatar3.png") },
  { id: "a4", img: require("../../../assets/avatars/avatar4.png") },
  { id: "a5", img: require("../../../assets/avatars/avatar5.png") },
  { id: "a6", img: require("../../../assets/avatars/avatar6.png") },
] as const;

export default function ProfileScreen() {
  const { t } = useTranslation();

  const [name, setNameState] = useState("");

  const [avatarUri, setAvatarUri] = useState<string>(""); // uri galería
  const [presetAvatarId, setPresetAvatarId] = useState<string>(""); // si quieres guardar id a futuro (opcional)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const [streak, setStreak] = useState(0);
  const [totalCalmSeconds, setTotalCalmSeconds] = useState(0);
  const [lastActivityLabel, setLastActivityLabel] = useState<string>("—");

  // Modal editar nombre
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    (async () => {
      const n = await getProfileName();
      setNameState(n);
      setDraftName(n);

      const a = await getProfileAvatarUri();
      setAvatarUri(a);

      const p = await getProgress();
      setStreak(p.streak ?? 0);
      setTotalCalmSeconds(p.totalCalmSeconds ?? 0);
      setLastActivityLabel(p.lastActivityLabel ?? "—");
    })();
  }, []);

  const openEditName = () => {
    setDraftName(name);
    setEditNameOpen(true);
  };

  const saveName = async () => {
    const trimmed = draftName.trim().slice(0, 20);
    setNameState(trimmed);
    await setProfileName(trimmed);
    setEditNameOpen(false);
  };

  /** ✅ Galería */
  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (res.canceled) return;

      const uri = res.assets?.[0]?.uri ?? "";
      if (!uri) return;

      setPresetAvatarId("");
      setAvatarUri(uri);
      await setProfileAvatarUri(uri);
      setAvatarPickerOpen(false);
    } catch {}
  };

  /** ✅ Elegir avatar preset (guardamos como “uri” falso usando id, pero visualmente renderizamos require) */
  const pickPreset = async (id: string) => {
    // guardamos "preset:a1" en avatarUri
    const value = `preset:${id}`;
    setPresetAvatarId(id);
    setAvatarUri(value);
    await setProfileAvatarUri(value);
    setAvatarPickerOpen(false);
  };

  const clearAvatar = async () => {
    setAvatarUri("");
    setPresetAvatarId("");
    await clearProfileAvatarUri();
  };

  const resolveAvatarSource = () => {
    // Si es preset
    if (avatarUri.startsWith("preset:")) {
      const id = avatarUri.replace("preset:", "");
      const found = PRESET_AVATARS.find((a) => a.id === id);
      return found?.img ?? null;
    }
    // Si es galería
    if (avatarUri) return { uri: avatarUri };
    return null;
  };

  const avatarSource = resolveAvatarSource();

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={styles.grayTitle}>{t("profile.title")}</Text>
        <Text style={screenStyles.subtitle}>{t("profile.subtitle")}</Text>
      </View>

      <View style={styles.profileRow}>
        <Pressable
          onPress={() => setAvatarPickerOpen(true)}
          style={({ pressed }) => [styles.avatarWrap, pressed && { opacity: 0.9 }]}
        >
          {avatarSource ? (
            <Image source={avatarSource as any} style={styles.avatarImg} />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={54} color={colors.primary} />
          )}
          <View style={styles.avatarBadge}>
            <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
          </View>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Pressable onPress={openEditName} style={({ pressed }) => pressed && { opacity: 0.9 }}>
            <Text style={styles.profileName}>
              {name?.trim() ? name : t("profile.yourName")}
            </Text>
            <Text style={styles.profileHint}>{t("profile.tapToEdit")}</Text>
          </Pressable>

          {!!avatarUri ? (
            <Pressable
              onPress={() => void clearAvatar()}
              style={({ pressed }) => [styles.removeAvatarBtn, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.removeAvatarText}>{t("profile.removeAvatar")}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {t("profile.streak", { days: streak })}
        </Text>
        <Text style={styles.cardLine}>
          {t("profile.totalCalm", { time: mmss(totalCalmSeconds) })}
        </Text>
        <Text style={styles.cardLine}>
          {t("profile.lastActivity", { label: lastActivityLabel })}
        </Text>
      </View>

      {/* Modal: elegir avatar */}
      <Modal visible={avatarPickerOpen} transparent animationType="fade" onRequestClose={() => setAvatarPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAvatarPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t("profile.chooseAvatar")}</Text>

            <Pressable onPress={() => void pickFromGallery()} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.92 }]}>
              <MaterialCommunityIcons name="image-outline" size={18} color={colors.primary} />
              <Text style={styles.actionText}>{t("profile.pickFromGallery")}</Text>
            </Pressable>

            <Text style={styles.modalLabel}>{t("profile.avatars")}</Text>

            <FlatList
              data={PRESET_AVATARS as any}
              keyExtractor={(i: any) => i.id}
              numColumns={3}
              columnWrapperStyle={{ gap: 10 }}
              contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
              renderItem={({ item }: any) => (
                <Pressable
                  onPress={() => void pickPreset(item.id)}
                  style={({ pressed }) => [styles.presetCell, pressed && { opacity: 0.92 }]}
                >
                  <Image source={item.img} style={styles.presetImg} />
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: editar nombre */}
      <Modal visible={editNameOpen} transparent animationType="fade" onRequestClose={() => setEditNameOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditNameOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t("profile.editName")}</Text>

            <TextInput
              value={draftName}
              onChangeText={(v) => setDraftName(v.slice(0, 20))}
              placeholder={t("profile.namePlaceholder")}
              placeholderTextColor="rgba(74,74,74,0.45)"
              maxLength={20}
              style={styles.modalInput}
            />

            <View style={styles.modalBtns}>
              <Pressable onPress={() => setEditNameOpen(false)} style={({ pressed }) => [styles.modalBtn, pressed && { opacity: 0.9 }]}>
                <Text style={styles.modalBtnText}>{t("profile.cancel")}</Text>
              </Pressable>

              <Pressable onPress={() => void saveName()} style={({ pressed }) => [styles.modalBtnPrimary, pressed && { opacity: 0.9 }]}>
                <Text style={styles.modalBtnPrimaryText}>{t("profile.save")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  grayTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "rgba(74,74,74,0.75)",
  },

  profileRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },

  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(198, 183, 226, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.45)",
    overflow: "hidden",
  },

  avatarImg: { width: "100%", height: "100%", resizeMode: "cover" },

  avatarBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },

  profileName: { fontSize: 18, fontWeight: "900", color: colors.text },
  profileHint: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "rgba(74,74,74,0.65)" },

  removeAvatarBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  removeAvatarText: { fontSize: 12, fontWeight: "900", color: "rgba(74,74,74,0.7)" },

  card: {
    marginTop: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: colors.text },
  cardLine: { fontSize: 13, fontWeight: "800", color: "rgba(74,74,74,0.7)" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.28)", padding: 18, justifyContent: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(198, 183, 226, 0.35)" },
  modalTitle: { fontSize: 15, fontWeight: "900", color: colors.text, marginBottom: 10 },

  modalLabel: { marginTop: 12, marginBottom: 8, fontSize: 12, fontWeight: "900", color: "rgba(74,74,74,0.7)" },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  actionText: { fontSize: 13, fontWeight: "900", color: colors.text },

  presetCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    overflow: "hidden",
  },
  presetImg: { width: "100%", height: "100%", resizeMode: "cover" },

  modalInput: {
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },

  modalBtns: { flexDirection: "row", gap: 10, marginTop: 12 },

  modalBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
  modalBtnText: { fontWeight: "900", color: "rgba(74,74,74,0.7)" },

  modalBtnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalBtnPrimaryText: { fontWeight: "900", color: "#fff" },
});
