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
import Animated, { FadeIn } from "react-native-reanimated";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Set Your PIN</Text>
            <Text style={styles.subtitle}>
              This PIN encrypts your journal.{" "}
              <Text style={styles.warningText}>
                If you lose it, your data cannot be recovered.
              </Text>
            </Text>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Enter PIN</Text>
              <TextInput
                secureTextEntry
                placeholder="Enter 4 Digit PIN"
                placeholderTextColor="#52525b"
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
                placeholderTextColor="#52525b"
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
                <ActivityIndicator color="#09090b" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  scrollContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  card: {
    width: "100%",
    maxWidth: 400,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: "#71717a",
    lineHeight: 20,
  },
  warningText: {
    fontFamily: "Nunito_700Bold",
    color: "#ef4444",
  },
  form: {
    gap: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#a1a1aa",
    marginBottom: 8,
  },
  input: {
    height: 48,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    textAlign: "center",
    letterSpacing: 6,
  },
  error: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: "#ef4444",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#f4f4f5",
    height: 48,
    borderRadius: 12,
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
    color: "#09090b",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },
});
