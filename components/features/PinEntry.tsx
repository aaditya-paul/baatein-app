import React, { useState, useEffect } from "react";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";

interface PinEntryProps {
  onUnlock: (pin: string) => Promise<void>;
}

export function PinEntry({ onUnlock }: PinEntryProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    // Simple entrance animation
    contentOpacity.value = withTiming(1, { duration: 400 });
    contentY.value = withTiming(0, { duration: 400 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleSubmit = async () => {
    if (!pin) {
      setError("Please enter your PIN");
      // Shake animation on error
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onUnlock(pin);
    } catch {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      // Shake animation on error
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
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
        <Animated.View style={[styles.card, contentStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your PIN to continue</Text>
          </View>

          <View style={styles.form}>
            <Animated.View style={inputStyle}>
              <TextInput
                secureTextEntry
                placeholder="••••"
                placeholderTextColor="#52525b"
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
                style={styles.input}
                autoFocus
                onSubmitEditing={handleSubmit}
              />
            </Animated.View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={loading || !pin || pin.length !== 4}
              style={({ pressed }) => [
                styles.button,
                (loading || !pin || pin.length !== 4) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#09090b" />
              ) : (
                <Text style={styles.buttonText}>Unlock</Text>
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
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#71717a",
  },
  form: {
    gap: 24,
  },
  input: {
    height: 56,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    textAlign: "center",
    letterSpacing: 8,
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
