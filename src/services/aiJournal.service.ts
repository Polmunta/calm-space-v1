import i18n from "../shared/i18n/i18n";

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

type Lang = "es" | "en" | "ca";

function getLang(): Lang {
  const raw = (i18n.language || "es").slice(0, 2);
  if (raw === "en" || raw === "ca") return raw;
  return "es";
}

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

  const hasAnxiety =
    /(ansiedad|agobi|estres|estrés|tension|tensión|presion|presión|nervios)/i.test(t);

  const hasSleep =
    /(dormir|insomnio|sueño|sueno|me cuesta dormir|no puedo dormir)/i.test(t);

  if (intent === "ANXIETY_STRONG") {
    s.push("SOS", "Breathing");
  } else if (intent === "SLEEP") {
    s.push("Sounds", "Breathing");
  } else if (intent === "RUMINATION") {
    s.push("Mindfulness");
  } else if (intent === "STRESS") {
    s.push("Breathing");
  } else if (intent === "ASK_HELP") {
    s.push("Breathing", "Mindfulness");
  }

  if (hasAnxiety && !s.includes("Breathing")) s.push("Breathing");
  if (hasSleep && !s.includes("Sounds")) s.push("Sounds");

  return Array.from(new Set(s));
}

// ✅ COPY fuera de la función (no se recrea en cada llamada) + tipado
const COPY: Record<
  Lang,
  {
    empathicBase: string[];
    empathicExtra: Record<Intent, string[]>;
    continuity: string[];
    questions: Record<Intent, string[]>;
    plans: Record<Intent, string[]>;
  }
