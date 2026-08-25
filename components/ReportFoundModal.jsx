import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { createItem, uploadImage, getCategories } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../constants/colors";

export default function ReportFoundModal({ visible, onClose }) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      getCategories()
        .then((res) => setCategories(res.data.categories || res.data || []))
        .catch(() => {});
    }
  }, [visible]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera access is required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Enter a title");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Error", "Enter a location");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createItem(
        { title: title.trim(), category, location_found: location.trim(), description: description.trim() },
        token
      );
      const itemId = res.data.id;
      if (image && itemId) {
        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          name: "photo.jpg",
          type: "image/jpeg",
        });
        await uploadImage(itemId, formData, token);
      }
      Alert.alert("Success", "Item reported!", [{ text: "OK", onPress: resetForm }]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.detail || "Failed to report item");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setLocation("");
    setDescription("");
    setImage(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Report Found Item</Text>
          <TouchableOpacity onPress={resetForm}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. Blue Backpack" placeholderTextColor={Colors.secondary} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {(Array.isArray(categories) ? categories : []).slice(0, 8).map((cat) => {
              const name = typeof cat === "string" ? cat : cat.name;
              return (
                <TouchableOpacity
                  key={name}
                  style={[styles.chip, category === name && styles.chipActive]}
                  onPress={() => setCategory(category === name ? "" : name)}
                >
                  <Text style={[styles.chipText, category === name && styles.chipTextActive]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Location *</Text>
          <TextInput style={styles.input} placeholder="e.g. Library, Building A" placeholderTextColor={Colors.secondary} value={location} onChangeText={setLocation} />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Optional details..."
            placeholderTextColor={Colors.secondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Photo (optional)</Text>
          {image ? (
            <View style={styles.imagePreview}>
              <Text style={styles.imageSelected}>Photo selected ✓</Text>
              <TouchableOpacity onPress={() => setImage(null)}>
                <Text style={styles.removeImage}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageRow}>
              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Text style={styles.imageBtnText}>📁 Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageBtn} onPress={takePhoto}>
                <Text style={styles.imageBtnText}>📷 Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.accent,
  },
  header: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  closeText: { fontSize: 20, color: Colors.gray },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: Colors.accent, borderRadius: 12, padding: 14,
    fontSize: 16, backgroundColor: Colors.white, color: Colors.text,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.lightGray, borderWidth: 1, borderColor: Colors.accent,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text },
  chipTextActive: { color: Colors.white },
  imageRow: { flexDirection: "row", gap: 12 },
  imageBtn: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: 16,
    alignItems: "center", borderWidth: 1, borderColor: Colors.accent,
  },
  imageBtnText: { fontSize: 14, color: Colors.text },
  imagePreview: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.success,
  },
  imageSelected: { fontSize: 14, color: Colors.success },
  removeImage: { fontSize: 14, color: Colors.danger },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, padding: 16,
    alignItems: "center", marginTop: 24,
  },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
