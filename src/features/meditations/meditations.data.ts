export type MeditationStep = {
  title: string;
  fromSec: number;
  toSec: number;
};

export type MeditationSession = {
  id: "meditacion" | "relajacion";
  title: string;
  description: string;
  audio: any; // require(...)
  cover: any; // require(...)
  minutesLabel?: string; // opcional (si no, se mostrará cuando se cargue el audio)
  steps: MeditationStep[];
};

export const SESSIONS: MeditationSession[] = [
  {
    id: "meditacion",
    title: "Meditación guiada",
    description: "Una sesión suave para calmar la mente y volver al presente.",
    audio: require("../../../assets/audio/meditacion_completa.mp3"),
    cover: require("../../../assets/meditations/meditacion.png"),// cambia si tu imagen se llama distinto
    minutesLabel: "21:04",
    steps: [
      { title: "Preparación", fromSec: 0, toSec: 150 },
      { title: "Respiración", fromSec: 150, toSec: 420 },
      { title: "Cuerpo", fromSec: 420, toSec: 780 },
      { title: "Pensamientos", fromSec: 780, toSec: 1080 },
      { title: "Cierre suave", fromSec: 1080, toSec: 1264 }, // 21:04 = 1264s
    ],
  },
  {
    id: "relajacion",
    title: "Relajación guiada",
    description: "Relaja el cuerpo poco a poco y suelta tensión acumulada.",
    audio: require("../../../assets/audio/relajacion_completa.mp3"),
    cover: require("../../../assets/meditations/relajacion.png"), // cambia si tu imagen se llama distinto
    minutesLabel: "22:04",
    steps: [
      { title: "Acomodarte", fromSec: 0, toSec: 180 },
      { title: "Respiración lenta", fromSec: 180, toSec: 480 },
      { title: "Relajar cuerpo", fromSec: 480, toSec: 900 },
      { title: "Soltar tensión", fromSec: 900, toSec: 1200 },
      { title: "Final / descanso", fromSec: 1200, toSec: 1324 }, // 22:04 = 1324s
    ],
  },
];
