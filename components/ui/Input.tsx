import React from "react";
import {
  TextInput,
  type TextInputProps,
  View,
  Text,
  StyleSheet,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

export function Input({
  style,
  containerStyle,
  label,
  error,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const borderColor = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedInputStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value === 1 ? "#6366F1" : "#27272a",
    transform: [{ scale: scale.value }],
  }));

  const handleFocus = (e: any) => {
    borderColor.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1.01, { damping: 15 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    borderColor.value = withTiming(0, { duration: 200 });
    scale.value = withSpring(1, { damping: 15 });
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <AnimatedTextInput
        style={[
          styles.input,
          animatedInputStyle,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#52525b"
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#e4e4e7",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(24, 24, 27, 0.5)",
    borderWidth: 2,
    borderColor: "#27272a",
    color: "#f4f4f5",
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  error: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: "#ef4444",
    marginTop: 6,
  },
});
