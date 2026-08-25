import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";

export default function FilterPanel({ categories, filters, onApply, onClear }) {
  const [selected, setSelected] = useState(filters);

  const toggleCategory = (cat) => {
    setSelected((prev) => ({
      ...prev,
      category: prev.category === cat ? undefined : cat,
    }));
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {(Array.isArray(categories) ? categories : []).map((cat) => {
          const name = typeof cat === "string" ? cat : cat.name;
          return (
            <TouchableOpacity
              key={name}
              style={[styles.chip, selected.category === name && styles.chipActive]}
              onPress={() => toggleCategory(name)}
            >
              <Text style={[styles.chipText, selected.category === name && styles.chipTextActive]}>
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(selected)}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.accent,
  },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.lightGray, borderWidth: 1, borderColor: Colors.accent,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text },
  chipTextActive: { color: Colors.white },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  clearBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  clearText: { fontSize: 14, color: Colors.gray },
  applyBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  applyText: { fontSize: 14, color: Colors.white, fontWeight: "600" },
});
