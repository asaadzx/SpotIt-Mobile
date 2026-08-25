import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { getClaim } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";

const STATUS_COLORS = {
  pending: Colors.warning,
  verified: Colors.success,
  rejected: Colors.danger,
};

export default function ClaimDetail() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getClaim(id, token)
      .then((res) => setClaim(res.data))
      .catch(() => Alert.alert("Error", "Failed to load claim"))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Claim not found</Text>
      </View>
    );
  }

  const status = (claim.status || "pending").toLowerCase();
  const code = claim.claim_code || id;

  if (fullscreen) {
    return (
      <TouchableOpacity style={styles.fullscreen} onPress={() => setFullscreen(false)} activeOpacity={1}>
        <Text style={styles.fullscreenCode}>{code}</Text>
        <QRCode value={code} size={300} bgColor={Colors.white} fgColor={Colors.text} />
        <Text style={styles.fullscreenHint}>Tap anywhere to exit</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.body}>
          <Text style={styles.title}>{claim.item_title || claim.title || "Item"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[status] || Colors.gray) + "20" }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[status] || Colors.gray }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
          <Text style={styles.location}>📍 {claim.location || claim.item_location || "Unknown"}</Text>

          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>Claim Code</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.codeValue}>{code}</Text>
            </TouchableOpacity>
            <Text style={styles.codeHint}>Show this code to the admin</Text>
          </View>

          <View style={styles.qrSection}>
            <Text style={styles.qrLabel}>QR Code</Text>
            <TouchableOpacity onPress={() => setFullscreen(true)} style={styles.qrBox}>
              <QRCode value={String(code)} size={200} bgColor={Colors.white} fgColor={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.qrHint}>Tap to view fullscreen</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  errorText: { fontSize: 16, color: Colors.gray },
  backBtn: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backText: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.text, marginBottom: 8 },
  statusBadge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  statusText: { fontSize: 13, fontWeight: "600" },
  location: { fontSize: 14, color: Colors.gray, marginBottom: 24 },
  codeSection: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 20,
    alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: Colors.accent,
  },
  codeLabel: { fontSize: 13, color: Colors.secondary, marginBottom: 8 },
  codeValue: { fontSize: 32, fontWeight: "bold", color: Colors.primary, letterSpacing: 4 },
  codeHint: { fontSize: 12, color: Colors.gray, marginTop: 8 },
  qrSection: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 20,
    alignItems: "center", borderWidth: 1, borderColor: Colors.accent,
  },
  qrLabel: { fontSize: 13, color: Colors.secondary, marginBottom: 12 },
  qrBox: { padding: 16, backgroundColor: Colors.white, borderRadius: 8 },
  qrHint: { fontSize: 12, color: Colors.gray, marginTop: 8 },
  fullscreen: {
    flex: 1, backgroundColor: Colors.background, justifyContent: "center",
    alignItems: "center", padding: 40,
  },
  fullscreenCode: {
    fontSize: 48, fontWeight: "bold", color: Colors.primary,
    letterSpacing: 6, marginBottom: 32,
  },
  fullscreenHint: { fontSize: 14, color: Colors.secondary, marginTop: 24 },
});
