import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps extends PressableProps {
  label?: string;
  loading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function Button({
  label,
  children,
  loading,
  disabled,
  onPress,
  variant = "default",
  size = "default",
  style,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const handlePress = (e: any) => {
    if (loading || disabled) return;
    onPress?.(e);
  };

  // Get styles based on variant and size
  const buttonStyle = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    (loading || disabled) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
  ];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={loading || disabled}
      style={[buttonStyle, animatedStyle]}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          color={variant === "default" ? "#fff" : "#f4f4f5"}
          style={styles.loader}
        />
      )}
      {label ? <Text style={textStyle}>{label}</Text> : children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    overflow: "hidden",
  },
  // Variants
  variant_default: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  variant_destructive: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  variant_outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3f3f46",
  },
  variant_secondary: {
    backgroundColor: "#27272a",
  },
  variant_ghost: {
    backgroundColor: "transparent",
  },
  // Sizes
  size_default: {
    height: 56,
    paddingHorizontal: 24,
  },
  size_sm: {
    height: 40,
    paddingHorizontal: 16,
  },
  size_lg: {
    height: 64,
    paddingHorizontal: 32,
  },
  size_icon: {
    height: 48,
    width: 48,
    paddingHorizontal: 0,
  },
  // Text styles
  text: {
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  text_default: {
    color: "#fff",
  },
  text_destructive: {
    color: "#fff",
  },
  text_outline: {
    color: "#f4f4f5",
  },
  text_secondary: {
    color: "#f4f4f5",
  },
  text_ghost: {
    color: "#f4f4f5",
  },
  // Text sizes
  textSize_default: {
    fontSize: 16,
  },
  textSize_sm: {
    fontSize: 14,
  },
  textSize_lg: {
    fontSize: 18,
  },
  textSize_icon: {
    fontSize: 16,
  },
  // States
  disabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  loader: {
    marginRight: 8,
  },
});
