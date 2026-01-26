CalmSpaceV1 — Resumen técnico completo (V1)
Objetivo

App de bienestar con estética lavanda y UI minimalista. V1 incluye:

Botón principal SOS 60s

Respiración

Atención plena

Diario con guía “tipo IA” offline (sin APIs)

Sonidos Naturaleza (audio local en bucle)

Todo pensado para poder escalar (yoga, meditaciones, vídeos, etc.) sin rehacer arquitectura.

Tecnología / stack

Expo + React Native + TypeScript

React Navigation (stack)

AsyncStorage para guardar datos localmente (sin nube)

expo-av para reproducir audio local

Diseño (tema)

Colores lavanda definidos en:

src/shared/theme/colors.ts

Estilo de pantallas:

src/shared/ui/screenStyles.ts

Navegación (rutas)

Home → HomeScreen.tsx

SOS → src/features/sos/SOSScreen.tsx

SOSDetail → src/features/sos/SOSDetailScreen.tsx

Breathing → src/features/breathing/BreathingScreen.tsx (existente)

Mindfulness → src/features/mindfulness/MindfulnessScreen.tsx (existente)

Journal → src/features/journal/JournalScreen.tsx

Sounds → src/features/sounds/SoundsScreen.tsx

En App.tsx deben estar importadas y registradas en el Stack.

Home (UI principal)

Archivo:

src/HomeScreen.tsx

Características:

Botón principal destacado “SOS 60s”

Tarjetas: Respiración / Atención plena / Diario / Sonidos

Iconos con MaterialCommunityIcons

SOS 60s

Archivos:

src/features/sos/SOSScreen.tsx

src/features/sos/SOSDetailScreen.tsx

Contenido:

Lista de accesos rápidos (ansiedad, agobio, sueño, tristeza, foco, tensión)

Detalle con pasos + botones que navegan a:

Respiración

Sonidos

Sonidos Naturaleza

Audio en:

assets/audio/

Ejemplos usados:

lluvia.wav, olas.wav, bosque.wav, rio.wav, tormenta.wav

Pantalla:

src/features/sounds/SoundsScreen.tsx

UX:

Cuadrícula (2 columnas)

Tiles con icono representativo (gratis)

Estado “Cargando…” al iniciar

En bucle (loop) por defecto

Botón “Detener” estable

Nota: audios .wav pueden tardar un poco más en iniciar; opción futura: convertir a .mp3 para carga más rápida.

Diario (conversaciones locales + guía offline)

Pantalla:

src/features/journal/JournalScreen.tsx

Servicio IA offline:

src/services/aiJournal.service.ts

Guardado local

Máximo 10 conversaciones

Máximo 60 mensajes por conversación

Máximo 1000 caracteres por mensaje

IA offline

getAIReflection(userText, context, mode) devuelve:

text (respuesta)

suggestions (acciones recomendadas)

"SOS" | "Breathing" | "Sounds" | "Mindfulness"

UI de sugerencias

Debajo del chat aparecen chips/botones según el texto del usuario:

Abrir SOS 60s

Ir a Respiración

Ir a Sonidos

Atención plena

Migración de datos (v1/v2/v3 → v3)

Claves encontradas:

calmspace.journal.conversations.v1

calmspace.journal.conversations.v2

calmspace.journal.conversations.v3

calmspace.journal.v1

La versión final fusiona todo en v3:

Lee v1/v2/v3 y legacy

Normaliza y une

Recorta límites

Guarda definitivo en calmspace.journal.conversations.v3

Problemas resueltos durante el desarrollo

Estructura duplicada de carpetas (src fuera vs dentro): se trabaja dentro del proyecto Expo correcto.

Errores de import de rutas (./src/...) corregidos.

Web (tecla w) requería react-dom y react-native-web si se quiere soporte web.

API OpenAI en Vercel descartada por cuota/coste: se usa guía offline.

Próximos pasos recomendados (faciles y gratis)

Meditaciones guiadas (usar meditacion.mp3 / relajacion.mp3) en una nueva pantalla.

Biblioteca pequeña de “prácticas” de Mindfulness (5–10 textos) con temporizador.

Favoritos (sonidos/prácticas) local.

Rutina mañana/noche.

Mejorar IA offline: respuestas más específicas según intención (ansiedad → recomendar SOS/respirar; dormir → sonidos + respiración, etc.)