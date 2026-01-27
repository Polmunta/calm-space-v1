import React, { useCallback } from "react";
import { View, Text } from "react-native";
import { screenStyles } from "../../shared/ui/screenStyles";
import { useFocusEffect } from "@react-navigation/native";



export default function BreathingScreen() {
  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Respiración</Text>
        <Text style={screenStyles.subtitle}>
          Ejercicios guiados para bajar el estrés en minutos.
        </Text>
      </View>

      <View style={screenStyles.card}>
        <Text>Próximo: temporizador de respiración 4-4-4-4.</Text>
      </View>
    </View>
  );
}
