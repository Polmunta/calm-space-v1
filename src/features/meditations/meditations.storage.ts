import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_FAVORITES = "calmspace.meditations.favorites.v1";
const KEY_LAST = "calmspace.meditations.last.v1";

export type SessionId = "meditacion" | "relajacion";

export async function getFavorites(): Promise<SessionId[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_FAVORITES);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as SessionId[]) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(id: SessionId): Promise<SessionId[]> {
  const current = await getFavorites();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
  await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(next));
  return next;
}

export async function getLastSession(): Promise<{ id: SessionId; at: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_LAST);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj?.id) return null;
    return { id: obj.id as SessionId, at: Number(obj.at ?? Date.now()) };
  } catch {
    return null;
  }
}

export async function setLastSession(id: SessionId) {
  try {
    await AsyncStorage.setItem(KEY_LAST, JSON.stringify({ id, at: Date.now() }));
  } catch {}
}

export function formatWhen(ts: number) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${mi}`;
}
