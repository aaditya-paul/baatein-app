import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase/client";
import { getRandomMicrocopy } from "@/lib/microcopies";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

export default function WelcomeScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const subtitleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(20);
  const descOpacity = useSharedValue(0);
  const descY = useSharedValue(20);
  const featuresOpacity = useSharedValue(0);
  const featuresScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);
  const footerOpacity = useSharedValue(0);

  // Background floating elements
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });

    // Orchestrated entrance animations
    titleOpacity.value = withDelay(100, withTiming(1, { duration: 800 }));
    titleScale.value = withDelay(100, withSpring(1, { damping: 12 }));

    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    subtitleY.value = withDelay(400, withSpring(0, { damping: 10 }));

    descOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    descY.value = withDelay(700, withSpring(0, { damping: 10 }));

    featuresOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    featuresScale.value = withDelay(1000, withSpring(1, { damping: 10 }));

    buttonOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(1300, withSpring(1, { damping: 8 }));

    footerOpacity.value = withDelay(1600, withTiming(1, { duration: 600 }));

    // Floating background animations
    float1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );

    float2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    transform: [{ translateY: descY.value }],
  }));

  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    transform: [{ scale: featuresScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const float1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(float1.value, [0, 1], [0, 30]) },
      { translateY: interpolate(float1.value, [0, 1], [0, -50]) },
    ],
    opacity: interpolate(float1.value, [0, 0.5, 1], [0.1, 0.2, 0.1]),
  }));

  const float2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(float2.value, [0, 1], [0, -40]) },
      { translateY: interpolate(float2.value, [0, 1], [0, 60]) },
    ],
    opacity: interpolate(float2.value, [0, 0.5, 1], [0.05, 0.15, 0.05]),
  }));

  const handleStart = async () => {
    setLoading(true);

    try {
      // Check if already signed in
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/journal");
        return;
      }

      // Check if Google Play Services are available (Android only check)
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        // Sign in to Supabase with the Google ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });

        if (error) {
          Alert.alert("Error", getRandomMicrocopy("error"));
          setLoading(false);
          return;
        }

        if (data.session) {
          router.replace("/journal");
        }
      } else {
        throw new Error("No ID token received from Google");
      }
    } catch (error: any) {
      setLoading(false);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in flow
        console.log("User cancelled sign-in");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Sign-in is in progress
        console.log("Sign-in in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play services not available or outdated (Android)
        Alert.alert(
          "Error",
          "Google Play Services not available. Please update Google Play Services."
        );
      } else {
        console.error("Sign-in error:", error);
        Alert.alert("Error", getRandomMicrocopy("error"));
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating background elements */}
      <Animated.View style={[styles.floatingOrb1, float1Style]} />
      <Animated.View style={[styles.floatingOrb2, float2Style]} />

      <View style={styles.content}>
        <Animated.Text style={[styles.title, titleStyle]}>
          Baatein.
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Your thoughts, safely held.
        </Animated.Text>

        <Animated.Text style={[styles.description, descStyle]}>
          A private, judgment-free space designed for quiet reflection and
          gentle self-understanding.
        </Animated.Text>

        <Animated.View style={[styles.features, featuresStyle]}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✦</Text>
            <Text style={styles.featureText}>E2E Encrypted</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✦</Text>
            <Text style={styles.featureText}>Safe Space</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✦</Text>
            <Text style={styles.featureText}>Gentle AI</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
          <Pressable
            onPress={handleStart}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Enter the Quiet Space</Text>
            )}
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, footerStyle]}>
        <Pressable
          onPress={() => Linking.openURL("https://baatein.app/privacy-policy")}
        >
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Pressable>
        <Text style={styles.dot}>•</Text>
        <Pressable onPress={() => Linking.openURL("https://baatein.app/terms")}>
          <Text style={styles.footerLink}>Terms of Service</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  floatingOrb1: {
    position: "absolute",
    top: "20%",
    right: "10%",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#6366F1",
  },
  floatingOrb2: {
    position: "absolute",
    bottom: "25%",
    left: "5%",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#8B5CF6",
  },
  content: {
    alignItems: "center",
    maxWidth: 420,
    zIndex: 1,
  },
  title: {
    fontSize: 72,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    marginBottom: 16,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: "Nunito_400Regular",
    color: "#e4e4e7",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  features: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 48,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  featureIcon: {
    fontSize: 12,
    color: "#6366F1",
  },
  featureText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#d4d4d8",
    letterSpacing: 0.5,
  },
  buttonWrapper: {
    width: "100%",
  },
  button: {
    backgroundColor: "#6366F1",
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 999,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
  },
  footerLink: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  dot: {
    color: "#52525b",
    fontSize: 12,
  },
});
