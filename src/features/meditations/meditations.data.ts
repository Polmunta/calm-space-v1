import i18n from "../../shared/i18n/i18n";

export type MeditationStep = {
  title: string;
  fromSec: number;
  toSec: number;
  hint?: string;
};

export type MeditationSession = {
  id: "meditacion" | "relajacion";
  title: string;
  description: string;
  cover: any;
  minutesLabel?: string;
  recommended?: boolean;
  steps: MeditationStep[];

  // ✅ nuevo
  audioByLang: {
    es: any;
    en: any;
    ca: any;
  };
};

export const SESSIONS: MeditationSession[] = [
  {
    id: "meditacion",
    title: "Meditación guiada",
    description: "Una sesión suave para calmar la mente y volver al presente.",
    cover: require("../../../assets/meditations/meditacion.png"),
    minutesLabel: "21:04",
    steps: [
      { title: "Preparación", fromSec: 0, toSec: 295},
      { title: "Respiración", fromSec: 295, toSec: 600 },
      { title: "Cuerpo", fromSec: 600, toSec: 964 },
      { title: "Pensamientos", fromSec: 964, toSec: 1080 },
      { title: "Cierre suave", fromSec: 1080, toSec: 1264 },
    ],
    audioByLang: {
      es: require("../../../assets/audio/meditacion_completa.mp3"),
      en: require("../../../assets/audio/complete_meditation.mp3"),
      ca: require("../../../assets/audio/meditacio_completa.mp3"),
    },
  },
  {
    id: "relajacion",
    title: "Relajación guiada",
    description: "Relaja el cuerpo poco a poco y suelta tensión acumulada.",
    cover: require("../../../assets/meditations/relajacion.png"),
    minutesLabel: "22:04",
    recommended: true,
    steps: [
      { title: "Acomodarte", fromSec: 0, toSec: 295 },
      { title: "Respiración lenta", fromSec: 295, toSec: 600 },
      { title: "Relajar cuerpo", fromSec: 600, toSec: 958 },
      { title: "Soltar tensión", fromSec: 958, toSec: 1080 },
      { title: "Final / descanso", fromSec: 1080, toSec: 1324 },
    ],
    audioByLang: {
      es: require("../../../assets/audio/relajacion_completa.mp3"),
      en: require("../../../assets/audio/complete_relaxation.mp3"),
      ca: require("../../../assets/audio/relaxacio_completa.mp3"),
    },
  },
];

// helper por si lo quieres usar en pantalla
export function getSessionAudio(session: MeditationSession) {
  const lang = (i18n.language || "es").slice(0, 2) as "es" | "en" | "ca";
  return session.audioByLang[lang] ?? session.audioByLang.es;
}
