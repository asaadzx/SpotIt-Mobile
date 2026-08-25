import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";

export default function EmptyState({ message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📦</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  icon: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: 16, color: Colors.secondary, textAlign: "center" },
});