> = {
  es: {
    empathicBase: [
      "Gracias por compartir esto. Tiene sentido que te sientas así.",
      "Te leo con cariño. Gracias por ponerlo en palabras.",
      "Gracias por abrirte. Vamos paso a paso.",
      "Estoy contigo en esto. Vamos con calma.",
    ],
    empathicExtra: {
      ANXIETY_STRONG: [
        "Si ahora estás en modo “alarma”, lo primero es bajar el volumen del cuerpo.",
        "Cuando el cuerpo se acelera, no es que estés haciendo algo mal: es una respuesta de estrés.",
      ],
      SLEEP: [
        "Dormir se vuelve difícil cuando la mente sigue “en guardia”.",
        "Que hoy cueste dormir no significa que mañana vaya a ser igual.",
      ],
      ASK_HELP: [
        "Me gusta que pidas pautas concretas.",
        "Vamos a convertir esto en un plan pequeño y realista.",
      ],
      STRESS: ["Suena a que estás sosteniendo mucho.", "Esto puede ser agotador."],
      RUMINATION: [
        "Cuando la mente da vueltas, suele estar intentando protegerte.",
        "Pensar mucho no siempre ayuda; a veces solo cansa.",
      ],
      SADNESS: ["Tiene sentido que hoy te pese.", "Hoy no tienes que hacerlo perfecto."],
      ANGER: [
        "La rabia a veces señala un límite importante.",
        "Tu enfado puede estar protegiendo algo valioso.",
      ],
      CALM: [
        "Me alegra leer un poquito de alivio ahí.",
        "Qué bien que notes esa calma, aunque sea pequeña.",
      ],
      GENERAL: ["Estoy aquí contigo.", "Vamos poco a poco."],
    },
    continuity: [
      "Uniéndolo con lo anterior, quizá ahora conviene volver a lo básico: primero cuerpo, luego mente.",
      "Por el hilo, parece que necesitas más margen y menos presión contigo.",
      "Con el contexto, tiene sentido elegir un paso pequeño y repetirlo.",
    ],
    questions: {
      ANXIETY_STRONG: [
        "¿Qué nota tu cuerpo ahora mismo (pecho, garganta, barriga) del 0 al 10?",
        "¿Puedes nombrar una sola cosa que te haría sentir 1% más segura ahora?",
      ],
      SLEEP: [
        "¿Qué es lo que más se te activa por la noche?",
        "Si hoy no sale dormir pronto, ¿qué te ayudaría a descansar un poquito igual?",
      ],
      ASK_HELP: [
        "¿Qué te ayudaría más hoy: calmar el cuerpo, aclarar la mente o desahogarte?",
        "¿Qué parte es la más urgente de atender ahora mismo?",
      ],
      STRESS: [
        "¿Qué es lo que más te está drenando hoy?",
        "¿Qué podrías soltar (aunque sea un 5%) solo por hoy?",
      ],
      RUMINATION: [
        "¿Cuál es el pensamiento que más se repite?",
        "Si esto le pasara a una amiga, ¿qué le dirías?",
      ],
      SADNESS: [
        "¿Qué crees que necesita tu yo de hoy: compañía, descanso o comprensión?",
        "¿Qué gesto pequeño de cuidado sí sería posible hoy?",
      ],
      ANGER: ["¿Qué límite te hubiera gustado poner?", "¿Qué necesidad hay detrás de esa rabia?"],
      CALM: ["¿Qué te está ayudando a sostener esa calma?", "¿Qué detalle te gustaría repetir mañana?"],
      GENERAL: ["¿Qué necesitas ahora mismo: calma, claridad o apoyo?", "¿Cuál sería un paso pequeño y realista hoy?"],
    },
    plans: {
      ANXIETY_STRONG: [
        "1) Exhala largo (6–8s) x 6. 2) Baja hombros y suelta la mandíbula. 3) Mira 5 cosas a tu alrededor (ancla). 4) Si puedes, abre **SOS 60s** o **Respiración**.",
        "1) Mano en el pecho y otra en la barriga. 2) Inhala 4, exhala 6 (8 ciclos). 3) Dite: “estoy aquí, ahora”. 4) Luego ve a **SOS 60s**.",
      ],
      SLEEP: [
        "1) Baja luz y pantallas. 2) Respira 4-4-6 durante 2 min. 3) Si la mente insiste, escribe 3 líneas (descarga). 4) Pon **Sonidos** 10–20 min.",
        "1) Estira cuello/hombros 30s. 2) Exhala largo 6s (10 ciclos). 3) Pon **Sonidos** y permítete “descansar” aunque no duermas aún.",
      ],
      STRESS: [
        "1) Micro-pausa: 60s sin hacer nada. 2) Elige 1 prioridad y 1 cosa que puede esperar. 3) Respira 4-6 (inhala 4, exhala 6) x 8.",
        "1) Agua + hombros abajo. 2) Lista rápida: “lo que controlo / lo que no”. 3) Una acción mínima. 4) Un minuto de respiración.",
      ],
      RUMINATION: [
        "1) Pon nombre al pensamiento: “mi mente dice que…”. 2) Pregunta: “¿hecho o historia?”. 3) Vuelve al cuerpo con 3 respiraciones lentas. 4) Si te ayuda, 2 min de **Atención plena**.",
        "1) Escríbelo en 1 frase. 2) Añade: “ahora no necesito resolverlo”. 3) Haz 5-4-3-2-1 (sentidos). 4) **Mindfulness** 2–3 min.",
      ],
      ASK_HELP: [
        "1) Elige objetivo: calmar cuerpo / aclarar mente / desahogarte. 2) Haz un paso de 2 min. 3) Cierra con una acción pequeña (agua, ducha, paseo corto, mensaje).",
        "1) Una cosa que sí controlas. 2) Una cosa que sueltas hoy. 3) Un gesto mínimo de cuidado.",
      ],
      SADNESS: [
        "1) Nombra la emoción sin pelear: “hoy hay tristeza”. 2) Un gesto de cuidado (agua, manta, música). 3) Una cosa pequeñita que te acerque a sentirte acompañada.",
        "1) Pregunta amable: “¿qué necesito hoy?”. 2) Baja expectativas (modo suave). 3) Busca una micro-conexión (mensaje corto).",
      ],
      ANGER: [
        "1) Descarga segura: caminar rápido 3 min o apretar/soltar puños 10 veces. 2) Nombra el límite. 3) Decide una frase breve para protegerte.",
        "1) Respira y suelta mandíbula. 2) “Lo que me enfada es…”. 3) “Lo que necesito es…”. 4) Un límite pequeño hoy.",
      ],
      CALM: [
        "1) Identifica qué te ayudó. 2) Repite 1 cosa mañana. 3) Guarda un recordatorio (una frase) para días difíciles.",
        "1) Celebra el progreso mínimo. 2) Sostén una rutina suave. 3) Un gesto de cuidado para mantenerlo.",
      ],
      GENERAL: [
        "1) Elige: cuerpo / mente / desahogo. 2) Un paso pequeño. 3) Un cierre amable contigo.",
        "1) Una cosa que sí. 2) Una cosa que no. 3) Un gesto mínimo de cuidado.",
      ],
    },
  },

  en: {
    empathicBase: [
      "Thanks for sharing this. It makes sense you feel this way.",
      "I’m reading you with care. Thank you for putting it into words.",
      "Thank you for opening up. We’ll take it step by step.",
      "I’m here with you. Let’s go slowly.",
    ],
    empathicExtra: {
      ANXIETY_STRONG: [
        "If your body is in “alarm mode” right now, the first step is turning the volume down physically.",
        "When your body speeds up, you’re not doing anything wrong—this is a stress response.",
      ],
      SLEEP: [
        "Sleep gets harder when the mind stays “on guard”.",
        "A rough night doesn’t mean tomorrow will be the same.",
      ],
      ASK_HELP: [
        "It’s good you’re asking for clear, practical steps.",
        "Let’s turn this into a small plan you can actually do.",
      ],
      STRESS: ["Sounds like you’re carrying a lot.", "That can be exhausting."],
      RUMINATION: [
        "When the mind loops, it’s often trying to protect you.",
        "Thinking a lot doesn’t always help—sometimes it just drains you.",
      ],
      SADNESS: ["It makes sense that today feels heavy.", "You don’t have to be perfect today."],
      ANGER: ["Anger often points to an important boundary.", "Your anger may be protecting something valuable."],
      CALM: ["I’m glad there’s a bit of relief in there.", "It’s good you can feel that calm—even if it’s small."],
      GENERAL: ["I’m here with you.", "One step at a time."],
    },
    continuity: [
      "Connecting it with what you said before, it may help to go back to basics: body first, then mind.",
      "Looking at the thread, it sounds like you need more room and less pressure on yourself.",
      "With the context, a small step—and repeating it—makes a lot of sense.",
    ],
    questions: {
      ANXIETY_STRONG: [
        "What do you notice in your body right now (chest, throat, belly) from 0 to 10?",
        "Can you name one thing that would make you feel 1% safer right now?",
      ],
      SLEEP: [
        "What tends to get most activated at night for you?",
        "If sleep doesn’t come quickly tonight, what could help you rest a little anyway?",
      ],
      ASK_HELP: [
        "What would help most today: calming the body, clearing the mind, or venting?",
        "What feels most urgent to address right now?",
      ],
      STRESS: ["What’s draining you the most today?", "What could you let go of (even 5%) just for today?"],
      RUMINATION: ["What thought keeps repeating the most?", "If this were happening to a friend, what would you say to them?"],
      SADNESS: ["What does today’s you need most: company, rest, or understanding?", "What small act of care could be possible today?"],
      ANGER: ["What boundary did you wish you could set?", "What need is underneath the anger?"],
      CALM: ["What’s helping you hold onto that calm?", "What tiny detail would you like to repeat tomorrow?"],
      GENERAL: ["What do you need right now: calm, clarity, or support?", "What would be a small, realistic next step today?"],
    },
    plans: {
      ANXIETY_STRONG: [
        "1) Long exhale (6–8s) x 6. 2) Drop shoulders and unclench jaw. 3) Name 5 things you can see (anchor). 4) If you can, open **SOS 60s** or **Breathing**.",
        "1) One hand on chest, one on belly. 2) Inhale 4, exhale 6 (8 cycles). 3) Whisper: “I’m here, now.” 4) Then go to **SOS 60s**.",
      ],
      SLEEP: [
        "1) Dim lights and screens. 2) Breathe 4-4-6 for 2 min. 3) If thoughts insist, write 3 lines (brain dump). 4) Play **Sounds** 10–20 min.",
        "1) Stretch neck/shoulders 30s. 2) Longer exhale 6s (10 cycles). 3) Play **Sounds** and allow “rest” even if sleep isn’t here yet.",
      ],
      STRESS: [
        "1) Micro-pause: 60s doing nothing. 2) Choose 1 priority and 1 thing that can wait. 3) Breathe 4-6 (in 4, out 6) x 8.",
        "1) Water + shoulders down. 2) Quick list: “what I control / what I don’t”. 3) One tiny action. 4) One minute of breathing.",
      ],
      RUMINATION: [
        "1) Label it: “my mind says…”. 2) Ask: “fact or story?”. 3) Return to body with 3 slow breaths. 4) If helpful, 2 min of **Mindfulness**.",
        "1) Write it in 1 sentence. 2) Add: “I don’t have to solve this now.” 3) Do 5-4-3-2-1 (senses). 4) **Mindfulness** 2–3 min.",
      ],
      ASK_HELP: [
        "1) Pick a goal: calm body / clear mind / vent. 2) Do a 2-minute step. 3) Close with a small action (water, shower, short walk, a text).",
        "1) One thing you can control. 2) One thing you let go today. 3) One tiny act of care.",
      ],
      SADNESS: [
        "1) Name it gently: “there’s sadness today.” 2) One care gesture (water, blanket, music). 3) One tiny thing that brings you closer to feeling supported.",
        "1) Kind question: “what do I need today?” 2) Lower expectations (soft mode). 3) A micro-connection (short message).",
      ],
      ANGER: [
        "1) Safe release: brisk walk 3 min or clench/release fists 10 times. 2) Name the boundary. 3) Choose one short sentence to protect it.",
        "1) Breathe and unclench jaw. 2) “What makes me angry is…”. 3) “What I need is…”. 4) One small boundary today.",
      ],
      CALM: [
        "1) Notice what helped. 2) Repeat 1 thing tomorrow. 3) Save a reminder phrase for harder days.",
        "1) Celebrate the smallest progress. 2) Keep a gentle routine. 3) One care gesture to maintain it.",
      ],
      GENERAL: [
        "1) Choose: body / mind / vent. 2) One small step. 3) A kind closing.",
        "1) One yes. 2) One no. 3) One tiny act of care.",
      ],
    },
  },

  ca: {
    empathicBase: [
      "Gràcies per compartir això. Té sentit que et sentis així.",
      "Et llegeixo amb cura. Gràcies per posar-ho en paraules.",
      "Gràcies per obrir-te. Anirem pas a pas.",
      "Sóc aquí amb tu. Anem amb calma.",
    ],
    empathicExtra: {
      ANXIETY_STRONG: [
        "Si ara el cos està en mode “alarma”, el primer és baixar el volum físic.",
        "Quan el cos s’accelera, no estàs fent res malament: és una resposta d’estrès.",
      ],
      SLEEP: [
        "Dormir es fa difícil quan la ment continua “en guàrdia”.",
        "Que avui costi dormir no vol dir que demà sigui igual.",
      ],
      ASK_HELP: ["Està molt bé que demanis pautes concretes.", "Ho convertim en un pla petit i realista."],
      STRESS: ["Sona que estàs sostenint molt.", "Això pot esgotar."],
      RUMINATION: [
        "Quan la ment dona voltes, sovint intenta protegir-te.",
        "Pensar molt no sempre ajuda; a vegades només cansa.",
      ],
      SADNESS: ["Té sentit que avui pesi.", "Avui no has de fer-ho perfecte."],
      ANGER: ["La ràbia sovint assenyala un límit important.", "El teu enfado pot estar protegint una cosa valuosa."],
      CALM: ["M’alegra llegir una mica d’alleujament.", "Que bé notar aquesta calma, encara que sigui petita."],
      GENERAL: ["Sóc aquí amb tu.", "A poc a poc."],
    },
    continuity: [
      "Lligant-ho amb el que deies abans, pot ajudar tornar al bàsic: primer cos, després ment.",
      "Pel fil, sembla que necessites més marge i menys pressió amb tu.",
      "Amb el context, té sentit triar un pas petit i repetir-lo.",
    ],
    questions: {
      ANXIETY_STRONG: [
        "Què notes al cos ara mateix (pit, gola, panxa) del 0 al 10?",
        "Pots dir una sola cosa que et faria sentir 1% més segura ara?",
      ],
      SLEEP: [
        "Què és el que se’t dispara més a la nit?",
        "Si avui no surt dormir aviat, què t’ajudaria a descansar una mica igualment?",
      ],
      ASK_HELP: [
        "Què t’ajudaria més avui: calmar el cos, aclarir la ment o desfogar-te?",
        "Quina part és la més urgent d’atendre ara mateix?",
      ],
      STRESS: ["Què és el que més t’està drenat avui?", "Què podries deixar anar (encara que sigui un 5%) només per avui?"],
      RUMINATION: ["Quin pensament es repeteix més?", "Si li passés a una amiga, què li diries?"],
      SADNESS: ["Què necessita la teva jo d’avui: companyia, descans o comprensió?", "Quin gest petit de cura seria possible avui?"],
      ANGER: ["Quin límit t’hauria agradat posar?", "Quina necessitat hi ha al darrere d’aquesta ràbia?"],
      CALM: ["Què t’ajuda a sostenir aquesta calma?", "Quin detall t’agradaria repetir demà?"],
      GENERAL: ["Què necessites ara: calma, claredat o suport?", "Quin seria un pas petit i realista avui?"],
    },
    plans: {
      ANXIETY_STRONG: [
        "1) Exhala llarg (6–8s) x 6. 2) Baixa espatlles i afluixa la mandíbula. 3) Mira 5 coses (ancoratge). 4) Si pots, obre **SOS 60s** o **Respiració**.",
        "1) Una mà al pit i l’altra a la panxa. 2) Inhala 4, exhala 6 (8 cicles). 3) Digue’t: “soc aquí, ara”. 4) Després, **SOS 60s**.",
      ],
      SLEEP: [
        "1) Baixa llum i pantalles. 2) Respira 4-4-6 durant 2 min. 3) Si la ment insisteix, escriu 3 línies (descàrrega). 4) Posa **Sons** 10–20 min.",
        "1) Estira coll/espatlles 30s. 2) Exhala més llarg 6s (10 cicles). 3) Posa **Sons** i permet “descansar” encara que no dormis.",
      ],
      STRESS: [
        "1) Micro-pausa: 60s sense fer res. 2) Tria 1 prioritat i 1 cosa que pot esperar. 3) Respira 4-6 (inhala 4, exhala 6) x 8.",
        "1) Aigua + espatlles avall. 2) Llista ràpida: “què controlo / què no”. 3) Una acció mínima. 4) Un minut de respiració.",
      ],
      RUMINATION: [
        "1) Etiqueta: “la meva ment diu que…”. 2) Pregunta: “fet o història?”. 3) Torna al cos amb 3 respiracions lentes. 4) Si ajuda, 2 min d’**Atenció plena**.",
        "1) Escriu-ho en 1 frase. 2) Afegeix: “ara no ho he de resoldre”. 3) 5-4-3-2-1 (sentits). 4) **Mindfulness** 2–3 min.",
      ],
      ASK_HELP: [
        "1) Tria objectiu: calmar cos / aclarir ment / desfogar-te. 2) Un pas de 2 min. 3) Tanca amb una acció petita (aigua, dutxa, passeig, missatge).",
        "1) Una cosa que sí controles. 2) Una cosa que deixes anar avui. 3) Un gest mínim de cura.",
      ],
      SADNESS: [
        "1) Anomena-la amb suavitat: “avui hi ha tristesa”. 2) Un gest de cura (aigua, manta, música). 3) Una cosa petita que t’apropi a sentir-te acompanyada.",
        "1) Pregunta amable: “què necessito avui?”. 2) Baixa expectatives (mode suau). 3) Micro-connexió (missatge curt).",
      ],
      ANGER: [
        "1) Descàrrega segura: caminar ràpid 3 min o estrènyer/afluixar punys 10 vegades. 2) Nomena el límit. 3) Tria una frase curta per protegir-lo.",
        "1) Respira i afluixa mandíbula. 2) “El que m’enfada és…”. 3) “El que necessito és…”. 4) Un límit petit avui.",
      ],
      CALM: [
        "1) Identifica què t’ha ajudat. 2) Repeteix 1 cosa demà. 3) Guarda una frase recordatori per dies difícils.",
        "1) Celebra el progrés mínim. 2) Mantén una rutina suau. 3) Un gest de cura per sostenir-ho.",
      ],
      GENERAL: [
        "1) Tria: cos / ment / desfogament. 2) Un pas petit. 3) Un tancament amable.",
        "1) Un sí. 2) Un no. 3) Un gest mínim de cura.",
      ],
    },
  },
};

