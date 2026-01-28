export type MeditationStep = {
  title: string;
  hint?: string; // ✅ nuevo: 1-2 líneas
  fromSec: number;
  toSec: number;
};

export type MeditationSession = {
  id: "meditacion" | "relajacion";
  title: string;
  description: string;
  audio: any; // require(...)
  cover: any; // require(...)
  minutesLabel?: string;
  recommended?: boolean;
  steps: MeditationStep[];
};

export const SESSIONS: MeditationSession[] = [
  {
    id: "meditacion",
    title: "Meditación guiada",
    description: "Una sesión suave para calmar la mente y volver al presente.",
    audio: require("../../../assets/audio/meditacion_completa.mp3"),
    cover: require("../../../assets/meditations/meditacion.png"),
    minutesLabel: "21:04",
    steps: [
      {
        title: "Preparación",
        hint: "Encuentra una postura cómoda. Suelta mandíbula y hombros.",
        fromSec: 0,
        toSec: 295, // siguiente voz empieza en 05:00, entramos 5s antes
      },
      {
        title: "Respiración",
        hint: "Inhala suave por la nariz. Exhala más largo y lento.",
        fromSec: 295, // 04:55
        toSec: 600,   // 09:55
      },
      {
        title: "Cuerpo",
        hint: "Recorre el cuerpo con atención. Relaja zonas tensas sin forzar.",
        fromSec: 600, // 09:55
        toSec: 965,   // 15:55
      },
      {
        title: "Pensamientos",
        hint: "Observa los pensamientos pasar. Vuelve a la respiración cuando te distraigas.",
        fromSec: 965, // 15:55
        toSec: 1080,  // 17:55
      },
      {
        title: "Cierre suave",
        hint: "Agradece el momento. Vuelve despacio: respiración, cuerpo y entorno.",
        fromSec: 1080, // 17:55
        toSec: 1264,   // 21:04
      },
    ],
  },

  {
    id: "relajacion",
    title: "Relajación guiada",
    description: "Relaja el cuerpo poco a poco y suelta tensión acumulada.",
    audio: require("../../../assets/audio/relajacion_completa.mp3"),
    cover: require("../../../assets/meditations/relajacion.png"),
    recommended: true,
    minutesLabel: "22:04",
    steps: [
      {
        title: "Acomodarte",
        hint: "Ajusta tu postura y apoya bien el cuerpo. Exhala y afloja.",
        fromSec: 0,
        toSec: 295, // 04:55
      },
      {
        title: "Respiración lenta",
        hint: "Respira más lento de lo normal. Exhala largo para soltar tensión.",
        fromSec: 295, // 04:55
        toSec: 600,   // 09:55
      },
      {
        title: "Relajar cuerpo",
        hint: "Relaja de arriba abajo: frente, cuello, hombros, pecho y abdomen.",
        fromSec: 600, // 09:55
        toSec: 955,   // 15:55
      },
      {
        title: "Soltar tensión",
        hint: "Suelta conscientemente: hombros, manos, mandíbula. Sin prisa.",
        fromSec: 955, // 15:55
        toSec: 1075,  // 17:55
      },
      {
        title: "Final / descanso",
        hint: "Quédate unos instantes quieto. Respira natural y deja que el cuerpo descanse.",
        fromSec: 1075, // 17:55
        toSec: 1324,   // 22:04
      },
    ],
  },
];
