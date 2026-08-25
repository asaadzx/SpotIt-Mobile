import { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyClaims } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";
import EmptyState from "../../components/EmptyState";
import ReportFoundModal from "../../components/ReportFoundModal";

const STATUS_COLORS = {
  pending: Colors.warning,
  verified: Colors.success,
  rejected: Colors.danger,
};

export default function Claims() {
  const { token } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const router = useRouter();

  const fetchClaims = async () => {
    try {
      const res = await getMyClaims(token);
      setClaims(res.data.claims || res.data || []);
    } catch {
      setClaims([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchClaims().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClaims();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const status = (item.status || "pending").toLowerCase();
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/claim/${item.claim_code || item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.item_title || item.title || "Item"}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[status] || Colors.gray) + "20" }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[status] || Colors.gray }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.cardMeta}>Code: {item.claim_code || "N/A"}</Text>
        <Text style={styles.cardDate}>{item.created_at || ""}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Claims</Text>
        <TouchableOpacity style={styles.reportBtn} onPress={() => setShowReport(true)}>
          <Text style={styles.reportBtnText}>+ Report Found</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item, i) => String(item.claim_code || item.id || i)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          contentContainerStyle={claims.length === 0 && { flex: 1 }}
          ListEmptyComponent={<EmptyState message="No claims yet" />}
        />
      )}
      <ReportFoundModal visible={showReport} onClose={() => setShowReport(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  header: { fontSize: 28, fontWeight: "bold", color: Colors.primary },
  reportBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  reportBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
  card: {
    backgroundColor: Colors.white, borderRadius: 12, marginHorizontal: 16,
    marginBottom: 12, padding: 16, borderWidth: 1, borderColor: Colors.accent,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: "600" },
  cardMeta: { fontSize: 13, color: Colors.gray, marginBottom: 2 },
  cardDate: { fontSize: 12, color: Colors.secondary },
});
