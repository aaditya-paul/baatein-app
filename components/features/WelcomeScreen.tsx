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
  withTiming,
  Easing,
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
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(30);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });

    // Simple entrance animation
    contentOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    contentY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
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
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.title}>Baatein.</Text>
        <Text style={styles.subtitle}>Your thoughts, safely held.</Text>
        <Text style={styles.description}>
          A private space for quiet reflection.
        </Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>E2E Encrypted</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>Safe Space</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>Gentle AI</Text>
          </View>
        </View>

        <Pressable
          onPress={handleStart}
          disabled={loading}
          style={{
            ...styles.button,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text style={styles.buttonText}>Get Started</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Pressable
            onPress={() =>
              Linking.openURL("https://baatein.app/privacy-policy")
            }
          >
            <Text style={styles.footerLink}>Privacy</Text>
          </Pressable>
          <Text style={styles.dot}>•</Text>
          <Pressable
            onPress={() => Linking.openURL("https://baatein.app/terms")}
          >
            <Text style={styles.footerLink}>Terms</Text>
          </Pressable>
        </View>
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
    padding: 32,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  title: {
    fontSize: 56,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Nunito_400Regular",
    color: "#a1a1aa",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#71717a",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 48,
  },
  features: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 48,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  featureText: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: "#a1a1aa",
  },
  button: {
    backgroundColor: "#f4f4f5",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
    height: 48,
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#09090b",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerLink: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: "#52525b",
  },
  dot: {
    color: "#3f3f46",
    fontSize: 12,
  },
});
