import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
  Alert,
  Linking,
} from "react-native";
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

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });

    // Animate entrance
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <Animated.View
        style={[
          styles.content,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        <Text style={styles.title}>Baatein.</Text>

        <Text style={styles.subtitle}>Your thoughts, safely held.</Text>

        <Text style={styles.description}>
          A private, judgment-free space designed for quiet reflection and
          gentle self-understanding.
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>✦ E2E Encrypted</Text>
          <Text style={styles.feature}>✦ Safe Space</Text>
          <Text style={styles.feature}>✦ Gentle AI</Text>
        </View>

        <Pressable
          onPress={handleStart}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enter the Quiet Space</Text>
          )}
        </Pressable>
      </Animated.View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => Linking.openURL("https://baatein.app/privacy-policy")}
        >
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Pressable>
        <Text style={styles.dot}>•</Text>
        <Pressable onPress={() => Linking.openURL("https://baatein.app/terms")}>
          <Text style={styles.footerLink}>Terms of Service</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0E",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 420,
  },
  title: {
    fontSize: 64,
    fontWeight: "700",
    color: "#EDEDED",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    color: "#EDEDED",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  features: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  feature: {
    fontSize: 12,
    color: "#6B7280",
  },
  button: {
    backgroundColor: "#6366F1",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 999,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLink: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  dot: {
    color: "#6B7280",
    fontSize: 10,
  },
});
