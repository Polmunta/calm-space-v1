import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_FAVS = "calmspace.meditations.favs.v1";
const KEY_LAST = "calmspace.meditations.last.v1";

export async function getFavorites(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY_FAVS);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const favs = await getFavorites();
  const set = new Set(favs);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const next = Array.from(set);
  await AsyncStorage.setItem(KEY_FAVS, JSON.stringify(next));
  return next;
}

export async function setLastSession(id: string) {
  await AsyncStorage.setItem(KEY_LAST, id);
}

export async function getLastSession(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_LAST);
}
