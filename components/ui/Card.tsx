import React from "react";
import { View, Text, Pressable, StyleSheet, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps extends PressableProps {
  children: React.ReactNode;
  style?: any;
}

export function Card({ children, style, onPress, ...props }: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 10, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    }
  };

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={!onPress}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: any;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: any;
}

export function CardTitle({ children, style }: CardTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: any;
  numberOfLines?: number;
}

export function CardDescription({
  children,
  style,
  numberOfLines = 2,
}: CardDescriptionProps) {
  return (
    <Text style={[styles.description, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  style?: any;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: any;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(24, 24, 27, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(63, 63, 70, 0.5)",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#a1a1aa",
    lineHeight: 20,
  },
  content: {
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
});
