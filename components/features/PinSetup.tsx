import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

interface PinSetupProps {
  onComplete: (pin: string) => Promise<void>;
}

export function PinSetup({ onComplete }: PinSetupProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePinChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");
    setPin(value);
  };

  const handleConfirmPinChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");
    setConfirmPin(value);
  };

  const handleSubmit = async () => {
    if (pin.length !== 4 || confirmPin.length !== 4) {
      setError("PIN must be exactly 4 characters");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onComplete(pin);
    } catch (err: any) {
      setError(err.message || "Failed to set up encryption");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              style={styles.header}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔒</Text>
              </View>
              <Text style={styles.title}>Set Your Data PIN</Text>
              <Text style={styles.subtitle}>
                This PIN encrypts your journal.{" "}
                <Text style={styles.warningText}>
                  If you lose it, your data cannot be recovered.
                </Text>
              </Text>
            </Animated.View>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Enter PIN</Text>
                <TextInput
                  secureTextEntry
                  placeholder="Enter 4 Digit Pin"
                  placeholderTextColor="#71717a"
                  value={pin}
                  onChangeText={handlePinChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.input}
                />
              </View>

              <View>
                <Text style={styles.label}>Confirm PIN</Text>
                <TextInput
                  secureTextEntry
                  placeholder="Re-enter your PIN"
                  placeholderTextColor="#71717a"
                  value={confirmPin}
                  onChangeText={handleConfirmPinChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.input}
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                onPress={handleSubmit}
                disabled={loading || !pin || !confirmPin}
                style={({ pressed }) => [
                  styles.button,
                  (loading || !pin || !confirmPin) && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#f4f4f5" />
                ) : (
                  <Text style={styles.buttonText}>
                    {loading ? "Setting up..." : "Continue"}
                  </Text>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(11, 11, 14, 0.95)",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "rgba(39, 39, 42, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 448,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(39, 39, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(63, 63, 70, 0.6)",
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f4f4f5",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    marginTop: 8,
  },
  warningText: {
    fontWeight: "700",
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f4f4f5",
    marginBottom: 8,
  },
  input: {
    height: 48,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    fontSize: 18,
    color: "#f4f4f5",
    textAlign: "center",
    letterSpacing: 8,
  },
  error: {
    fontSize: 14,
    color: "#fca5a5",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#27272a",
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#f4f4f5",
    fontSize: 16,
    fontWeight: "600",
  },
});
