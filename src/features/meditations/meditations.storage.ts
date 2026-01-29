import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_LAST = "meditations_last_session_v1";

export async function setLastSession(id: "meditacion" | "relajacion") {
  try {
    await AsyncStorage.setItem(KEY_LAST, id);
  } catch {
    // ignore
  }
}

export async function getLastSession(): Promise<"meditacion" | "relajacion" | null> {
  try {
    const v = await AsyncStorage.getItem(KEY_LAST);
    if (v === "meditacion" || v === "relajacion") return v;
    return null;
  } catch {
    return null;
  }
}
