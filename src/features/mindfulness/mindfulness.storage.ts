import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_FAVS = "mindfulness_favorites_v1";
const KEY_SEEN_ALL = "mindfulness_seen_all_v1";
const KEY_SEEN_FAV = "mindfulness_seen_fav_v1";
const KEY_LAST_MODE = "mindfulness_last_mode_v1";

type Store = {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
};

const memory = new Map<string, string>();

const storage: Store =
  AsyncStorage && typeof AsyncStorage.getItem === "function"
    ? AsyncStorage
    : {
        getItem: async (k) => memory.get(k) ?? null,
        setItem: async (k, v) => void memory.set(k, v),
        removeItem: async (k) => void memory.delete(k),
      };

function safeParseArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export async function loadFavorites(): Promise<string[]> {
  const raw = await storage.getItem(KEY_FAVS);
  return safeParseArray(raw);
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await storage.setItem(KEY_FAVS, JSON.stringify(Array.from(new Set(ids))));
}

export async function loadSeen(kind: "all" | "fav"): Promise<string[]> {
  const raw = await storage.getItem(kind === "all" ? KEY_SEEN_ALL : KEY_SEEN_FAV);
  return safeParseArray(raw);
}

export async function saveSeen(kind: "all" | "fav", ids: string[]): Promise<void> {
  await storage.setItem(kind === "all" ? KEY_SEEN_ALL : KEY_SEEN_FAV, JSON.stringify(Array.from(new Set(ids))));
}

export async function clearSeen(kind: "all" | "fav"): Promise<void> {
  await storage.removeItem(kind === "all" ? KEY_SEEN_ALL : KEY_SEEN_FAV);
}

export async function loadLastMode(): Promise<"preguntas" | "ejercicios"> {
  const raw = await storage.getItem(KEY_LAST_MODE);
  return raw === "ejercicios" ? "ejercicios" : "preguntas";
}

export async function saveLastMode(v: "preguntas" | "ejercicios"): Promise<void> {
  await storage.setItem(KEY_LAST_MODE, v);
}
