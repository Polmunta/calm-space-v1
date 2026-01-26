export type MeditationStep = {
  title: string;
  fromSec: number;
  toSec: number;
};

export type MeditationSession = {
  id: "meditacion" | "relajacion";
  title: string;
  subtitle: string;
  description: string;
  audio: any;
  cover: any;
  steps: MeditationStep[];
};

export const SESSIONS: MeditationSession[] = [
  {
    id: "meditacion",
    title: "Meditación guiada",
    subtitle: "Volver al presente",
    description: "Una práctica suave para centrarte y calmar la mente.",
    audio: require("../../../assets/audio/meditacion_completa.mp3"),
    cover: require("../../../assets/images/meditations/meditacion.jpg"),
    steps: [
      { title: "Preparación", fromSec: 0, toSec: 150 },
      { title: "Respiración consciente", fromSec: 150, toSec: 420 },
      { title: "Escaneo corporal", fromSec: 420, toSec: 780 },
      { title: "Presencia y calma", fromSec: 780, toSec: 1080 },
      { title: "Cierre", fromSec: 1080, toSec: 1320 },
    ],
  },
  {
    id: "relajacion",
    title: "Relajación profunda",
    subtitle: "Soltar tensión",
    description: "Relajación guiada para bajar el ritmo del cuerpo.",
    audio: require("../../../assets/audio/relajacion_completa.mp3"),
    cover: require("../../../assets/images/meditations/relajacion.jpg"),
    steps: [
      { title: "Acomodar el cuerpo", fromSec: 0, toSec: 180 },
      { title: "Respiración lenta", fromSec: 180, toSec: 420 },
      { title: "Soltar tensión", fromSec: 420, toSec: 780 },
      { title: "Calma profunda", fromSec: 780, toSec: 1080 },
      { title: "Cierre", fromSec: 1080, toSec: 1320 },
    ],
  },
];
