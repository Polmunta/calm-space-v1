import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "./src/shared/theme/colors";

import HomeScreen from "./src/HomeScreen";
import BreathingScreen from "./src/features/breathing/BreathingScreen";
import MindfulnessScreen from "./src/features/mindfulness/MindfulnessScreen";
import JournalScreen from "./src/features/journal/JournalScreen";
import SoundsScreen from "./src/features/sounds/SoundsScreen";
import SOSScreen from "./src/features/sos/SOSScreen";
import SOSDetailScreen from "./src/features/sos/SOSDetailScreen";
import MeditationsScreen from "./src/features/meditations/MeditationsScreen";
import MeditationPlayerScreen from "./src/features/meditations/MeditationPlayerScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** ✅ Header común: lavanda + back */
const stackScreenOptions = {
  headerStyle: { backgroundColor: "#FAF9FC" },
  headerTitleStyle: {
    fontWeight: "800" as const,
    color: colors.primary,
  },
  headerTintColor: colors.primary,
  headerBackTitleVisible: false,
};

/** HOME stack */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "" }} // sin título arriba en Home
      />
    </Stack.Navigator>
  );
}

/** SOS stack */
function SOSStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SOS" component={SOSScreen} options={{ title: "SOS" }} />
      <Stack.Screen name="SOSDetail" component={SOSDetailScreen} options={{ title: "SOS" }} />
    </Stack.Navigator>
  );
}

/** Breathing stack */
function BreathingStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Breathing" component={BreathingScreen} options={{ title: "Respiración" }} />
    </Stack.Navigator>
  );
}

/** Mindfulness stack */
function MindfulnessStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Mindfulness" component={MindfulnessScreen} options={{ title: "Atención plena" }} />
    </Stack.Navigator>
  );
}

/** Sounds stack */
function SoundsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Sounds" component={SoundsScreen} options={{ title: "Sonidos" }} />
    </Stack.Navigator>
  );
}

/** Meditations stack */
function MeditationsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Meditations" component={MeditationsScreen} options={{ title: "Meditaciones" }} />
      <Stack.Screen
        name="MeditationPlayer"
        component={MeditationPlayerScreen}
        options={{ title: "Meditaciones" }}
      />
    </Stack.Navigator>
  );
}

/** Journal stack */
function JournalStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Journal" component={JournalScreen} options={{ title: "Diario" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // el header lo lleva cada Stack
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: "rgba(74,74,74,0.55)",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "rgba(198, 183, 226, 0.35)",
            borderTopWidth: 1,
            height: 74,
            paddingTop: 10,
            paddingBottom: Platform.OS === "android" ? 20 : 26, // ✅ sube la barra
            marginBottom: 2, // 👈 sube la barra (prueba 6–12)
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
        <Tab.Screen name="TabHome" component={HomeStack} options={{ title: "Inicio" }} />
        <Tab.Screen name="TabSOS" component={SOSStack} options={{ title: "SOS" }} />
        <Tab.Screen name="TabBreathing" component={BreathingStack} options={{ title: "Respira" }} />
        <Tab.Screen name="TabMindfulness" component={MindfulnessStack} options={{ title: "Foco" }} />
        <Tab.Screen name="TabSounds" component={SoundsStack} options={{ title: "Sonidos" }} />
        <Tab.Screen name="TabMeditations" component={MeditationsStack} options={{ title: "Medita" }} />
        <Tab.Screen name="TabJournal" component={JournalStack} options={{ title: "Diario" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
