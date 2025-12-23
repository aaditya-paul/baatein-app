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
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
} from "react-native-reanimated";

interface PinEntryProps {
  onUnlock: (pin: string) => Promise<void>;
}

export function PinEntry({ onUnlock }: PinEntryProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation values
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const iconScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const inputOpacity = useSharedValue(0);
  const inputScale = useSharedValue(0.95);
  const buttonOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    // Orchestrated entrance animation
    cardOpacity.value = withTiming(1, { duration: 400 });
    cardScale.value = withSpring(1, { damping: 12 });

    iconScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      )
    );

    titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    titleY.value = withDelay(300, withSpring(0, { damping: 10 }));

    inputOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    inputScale.value = withDelay(500, withSpring(1, { damping: 10 }));

    buttonOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ scale: inputScale.value }, { translateX: shakeX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
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
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.card, cardStyle]}>
            <View style={styles.header}>
              <Animated.View style={[styles.iconContainer, iconStyle]}>
                <Text style={styles.icon}>🔐</Text>
              </Animated.View>
              <Animated.Text style={[styles.title, titleStyle]}>
                Welcome Back
              </Animated.Text>
              <Animated.Text style={[styles.subtitle, titleStyle]}>
                Enter your PIN to unlock your journal
              </Animated.Text>
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

              {error ? (
                <Animated.Text
                  entering={FadeIn.duration(300)}
                  style={styles.error}
                >
                  {error}
                </Animated.Text>
              ) : null}

              <Animated.View style={buttonStyle}>
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
                    <Text style={styles.buttonText}>Unlock</Text>
                  )}
                </Pressable>
              </Animated.View>
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
    backgroundColor: "#09090b",
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
    backgroundColor: "rgba(24, 24, 27, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    borderRadius: 32,
    padding: 40,
    width: "100%",
    maxWidth: 448,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    color: "#a1a1aa",
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  input: {
    height: 64,
    width: "100%",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#27272a",
    backgroundColor: "rgba(24, 24, 27, 0.5)",
    paddingHorizontal: 16,
    fontSize: 32,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    textAlign: "center",
    letterSpacing: 12,
  },
  error: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#ef4444",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#6366F1",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
});
