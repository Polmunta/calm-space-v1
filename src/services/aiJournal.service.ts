type SimpleMsg = { role: "user" | "ai"; text: string };

export type JournalMode = "suave" | "practico" | "preguntas" | "breve";

export type JournalSuggestion = "SOS" | "Breathing" | "Sounds" | "Mindfulness";

export type JournalResult = {
  text: string;
  suggestions: JournalSuggestion[];
};

type Intent =
  | "ASK_HELP"
  | "ANXIETY_STRONG"
  | "SLEEP"
  | "STRESS"
  | "RUMINATION"
  | "SADNESS"
  | "ANGER"
  | "CALM"
  | "GENERAL";

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

function hashSeed(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function clampWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ").trim() + "…";
}

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();

  const asksHelp =
    /(que hago|qué hago|como hago|cómo hago|como puedo|cómo puedo|dame pautas|dame consejos|necesito ayuda|ayudame|ayúdame|recomend|consejo|pautas|tips|me puedes decir|me aconsejas)/i.test(
      t
    );

  const anxietyStrong =
    /(ataque de ansiedad|crisis|panic|pánico|me ahogo|no puedo respirar|me tiembla|me desbordo|muy ansioso|muy ansiosa)/i.test(
      t
    );

  const sleep =
    /(no puedo dormir|insomnio|me cuesta dormir|sueño|sueno|despert|pesadilla|quiero dormir)/i.test(
      t
    );

  const rumination =
    /(no paro de pensar|rumiar|pensamientos|me da vueltas|vuelta|preocupación|preocupacion|catastrof|sobrepens)/i.test(
      t
    );

  const stress =
    /(estres|estrés|agobi|tension|tensión|presion|presión|nervios|ansiedad)/i.test(
      t
    );

  const sadness =
    /(triste|llor|deprim|vac(i|í)o|desanim|sin ganas|apagad)/i.test(t);

  const anger = /(rabia|enfad|ira|molest|frustr)/i.test(t);

  const calm = /(tranquil|calma|paz|seren|bien|mejor|alivi)/i.test(t);

  if (anxietyStrong) return "ANXIETY_STRONG";
  if (sleep) return "SLEEP";
  if (asksHelp) return "ASK_HELP";
  if (rumination) return "RUMINATION";
  if (anger) return "ANGER";
  if (sadness) return "SADNESS";
  if (stress) return "STRESS";
  if (calm) return "CALM";
  return "GENERAL";
}

function detectSuggestions(userText: string, intent: Intent): JournalSuggestion[] {
  const t = userText.toLowerCase();
  const s: JournalSuggestion[] = [];

  const hasAnxiety = /(ansiedad|agobi|estres|estrés|tension|tensión|presion|presión|nervios)/i.test(
    t
  );
  const hasSleep = /(dormir|insomnio|sueño|sueno|me cuesta dormir|no puedo dormir)/i.test(
    t
  );

  if (intent === "ANXIETY_STRONG") {
    s.push("SOS", "Breathing");
  } else if (intent === "SLEEP") {
    s.push("Sounds", "Breathing");
  } else if (intent === "RUMINATION") {
    s.push("Mindfulness");
  } else if (intent === "STRESS") {
    s.push("Breathing");
  } else if (intent === "ASK_HELP") {
    // Si pide ayuda sin especificar, ofrecemos las herramientas base
    s.push("Breathing", "Mindfulness");
  }

  // Refuerzos extra
  if (hasAnxiety && !s.includes("Breathing")) s.push("Breathing");
  if (hasSleep && !s.includes("Sounds")) s.push("Sounds");

  return Array.from(new Set(s));
}

