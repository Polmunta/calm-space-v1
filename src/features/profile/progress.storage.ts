import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "progress_v1";

type Progress = {
  streak: number;                 // racha
  lastActiveDate: string | null;  // "YYYY-MM-DD"
  totalCalmSeconds: number;       // acumulado
  lastActivityLabel: string | null; // "Respiración · Calma", etc
};

const DEFAULT: Progress = {
  streak: 0,
  lastActiveDate: null,
  totalCalmSeconds: 0,
  lastActivityLabel: null,
};

function todayKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export async function getProgress(): Promise<Progress> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT;
  try {
    return { ...DEFAULT, ...JSON.parse(raw) } as Progress;
  } catch {
    return DEFAULT;
  }
}

async function save(p: Progress) {
  await AsyncStorage.setItem(KEY, JSON.stringify(p));
}

/**
 * Llamar cuando el usuario hace “algo” (termina una respiración, reproduce meditación, etc.)
 * - Suma tiempo total
 * - Actualiza racha (si hoy ya contado, no suma)
 */
export async function recordActivity(opts: { seconds?: number; label?: string }) {
  const p = await getProgress();
  const today = todayKey();
  const yesterday = yesterdayKey();

  // total tiempo
  const add = Math.max(0, Math.floor(opts.seconds ?? 0));
  p.totalCalmSeconds += add;

  // última actividad
  if (opts.label) p.lastActivityLabel = opts.label;

  // racha
  if (p.lastActiveDate === today) {
    // ya contó hoy → nada
  } else if (p.lastActiveDate === yesterday) {
    p.streak = Math.max(0, p.streak) + 1;
    p.lastActiveDate = today;
  } else {
    p.streak = 1;
    p.lastActiveDate = today;
  }

  await save(p);
}
