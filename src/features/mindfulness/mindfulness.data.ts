export type MindfulnessQuestion = {
  id: string;
  text: string;
};

export type MindfulnessExerciseStep = {
  title: string;
  text: string;
};

export type MindfulnessExercise = {
  id: "54321" | "escaneo" | "micro";
  title: string;
  short: string;        // ✅ descripción breve para la tarjeta
  description: string;  // descripción un poco más completa (solo en el detalle)
  steps: MindfulnessExerciseStep[];
  tip: string;
};

export const MINDFULNESS_QUESTIONS: MindfulnessQuestion[] = [
  // ✅ Del txt que pasaste
  { id: "q01", text: "¿Qué actividad te hace perder la noción del tiempo? ¿Por qué?" },
  { id: "q02", text: "¿Cuál es un pequeño acto de amabilidad que puedes hacer por alguien hoy?" },
  { id: "q03", text: "Piensa en un desafío que superaste. ¿Qué aprendiste de él?" },
  { id: "q04", text: "¿Qué es algo hermoso que notaste recientemente?" },
  { id: "q05", text: "Describe un lugar donde te sientas completamente en paz." },
  { id: "q06", text: "¿Qué cualidad admiras en los demás que también ves en ti?" },
  { id: "q07", text: "¿Cuáles son tres cosas por las que estás agradecido/a hoy?" },
  { id: "q08", text: "Describe un sonido que escuches ahora mismo. ¿Qué te hace pensar?" },

  // ✅ +20 (y pico) extra (coherentes con la app)
  { id: "q09", text: "¿Qué emoción está más presente ahora mismo? (sin juzgarla)" },
  { id: "q10", text: "Si tu mente fuera un cielo, ¿cómo estaría hoy: despejado, nublado, con tormenta…?" },
  { id: "q11", text: "¿Qué parte de tu cuerpo está más tensa ahora? ¿Puedes aflojar un 5%?" },
  { id: "q12", text: "¿Qué necesitas hoy: descanso, claridad, apoyo o movimiento?" },
  { id: "q13", text: "¿Qué pensamiento se repite últimamente? ¿Te ayuda o te drena?" },
  { id: "q14", text: "¿Qué haría tu “yo” más calmado en esta situación?" },
  { id: "q15", text: "¿Qué es lo más pequeño que puedes hacer ahora para cuidarte?" },
  { id: "q16", text: "¿Qué es algo que estás intentando controlar demasiado?" },
  { id: "q17", text: "¿Qué puedes soltar hoy (una expectativa, una prisa, una comparación)?" },
  { id: "q18", text: "¿Qué te está funcionando últimamente, aunque sea algo pequeño?" },
  { id: "q19", text: "¿Qué persona te aporta calma? ¿Qué rasgo suyo podrías aplicar hoy?" },
  { id: "q20", text: "¿Qué te dirías si fueras tu mejor amiga ahora mismo?" },
  { id: "q21", text: "¿Qué te gustaría sentir al final del día? ¿Qué acción mínima te acerca?" },
  { id: "q22", text: "¿Qué estás evitando? ¿Cuál sería el primer paso más fácil?" },
  { id: "q23", text: "¿Qué agradeces de tu cuerpo hoy, aunque sea algo simple?" },
  { id: "q24", text: "¿Qué ruido mental puedes etiquetar como ‘solo un pensamiento’?" },
  { id: "q25", text: "¿Qué te está pidiendo tu energía hoy: pausa o impulso?" },
  { id: "q26", text: "Si pudieras bajar el volumen de una cosa hoy, ¿cuál sería?" },
  { id: "q27", text: "¿Qué te da seguridad cuando estás nervioso/a?" },
  { id: "q28", text: "¿Qué puedes hacer en 60 segundos para sentirte 1% mejor?" },
  { id: "q29", text: "¿Qué parte del día suele ser más difícil? ¿Cómo podrías suavizarla?" },
  { id: "q30", text: "¿Qué has estado haciendo bien que no te reconoces?" },
  { id: "q31", text: "¿Qué sensación notas en tu pecho ahora mismo? (calor, presión, vacío…)" },
  { id: "q32", text: "¿Qué es lo más importante de hoy, de verdad?" },
  { id: "q33", text: "¿Qué harías si no necesitaras hacerlo perfecto?" },
  { id: "q34", text: "¿Qué te ayuda a volver al presente cuando te vas con la mente?" },
  { id: "q35", text: "¿Qué te gustaría perdonarte hoy (aunque sea un poquito)?" },
];

export const MINDFULNESS_EXERCISES: MindfulnessExercise[] = [
  {
    id: "54321",
    title: "5-4-3-2-1 (Anclaje)",
    short: "Baja ansiedad.",
    description: "Trae tu atención a los sentidos para volver al presente.",
    steps: [
      { title: "1/5 · 5 cosas", text: "Mira a tu alrededor y nombra 5 cosas que puedas ver." },
      { title: "2/5 · 4 cosas", text: "Nombra 4 cosas que puedas sentir en tu cuerpo (ropa, silla, aire…)." },
      { title: "3/5 · 3 cosas", text: "Escucha y nombra 3 sonidos (cercanos o lejanos)." },
      { title: "4/5 · 2 cosas", text: "Nota 2 olores (o imagina 2 olores agradables si no hay)." },
      { title: "5/5 · 1 cosa", text: "Nombra 1 sabor (o toma un sorbo de agua y descríbelo)." },
    ],
    tip: "Hazlo sin prisa. Si te distraes, vuelve al paso en el que estabas.",
  },
  {
    id: "escaneo",
    title: "Escaneo corporal corto",
    short: "Suelta tensión.",
    description: "Recorre el cuerpo y afloja de forma suave, sin forzar.",
    steps: [
      { title: "1/5 · Cara", text: "Afloja mandíbula, lengua y entrecejo un 5%." },
      { title: "2/5 · Hombros", text: "Súbelos 2s y suéltalos lento 5s." },
      { title: "3/5 · Pecho", text: "Nota la respiración sin cambiarla durante 3 ciclos." },
      { title: "4/5 · Abdomen", text: "Relaja el vientre al exhalar. Sin empujar." },
      { title: "5/5 · Piernas", text: "Siente el peso de las piernas y su apoyo." },
    ],
    tip: "No es ‘hacerlo perfecto’. Es notar y suavizar.",
  },
  {
    id: "micro",
    title: "Micro-meditación (2 min)",
    short: "Pausa breve.",
    description: "Dos minutos para resetear: respiración + atención simple.",
    steps: [
      { title: "1/4 · Postura", text: "Colócate cómodo/a. Suelta hombros y mira suave." },
      { title: "2/4 · Respiración", text: "Inhala 4s y exhala 6s, 6 veces." },
      { title: "3/4 · Etiquetar", text: "Si aparece un pensamiento: ‘pensando’ y vuelve a respirar." },
      { title: "4/4 · Cierre", text: "Elige una acción pequeña para seguir (1 paso).”" },
    ],
    tip: "Menos es más. Lo importante es volver, no quedarse.",
  },
];