function empathicLine(seed: number, intent: Intent) {
  const base = [
    "Gracias por compartir esto. Tiene sentido que te sientas así.",
    "Te leo con cariño. Gracias por ponerlo en palabras.",
    "Gracias por abrirte. Podemos ir paso a paso.",
    "Estoy contigo en esto. Vamos con calma.",
  ];

  const extraByIntent: Record<Intent, string[]> = {
    ANXIETY_STRONG: [
      "Si ahora mismo estás en modo “alarma”, lo primero es bajar el volumen del cuerpo.",
      "Cuando el cuerpo se acelera, no estás haciendo nada mal: es una respuesta de estrés.",
    ],
    SLEEP: [
      "Dormir se vuelve difícil cuando la mente sigue “en guardia”.",
      "Si hoy cuesta dormir, no significa que mañana vaya a ser igual.",
    ],
    ASK_HELP: [
      "Me parece buena idea que pidas pautas concretas.",
      "Vamos a convertir esto en un plan pequeño y realista.",
    ],
    STRESS: ["Suena a que estás sosteniendo bastante.", "Esto puede ser agotador."],
    RUMINATION: [
      "Cuando la mente da vueltas, suele estar intentando protegerte.",
      "Pensar mucho no siempre ayuda; a veces solo cansa.",
    ],
    SADNESS: [
      "Tiene sentido que hoy te pese.",
      "No tienes que hacerlo perfecto hoy.",
    ],
    ANGER: [
      "La rabia a veces señala un límite importante.",
      "Tu enfado puede estar protegiendo algo valioso.",
    ],
    CALM: [
      "Me alegra leer un poquito de alivio ahí.",
      "Qué bien que notes esa calma, aunque sea pequeña.",
    ],
    GENERAL: ["Estoy aquí contigo.", "Vamos poco a poco."],
  };

  return pick(base, seed) + " " + pick(extraByIntent[intent], seed + 9);
}

function oneSoftQuestion(seed: number, intent: Intent) {
  const byIntent: Record<Intent, string[]> = {
    ANXIETY_STRONG: [
      "¿Qué nota tu cuerpo ahora mismo (pecho, garganta, barriga) del 0 al 10?",
      "¿Puedes nombrar una sola cosa que te haría sentir 1% más segura ahora?",
    ],
    SLEEP: [
      "¿Qué suele disparar más tu mente por la noche?",
      "Si hoy no sale dormir pronto, ¿qué te ayudaría a descansar igual un poco?",
    ],
    ASK_HELP: [
      "¿Qué te ayudaría más hoy: calmar el cuerpo, aclarar la mente o desahogarte?",
      "¿Cuál es la parte más urgente de resolver ahora mismo?",
    ],
    STRESS: [
      "¿Qué es lo que más te está drenando hoy?",
      "¿Qué podrías soltar (aunque sea un 5%) solo por hoy?",
    ],
    RUMINATION: [
      "¿Cuál es el pensamiento que más se repite?",
      "¿Qué te dirías si ese pensamiento le pasara a un amigo?",
    ],
    SADNESS: [
      "¿Qué crees que necesita tu yo de hoy: compañía, descanso o comprensión?",
      "¿Qué gesto pequeño de cuidado sería posible hoy?",
    ],
    ANGER: [
      "¿Qué límite te hubiera gustado poner?",
      "¿Qué necesidad está detrás de esa rabia?",
    ],
    CALM: [
      "¿Qué te está ayudando a sostener esa calma?",
      "¿Qué detalle te gustaría repetir mañana?",
    ],
    GENERAL: [
      "¿Qué necesitas ahora mismo: calma, claridad o apoyo?",
      "¿Qué sería un paso pequeño y realista hoy?",
    ],
  };

  return pick(byIntent[intent], seed + 21);
}

