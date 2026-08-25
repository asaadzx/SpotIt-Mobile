import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || "Student"}</Text>
        <Text style={styles.email}>{user?.email || "No email"}</Text>
        {user?.student_id ? (
          <Text style={styles.studentId}>ID: {user.student_id}</Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loggingOut}>
        {loggingOut ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.logoutText}>Logout</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    fontSize: 28, fontWeight: "bold", color: Colors.primary,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, marginHorizontal: 16,
    padding: 24, alignItems: "center", borderWidth: 1, borderColor: Colors.accent,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + "20",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: Colors.primary },
  name: { fontSize: 20, fontWeight: "bold", color: Colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.secondary, marginBottom: 4 },
  studentId: { fontSize: 13, color: Colors.gray },
  logoutBtn: {
    backgroundColor: Colors.danger, marginHorizontal: 16, marginTop: 24,
    borderRadius: 12, padding: 16, alignItems: "center",
  },
  logoutText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
