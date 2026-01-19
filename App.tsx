import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/HomeScreen";
import BreathingScreen from "./src/features/breathing/BreathingScreen";
import MindfulnessScreen from "./src/features/mindfulness/MindfulnessScreen";
import JournalScreen from "./src/features/journal/JournalScreen";

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
          options={{ title: "Calm Space" }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
