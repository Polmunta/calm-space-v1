import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import i18n, { initAppLanguage } from "./src/shared/i18n/i18n";
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
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      {/* ✅ ya NO necesitamos header aquí; lo pintamos dentro de Home */}
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function SOSStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SOS" component={SOSScreen} options={{ title: "SOS" }} />
      <Stack.Screen name="SOSDetail" component={SOSDetailScreen} options={{ title: "SOS" }} />
    </Stack.Navigator>
  );
}

function BreathingStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Breathing" component={BreathingScreen} options={{ title: "Respiración" }} />
    </Stack.Navigator>
  );
}

function MindfulnessStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Mindfulness" component={MindfulnessScreen} options={{ title: "Atención plena" }} />
    </Stack.Navigator>
  );
}

function SoundsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Sounds" component={SoundsScreen} options={{ title: "Sonidos" }} />
    </Stack.Navigator>
  );
}

function MeditationsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Meditations" component={MeditationsScreen} options={{ title: "Meditaciones" }} />
      <Stack.Screen name="MeditationPlayer" component={MeditationPlayerScreen} options={{ title: "Meditaciones" }} />
    </Stack.Navigator>
  );
}

function JournalStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Journal" component={JournalScreen} options={{ title: "Diario" }} />
    </Stack.Navigator>
  );
}

function Tabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "rgba(74,74,74,0.55)",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "rgba(198, 183, 226, 0.35)",
          borderTopWidth: 1,
          height: 74,
          paddingTop: 10,
          paddingBottom: Platform.OS === "android" ? 18 : 24,
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

  useEffect(() => {
    (async () => {
      try {
        await initAppLanguage(); // ✅ carga idioma guardado (o sistema)
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      {/* ✅ HEADER OFF SIEMPRE: se van las líneas/banners */}
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={Tabs} />

        {/* Pantallas fuera de Tabs */}
        <RootStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: true,
            title: "Perfil",
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
            title: "Idioma",
            headerStyle: { backgroundColor: "#FAF9FC" },
            headerTintColor: colors.primary,
            headerTitleStyle: { fontWeight: "800", color: colors.primary },
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