function empathicLine(seed: number, intent: Intent, lang: Lang) {
  const L = COPY[lang];
  return pick(L.empathicBase, seed) + " " + pick(L.empathicExtra[intent], seed + 9);
}

function oneSoftQuestion(seed: number, intent: Intent, lang: Lang) {
  const L = COPY[lang];
  return pick(L.questions[intent], seed + 21);
}

function faqPlan(seed: number, intent: Intent, lang: Lang) {
  const L = COPY[lang];
  return pick(L.plans[intent], seed + 55);
}

function continuityLine(seed: number, context: SimpleMsg[], lang: Lang) {
  const lastUser = [...context].reverse().find((m) => m.role === "user")?.text;
  if (!lastUser) return "";
  return pick(COPY[lang].continuity, seed + 77);
}

export async function getAIReflection(
  userText: string,
  context: SimpleMsg[] = [],
  mode: JournalMode = "suave"
): Promise<JournalResult> {
  const lang = getLang();

  // UX: pequeño delay para “pensar”
  await new Promise((r) => setTimeout(r, 300));

  const seed = hashSeed(userText + "|" + (context[context.length - 1]?.text ?? ""));
  const intent = detectIntent(userText);

  const suggestions = detectSuggestions(userText, intent);

  const shouldBePractical =
    mode === "practico" || mode === "breve"
      ? mode === "practico"
      : intent === "ASK_HELP" || intent === "ANXIETY_STRONG" || intent === "SLEEP";

  const line1 = empathicLine(seed, intent, lang);
  const cont = continuityLine(seed, context, lang);
  const plan = faqPlan(seed, intent, lang);
  const q1 = oneSoftQuestion(seed, intent, lang);

  if (mode === "breve") {
    const out = [line1, q1].filter(Boolean).join(" ");
    return { text: clampWords(out, 95), suggestions };
  }

  if (mode === "preguntas") {
    const q2 = oneSoftQuestion(seed + 999, intent, lang);
    const out = [line1, cont, q1, q2].filter(Boolean).join(" ");
    return { text: clampWords(out, 160), suggestions };
  }

  if (mode === "practico" || shouldBePractical) {
    const out = [line1, cont, plan, q1].filter(Boolean).join(" ");
    return { text: clampWords(out, 190), suggestions };
  }

  const out = [line1, cont, q1].filter(Boolean).join(" ");
  return { text: clampWords(out, 170), suggestions };
}
