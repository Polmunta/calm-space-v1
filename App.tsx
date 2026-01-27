import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/HomeScreen";
import BreathingScreen from "./src/features/breathing/BreathingScreen";
import MindfulnessScreen from "./src/features/mindfulness/MindfulnessScreen";
import JournalScreen from "./src/features/journal/JournalScreen";
import SoundsScreen from "./src/features/sounds/SoundsScreen";
import SOSScreen from "./src/features/sos/SOSScreen";
import SOSDetailScreen from "./src/features/sos/SOSDetailScreen";
import MeditationsScreen from "./src/features/meditations/MeditationsScreen";
import MeditationPlayerScreen from "./src/features/meditations/MeditationPlayerScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#FAF9FC" },
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Breathing"
          component={BreathingScreen}
          options={{ title: "Respiración" }}
        />
        <Stack.Screen
          name="Mindfulness"
          component={MindfulnessScreen}
          options={{ title: "Atención plena" }}
        />
        <Stack.Screen
          name="Journal"
          component={JournalScreen}
          options={{ title: "Diario" }}
        />
        <Stack.Screen
          name="Sounds"
          component={SoundsScreen}
          options={{ title: "Sonidos" }}
        />
        <Stack.Screen
          name="SOS"
          component={SOSScreen}
          options={{ title: "SOS 60s" }}
        />
        <Stack.Screen
          name="SOSDetail"
          component={SOSDetailScreen}
          options={{ title: "SOS" }}
        />

        <Stack.Screen
          name="Meditations"
          component={MeditationsScreen}
          options={{ title: "Meditaciones" }}
        />
        <Stack.Screen
          name="MeditationPlayer"
          component={MeditationPlayerScreen}
          options={{ title: "Sesión" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
