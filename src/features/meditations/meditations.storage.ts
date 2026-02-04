import AsyncStorage from "@react-native-async-storage/async-storage";

export type MeditationId = "meditacion" | "relajacion";

const KEY_LAST = "meditations_last_session_v1";
const KEY_FAVS = "meditations_favs_v1";

// --------- LAST SESSION ----------
export async function setLastSession(id: MeditationId) {
  try {
    await AsyncStorage.setItem(KEY_LAST, id);
  } catch {
    // ignore
  }
}

export async function getLastSession(): Promise<MeditationId | null> {
  try {
    const v = await AsyncStorage.getItem(KEY_LAST);
    if (v === "meditacion" || v === "relajacion") return v;
    return null;
  } catch {
    return null;
  }
}

// --------- FAVORITES ----------
export async function getFavorites(): Promise<MeditationId[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_FAVS);
    if (!raw) return [];
    const arr = JSON.parse(raw);

    if (!Array.isArray(arr)) return [];

    // filtramos estrictamente por ids válidos
    return arr.filter((x) => x === "meditacion" || x === "relajacion") as MeditationId[];
  } catch {
    return [];
  }
}

async function saveFavorites(ids: MeditationId[]) {
  await AsyncStorage.setItem(KEY_FAVS, JSON.stringify(ids));
}

export async function toggleFavorite(id: MeditationId): Promise<MeditationId[]> {
  const favs = await getFavorites();
  const set = new Set<MeditationId>(favs);

  if (set.has(id)) set.delete(id);
  else set.add(id);

  const next = Array.from(set);
  await saveFavorites(next);
  return next;
}
