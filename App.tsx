import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { initAppLanguage } from "./src/shared/i18n/i18n";
import { colors } from "./src/shared/theme/colors";

// screens
import HomeScreen from "./src/HomeScreen";
import BreathingScreen from "./src/features/breathing/BreathingScreen";
import MindfulnessScreen from "./src/features/mindfulness/MindfulnessScreen";
import JournalScreen from "./src/features/journal/JournalScreen";
import SoundsScreen from "./src/features/sounds/SoundsScreen";
import SOSScreen from "./src/features/sos/SOSScreen";
import SOSDetailScreen from "./src/features/sos/SOSDetailScreen";
import MeditationsScreen from "./src/features/meditations/MeditationsScreen";
import MeditationPlayerScreen from "./src/features/meditations/MeditationPlayerScreen";
import RoutineScreen from "./src/features/routine/RoutineScreen";

// root (fuera de tabs)
import ProfileScreen from "./src/features/profile/ProfileScreen";
import LanguageScreen from "./src/features/settings/LanguageScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: "#FAF9FC" },
  headerTitleStyle: { fontWeight: "800" as const, color: colors.primary },
  headerTintColor: colors.primary,
};

function HomeStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Routine" component={RoutineScreen} options={{ title: t("nav.routine") }} />
    </Stack.Navigator>
  );
}

function SOSStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SOS" component={SOSScreen} options={{ title: t("nav.sos") }} />
      <Stack.Screen name="SOSDetail" component={SOSDetailScreen} options={{ title: t("nav.sos") }} />
    </Stack.Navigator>
  );
}

function BreathingStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Breathing" component={BreathingScreen} options={{ title: t("nav.breathing") }} />
    </Stack.Navigator>
  );
}

function MindfulnessStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Mindfulness" component={MindfulnessScreen} options={{ title: t("nav.mindfulness") }} />
    </Stack.Navigator>
  );
}

function SoundsStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Sounds" component={SoundsScreen} options={{ title: t("nav.sounds") }} />
    </Stack.Navigator>
  );
}

function MeditationsStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Meditations" component={MeditationsScreen} options={{ title: t("nav.meditations") }} />
      <Stack.Screen
        name="MeditationPlayer"
        component={MeditationPlayerScreen}
        options={{ title: t("nav.meditations") }}
      />
    </Stack.Navigator>
  );
}

function JournalStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Journal" component={JournalScreen} options={{ title: t("nav.journal") }} />
    </Stack.Navigator>
  );
}

function Tabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // ✅ Altura base + inset real (esto evita que el tabBar quede tapado)
  const baseHeight = 58;
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      // ✅ Importantísimo: forzar el inset que debe respetar el tab bar
      safeAreaInsets={{ bottom: insets.bottom }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "rgba(74,74,74,0.55)",
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "rgba(198, 183, 226, 0.35)",
          borderTopWidth: 1,

          // ✅ NO valores fijos para todos: usar el inset real
          height: baseHeight + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
        },

        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => {
          const s = Math.max(22, size);
          let icon: any = "home-outline";
          if (route.name === "TabHome") icon = "home-outline";
          if (route.name === "TabSOS") icon = "lifebuoy";
          if (route.name === "TabBreathing") icon = "weather-windy";
          if (route.name === "TabMindfulness") icon = "target";
          if (route.name === "TabSounds") icon = "music-note-outline";
          if (route.name === "TabMeditations") icon = "meditation";
          if (route.name === "TabJournal") icon = "notebook-outline";
          return <MaterialCommunityIcons name={icon} size={s} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TabHome" component={HomeStack} options={{ title: t("tabs.home") }} />
      <Tab.Screen name="TabSOS" component={SOSStack} options={{ title: t("tabs.sos") }} />
      <Tab.Screen name="TabBreathing" component={BreathingStack} options={{ title: t("tabs.breathing") }} />
      <Tab.Screen name="TabMindfulness" component={MindfulnessStack} options={{ title: t("tabs.mindfulness") }} />
      <Tab.Screen name="TabSounds" component={SoundsStack} options={{ title: t("tabs.sounds") }} />
      <Tab.Screen name="TabMeditations" component={MeditationsStack} options={{ title: t("tabs.meditations") }} />
      <Tab.Screen name="TabJournal" component={JournalStack} options={{ title: t("tabs.journal") }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        await initAppLanguage();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Tabs" component={Tabs} />

          <RootStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: t("nav.profile"),
              headerStyle: { backgroundColor: "#FAF9FC" },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: "800", color: colors.primary },
            }}
          />
          <RootStack.Screen
            name="Language"
            component={LanguageScreen}
            options={{
              headerShown: true,
              title: t("nav.language"),
              headerStyle: { backgroundColor: "#FAF9FC" },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: "800", color: colors.primary },
            }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
