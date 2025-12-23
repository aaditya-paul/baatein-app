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

interface PinEntryProps {
  onUnlock: (pin: string) => Promise<void>;
}

export function PinEntry({ onUnlock }: PinEntryProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pin) {
      setError("Please enter your PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onUnlock(pin);
    } catch (err: any) {
      setError("Incorrect PIN. Please try again.");
      setPin("");
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
                <Text style={styles.icon}>🔐</Text>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Enter your PIN to unlock your journal
              </Text>
            </Animated.View>

            <View style={styles.form}>
              <TextInput
                secureTextEntry
                placeholder="Enter your PIN"
                placeholderTextColor="#71717a"
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
                style={styles.input}
                autoFocus
                onSubmitEditing={handleSubmit}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                onPress={handleSubmit}
                disabled={loading || !pin || pin.length !== 4}
                style={({ pressed }) => [
                  styles.button,
                  (loading || !pin || pin.length !== 4) &&
                    styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {loading ? "Unlocking..." : "Unlock"}
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
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
  form: {
    gap: 16,
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
    color: "#ef4444",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#6366F1",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
