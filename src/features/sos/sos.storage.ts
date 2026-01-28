import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_FAVS = "sos:favs:v1";
const KEY_USAGE = "sos:usage:v1";

export async function getSOSFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_FAVS);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function toggleSOSFavorite(id: string): Promise<string[]> {
  const favs = await getSOSFavorites();
  const set = new Set(favs);
  if (set.has(id)) set.delete(id);
  else set.add(id);

  const next = Array.from(set);
  try {
    await AsyncStorage.setItem(KEY_FAVS, JSON.stringify(next));
  } catch {}
  return next;
}

export async function getSOSUsage(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_USAGE);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export async function incrementSOSUsage(id: string): Promise<Record<string, number>> {
  const usage = await getSOSUsage();
  const next = { ...usage, [id]: Math.min(9999, (usage[id] ?? 0) + 1) };
  try {
    await AsyncStorage.setItem(KEY_USAGE, JSON.stringify(next));
  } catch {}
  return next;
}
