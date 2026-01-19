import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  header: {
    marginTop: 12,
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(74, 74, 74, 0.7)",
  },
  card: {
    backgroundColor: colors.primarySoft,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(198, 183, 226, 0.35)",
  },
});
