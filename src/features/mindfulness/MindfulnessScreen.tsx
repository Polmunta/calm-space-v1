import React from "react";
import { View, Text } from "react-native";
import { screenStyles } from "../../shared/ui/screenStyles";

export default function MindfulnessScreen() {
  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Atención plena</Text>
        <Text style={screenStyles.subtitle}>
          Mini prácticas para volver al presente.
        </Text>
      </View>

      <View style={screenStyles.card}>
        <Text>Próximo: ejercicios de 1–3 minutos con audio/texto.</Text>
      </View>
    </View>
  );
}