function faqPlan(seed: number, intent: Intent) {
  // Respuestas tipo “FAQ / chatbot” pero humanas y breves.
  const anxietySteps = [
    "1) Exhala largo (6–8s) x 6 veces. 2) Baja hombros y suelta la mandíbula. 3) Mira 5 cosas a tu alrededor (ancla). 4) Si puedes, abre **SOS 60s** o un ejercicio de **Respiración**.",
    "1) Pon una mano en el pecho y otra en la barriga. 2) Inhala 4, exhala 6 (8 ciclos). 3) Nombra en voz baja dónde estás (“estoy aquí, ahora”). 4) Luego ve a **SOS 60s**.",
  ];

  const sleepSteps = [
    "1) Baja luz y pantallas. 2) Respira 4-4-6 durante 2 minutos. 3) Si la mente insiste, escribe 3 líneas (descarga). 4) Pon **Sonidos** (lluvia/olas) 10–20 min.",
    "1) Cuerpo: estira cuello/hombros 30s. 2) Exhala largo 6s (10 ciclos). 3) Pon **Sonidos** y permite “descansar” aunque no duermas aún.",
  ];

  const stressSteps = [
    "1) Micro-pausa: 60s sin hacer nada. 2) Elige 1 prioridad y 1 cosa que puedes dejar. 3) Respira 4-6 (inhalas 4, exhalas 6) 8 veces.",
    "1) Agua + hombros abajo. 2) Lista rápida: “lo que controlo / lo que no”. 3) Una acción mínima. 4) Luego un minuto de respiración.",
  ];

  const ruminationSteps = [
    "1) Pon nombre al pensamiento (“mi mente dice que…”). 2) Pregunta: “¿esto es un hecho o una historia?”. 3) Vuelve al cuerpo 3 respiraciones lentas. 4) Si te ayuda, haz 2 min de **Atención plena**.",
    "1) Escríbelo en 1 frase. 2) Añade: “ahora mismo no necesito resolverlo”. 3) 5-4-3-2-1 (sentidos). 4) **Mindfulness** 2–3 min.",
  ];

  const generalHelp = [
    "1) Elige objetivo: calmar cuerpo / aclarar mente / desahogarte. 2) Haz un paso de 2 minutos. 3) Cierra con una acción pequeña (un mensaje, agua, ducha, paseo corto).",
    "1) Una cosa que sí controlas. 2) Una cosa que sueltas hoy. 3) Un gesto de cuidado (mínimo).",
  ];

  const packByIntent: Record<Intent, string[]> = {
    ANXIETY_STRONG: anxietySteps,
    SLEEP: sleepSteps,
    STRESS: stressSteps,
    RUMINATION: ruminationSteps,
    ASK_HELP: generalHelp,
    SADNESS: [
      "1) Nombra la emoción sin pelear (“hoy hay tristeza”). 2) Un gesto de cuidado (agua, manta, música). 3) Una cosa pequeñita que te acerque a sentirte acompañada.",
      "1) Pregunta amable: “¿qué necesito hoy?”. 2) Reduce expectativas (modo suave). 3) Busca una micro-conexión (mensaje corto a alguien).",
    ],
    ANGER: [
      "1) Descarga segura: caminar rápido 3 min o apretar/soltar puños 10 veces. 2) Nombra el límite. 3) Decide una frase breve para protegerte.",
      "1) Respira y suelta mandíbula. 2) “Lo que me enfada es…” 3) “Lo que necesito es…” 4) Un límite pequeño hoy.",
    ],
    CALM: [
      "1) Identifica qué te ayudó. 2) Repite 1 cosa mañana. 3) Guarda un recordatorio (una frase) para días difíciles.",
      "1) Celebra el progreso mínimo. 2) Sostén rutina suave. 3) Un gesto de cuidado para mantenerlo.",
    ],
    GENERAL: generalHelp,
  };

  return pick(packByIntent[intent], seed + 55);
}

function continuityLine(seed: number, context: SimpleMsg[]) {
  const lastUser = [...context].reverse().find((m) => m.role === "user")?.text;
  if (!lastUser) return "";

  return pick(
    [
      "Uniéndolo con lo anterior, parece importante ir a lo básico: cuerpo primero, luego mente.",
      "Mirando el hilo, quizá estás pidiendo más margen y menos presión contigo.",
      "Con el contexto, tiene sentido priorizar un paso pequeño y repetirlo.",
    ],
    seed + 77
  );
}

export async function getAIReflection(
  userText: string,
  context: SimpleMsg[] = [],
  mode: JournalMode = "suave"
): Promise<JournalResult> {
  // UX: pequeño delay para “pensar”
  await new Promise((r) => setTimeout(r, 300));

  const seed = hashSeed(userText + "|" + (context[context.length - 1]?.text ?? ""));
  const intent = detectIntent(userText);

  const suggestions = detectSuggestions(userText, intent);

  // Si el usuario pide pautas o cae en intents “prácticos”, aunque esté en “suave”,
  // le damos estructura de pasos (sin ser largo).
  const shouldBePractical =
    mode === "practico" || mode === "breve"
      ? mode === "practico"
      : intent === "ASK_HELP" || intent === "ANXIETY_STRONG" || intent === "SLEEP";

  const line1 = empathicLine(seed, intent);
  const cont = continuityLine(seed, context);
  const plan = faqPlan(seed, intent);
  const q1 = oneSoftQuestion(seed, intent);

  if (mode === "breve") {
    const out = [line1, q1].filter(Boolean).join(" ");
    return { text: clampWords(out, 95), suggestions };
  }

  if (mode === "preguntas") {
    const q2 = oneSoftQuestion(seed + 999, intent);
    const out = [line1, cont, q1, q2].filter(Boolean).join(" ");
    return { text: clampWords(out, 160), suggestions };
  }

  if (mode === "practico" || shouldBePractical) {
    // B: equilibrada → breve empático + plan + 1 pregunta suave
    const out = [line1, cont, plan, q1].filter(Boolean).join(" ");
    return { text: clampWords(out, 190), suggestions };
  }

  // modo suave por defecto (B equilibrada)
  const out = [line1, cont, q1].filter(Boolean).join(" ");
  return { text: clampWords(out, 170), suggestions };
}
