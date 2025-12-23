import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { getRandomMicrocopy } from "@/lib/microcopies";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const displayMessage = message || getRandomMicrocopy("loading");

  // Multiple animated values for complex animations
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  // Create floating orbs
  const orb1 = useSharedValue(0);
  const orb2 = useSharedValue(0);
  const orb3 = useSharedValue(0);

  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulsing scale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Fade in
    opacity.value = withSpring(1, { damping: 10 });
    translateY.value = withSpring(0, { damping: 12 });

    // Floating orbs with different timings
    orb1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animated styles
  const centerOrbStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb1.value, [0, 1], [0, 60]) },
      { translateY: interpolate(orb1.value, [0, 1], [0, -80]) },
      { scale: interpolate(orb1.value, [0, 0.5, 1], [0.5, 1, 0.5]) },
    ],
    opacity: interpolate(orb1.value, [0, 0.5, 1], [0.3, 0.8, 0.3]),
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb2.value, [0, 1], [0, -70]) },
      { translateY: interpolate(orb2.value, [0, 1], [0, 60]) },
      { scale: interpolate(orb2.value, [0, 0.5, 1], [0.6, 1.1, 0.6]) },
    ],
    opacity: interpolate(orb2.value, [0, 0.5, 1], [0.4, 0.9, 0.4]),
  }));

  const orb3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb3.value, [0, 1], [0, 80]) },
      { translateY: interpolate(orb3.value, [0, 1], [0, 70]) },
      { scale: interpolate(orb3.value, [0, 0.5, 1], [0.4, 0.9, 0.4]) },
    ],
    opacity: interpolate(orb3.value, [0, 0.5, 1], [0.2, 0.7, 0.2]),
  }));

  return (
    <View style={styles.container}>
      {/* Background orbs */}
      <View style={styles.orbContainer}>
        <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
        <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
        <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />
      </View>

      {/* Center animated spinner */}
      <Animated.View style={[styles.spinnerContainer, centerOrbStyle]}>
        <View style={styles.spinner}>
          <View style={[styles.spinnerSegment, styles.segment1]} />
          <View style={[styles.spinnerSegment, styles.segment2]} />
          <View style={[styles.spinnerSegment, styles.segment3]} />
        </View>
      </Animated.View>

      {/* Message text */}
      <Animated.Text style={[styles.message, textStyle]}>
        {displayMessage}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#09090b",
    padding: 24,
  },
  orbContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "#6366F1",
  },
  orb1: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  orb2: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  orb3: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
  },
  spinnerContainer: {
    marginBottom: 40,
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "rgba(99, 102, 241, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerSegment: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "transparent",
  },
  segment1: {
    borderTopColor: "#6366F1",
    borderRightColor: "#6366F1",
  },
  segment2: {
    borderBottomColor: "#8B5CF6",
    borderLeftColor: "#8B5CF6",
    transform: [{ rotate: "120deg" }],
  },
  segment3: {
    borderTopColor: "#A855F7",
    borderRightColor: "#A855F7",
    transform: [{ rotate: "240deg" }],
  },
  message: {
    fontSize: 16,
    color: "#a1a1aa",
    textAlign: "center",
    fontFamily: "Nunito_400Regular",
    letterSpacing: 0.5,
    lineHeight: 24,
  },
});
