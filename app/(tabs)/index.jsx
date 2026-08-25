import { useState, useEffect, useCallback } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getItems, getCategories } from "../../services/api";
import { Colors } from "../../constants/colors";
import FilterPanel from "../../components/FilterPanel";
import EmptyState from "../../components/EmptyState";

export default function Home() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchItems = useCallback(async () => {
    try {
      const params = { status: "unclaimed" };
      if (search) params.search = search;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      const res = await getItems(params);
      setItems(res.data.items || res.data || []);
    } catch {
      setItems([]);
    }
  }, [search, filters]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.categories || res.data || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchItems(), fetchCategories()]).finally(() => setLoading(false));
  }, [fetchItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category || "General"}</Text>
        </View>
        <Text style={styles.cardMeta} numberOfLines={1}>📍 {item.location_found || item.location || "Unknown"}</Text>
        <Text style={styles.cardDate}>{item.date_found || item.created_at || ""}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>SpotIt</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={Colors.secondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchItems}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterBtnText}>⚙</Text>
        </TouchableOpacity>
      </View>
      {showFilters && (
        <FilterPanel
          categories={categories}
          filters={filters}
          onApply={(f) => { setFilters(f); setShowFilters(false); }}
          onClear={() => { setFilters({}); setShowFilters(false); }}
        />
      )}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          contentContainerStyle={items.length === 0 && styles.emptyList}
          ListEmptyComponent={<EmptyState message="No items match your search" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    fontSize: 28, fontWeight: "bold", color: Colors.primary,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  searchRow: {
    flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8,
  },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.accent, borderRadius: 12,
    padding: 12, fontSize: 16, backgroundColor: Colors.white, color: Colors.text,
  },
  filterBtn: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.accent, justifyContent: "center", alignItems: "center",
  },
  filterBtnText: { fontSize: 20 },
  card: {
    flexDirection: "row", backgroundColor: Colors.white, borderRadius: 12,
    marginHorizontal: 16, marginBottom: 12, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.accent,
  },
  cardImage: { width: 100, height: 100 },
  cardImagePlaceholder: {
    backgroundColor: Colors.lightGray, justifyContent: "center", alignItems: "center",
  },
  placeholderText: { color: Colors.secondary, fontSize: 12 },
  cardBody: { flex: 1, padding: 12, justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  badge: {
    alignSelf: "flex-start", backgroundColor: Colors.primary + "20",
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4,
  },
  badgeText: { fontSize: 11, color: Colors.primary, fontWeight: "600" },
  cardMeta: { fontSize: 12, color: Colors.gray },
  cardDate: { fontSize: 11, color: Colors.secondary, marginTop: 2 },
  emptyList: { flex: 1 },
});
