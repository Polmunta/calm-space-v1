export type MeditationStep = {
  title: string;
  fromSec: number;
  toSec: number;
  hint?: string; // ✅ NUEVO: texto corto bajo el paso activo
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
        fromSec: 0,
        toSec: 150,
        hint: "Acomódate. Suelta hombros y mandíbula. No hace falta hacerlo perfecto.",
      },
      {
        title: "Respiración",
        fromSec: 150,
        toSec: 420,
        hint: "Inhala suave por la nariz y exhala un poco más largo. Vuelve a la respiración cuando te distraigas.",
      },
      {
        title: "Cuerpo",
        fromSec: 420,
        toSec: 780,
        hint: "Recorre el cuerpo por zonas. Afloja solo un 5% cada vez.",
      },
      {
        title: "Pensamientos",
        fromSec: 780,
        toSec: 1080,
        hint: "Etiqueta: “pensando” y deja pasar. Vuelve al aire entrando y saliendo.",
      },
      {
        title: "Cierre suave",
        fromSec: 1080,
        toSec: 1264,
        hint: "Respira profundo 1 vez. Elige una intención pequeña para el resto del día.",
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
        fromSec: 0,
        toSec: 180,
        hint: "Busca una postura cómoda. Si necesitas moverte, hazlo sin prisa.",
      },
      {
        title: "Respiración lenta",
        fromSec: 180,
        toSec: 480,
        hint: "Exhala largo para soltar tensión. No fuerces la inhalación.",
      },
      {
        title: "Relajar cuerpo",
        fromSec: 480,
        toSec: 900,
        hint: "Escanea: cara → hombros → pecho. Suelta donde notes rigidez.",
      },
      {
        title: "Soltar tensión",
        fromSec: 900,
        toSec: 1200,
        hint: "Imagina que el peso cae hacia el suelo. Afloja cuello y espalda.",
      },
      {
        title: "Final / descanso",
        fromSec: 1200,
        toSec: 1324,
        hint: "Quédate respirando suave. Si aparece sueño, déjalo venir.",
      },
    ],
  },
];
