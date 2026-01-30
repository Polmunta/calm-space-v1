import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import es from "./locales/es.json";
import en from "./locales/en.json";
import ca from "./locales/ca.json";

export const SUPPORTED_LANGS = ["es", "en", "ca"] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = "app.language";

function pickSystemLang(): AppLang {
  const locales = Localization.getLocales?.() ?? [];
  const code = (locales[0]?.languageCode ?? "es").toLowerCase();

  if (code === "ca") return "ca";
  if (code === "en") return "en";
  return "es";
}

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        es: { translation: es },
        en: { translation: en },
        ca: { translation: ca },
      },
      lng: "es",
      fallbackLng: "es",
      supportedLngs: SUPPORTED_LANGS as unknown as string[],
      interpolation: { escapeValue: false },
      compatibilityJSON: "v4",
      returnNull: false,
      returnEmptyString: false,
    })
    .catch(() => {});
}

export async function initAppLanguage() {
  try {
    const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as AppLang | null;
    const lang = saved && SUPPORTED_LANGS.includes(saved) ? saved : pickSystemLang();
    if (i18n.language !== lang) await i18n.changeLanguage(lang);
  } catch {
    // ignore
  }
}

export async function setAppLanguage(lang: AppLang) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  try {
    await i18n.changeLanguage(lang);
  } catch {}
}

export function getAppLanguage(): AppLang {
  const l = (i18n.language || "es").slice(0, 2) as AppLang;
  return SUPPORTED_LANGS.includes(l) ? l : "es";
}

export default i18n;
