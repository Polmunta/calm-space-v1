import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { screenStyles } from "../../shared/ui/screenStyles";
import { colors } from "../../shared/theme/colors";

export default function JournalScreen() {
  const [text, setText] = useState("");

  const onSave = () => {
    if (!text.trim()) {
      Alert.alert("Diario", "Escribe algo antes de guardar.");
      return;
    }
    Alert.alert("Diario", "Guardado (por ahora solo en memoria).");
    setText("");
  };

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Diario</Text>
        <Text style={screenStyles.subtitle}>
          Escribe cómo te sientes. En el siguiente paso lo conectamos con IA.
        </Text>
      </View>

      <View style={screenStyles.card}>
        <Text style={styles.label}>Tu entrada</Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Hoy me siento..."
          placeholderTextColor="rgba(74, 74, 74, 0.45)"
          multiline
          style={styles.input}
        />

        <Pressable onPress={onSave} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Guardar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  input: {
    minHeight: 140,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
    color: colors.text,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 14,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
