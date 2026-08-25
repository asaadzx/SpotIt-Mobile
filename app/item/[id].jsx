import { useState, useEffect } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getItem, createClaim } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";

export default function ItemDetail() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getItem(id)
      .then((res) => setItem(res.data))
      .catch(() => Alert.alert("Error", "Failed to load item"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClaim = async () => {
    setShowConfirm(false);
    setClaiming(true);
    try {
      await createClaim({ item_id: Number(id) }, token);
      Alert.alert("Success", "Claim submitted!", [
        { text: "OK", onPress: () => router.replace("/(tabs)/claims") },
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.detail || "Failed to submit claim");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: Colors.secondary, fontSize: 18 }}>No Image</Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category || "General"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Location</Text>
            <Text style={styles.infoValue}>{item.location_found || item.location || "Unknown"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Date Found</Text>
            <Text style={styles.infoValue}>{item.date_found || item.created_at || "Unknown"}</Text>
          </View>
          {item.description ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📝 Description</Text>
              <Text style={styles.infoValue}>{item.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.claimBtn, claiming && { opacity: 0.7 }]}
        onPress={() => setShowConfirm(true)}
        disabled={claiming}
      >
        {claiming ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.claimBtnText}>Claim This Item</Text>
        )}
      </TouchableOpacity>
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Submit Claim?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to claim "{item.title}"?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowConfirm(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleClaim}>
                <Text style={styles.modalConfirmText}>Claim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  errorText: { fontSize: 16, color: Colors.gray },
  backBtn: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backText: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  image: { width: "100%", height: 250, resizeMode: "cover" },
  imagePlaceholder: { backgroundColor: Colors.lightGray, justifyContent: "center", alignItems: "center" },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.text, marginBottom: 8 },
  badge: {
    alignSelf: "flex-start", backgroundColor: Colors.primary + "20",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16,
  },
  badgeText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  infoRow: { marginBottom: 12 },
  infoLabel: { fontSize: 13, color: Colors.secondary, marginBottom: 2 },
  infoValue: { fontSize: 16, color: Colors.text },
  claimBtn: {
    backgroundColor: Colors.primary, margin: 16, borderRadius: 12,
    padding: 16, alignItems: "center",
  },
  claimBtnText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center",
  },
  modalBox: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 24, width: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.text, marginBottom: 8 },
  modalText: { fontSize: 14, color: Colors.gray, marginBottom: 20 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalCancel: { paddingVertical: 8, paddingHorizontal: 16 },
  modalCancelText: { fontSize: 14, color: Colors.gray },
  modalConfirm: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  modalConfirmText: { fontSize: 14, color: Colors.white, fontWeight: "600" },
});
