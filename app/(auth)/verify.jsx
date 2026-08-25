import { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "../../constants/colors";

export default function Verify() {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef([]);
  const { verify, login } = useAuth();
  const router = useRouter();

  const handleChange = (text, index) => {
    if (text.length > 1) text = text.slice(-1);
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }

    if (newCode.every((d) => d !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleVerify = async (fullCode) => {
    setLoading(true);
    try {
      await verify(email, fullCode);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Invalid or expired code");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await login(email);
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      Alert.alert("Error", "Failed to resend code");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Code</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {email}</Text>
      <View style={styles.codeRow}>
        {code.map((digit, i) => (
          <TextInput
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(t) => handleChange(t, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
      {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}
      <TouchableOpacity onPress={handleResend} style={styles.resendButton} disabled={cooldown > 0}>
        <Text style={[styles.resendText, cooldown > 0 && { color: Colors.secondary }]}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 32,
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  resendButton: {
    marginTop: 24,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
});
