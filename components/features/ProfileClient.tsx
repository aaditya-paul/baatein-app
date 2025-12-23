import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase/client";
import { getRandomMicrocopy } from "@/lib/microcopies";

interface ProfileClientProps {
  userName: string;
  userImage?: string;
  userEmail?: string;
}

export function ProfileClient({
  userName,
  userImage,
  userEmail,
}: ProfileClientProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const actionsOpacity = useSharedValue(0);
  const warningOpacity = useSharedValue(0);

  useEffect(() => {
    // Orchestrated entrance animations
    headerOpacity.value = withTiming(1, { duration: 400 });

    cardOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    cardScale.value = withDelay(100, withSpring(1, { damping: 12 }));

    actionsOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    warningOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  const warningStyle = useAnimatedStyle(() => ({
    opacity: warningOpacity.value,
  }));

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      Alert.alert(
        "Signed out",
        "Hope to see you back in the quiet space soon."
      );
      router.replace("/welcome");
    } catch {
      Alert.alert("Error", getRandomMicrocopy("error"));
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account?",
      "Are you sure you want to delete your account? This will mark your data as inaccessible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Mark user as deleted
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (user) {
                // Update all entries to be deleted
                await supabase
                  .from("entries")
                  .update({ is_deleted: true })
                  .eq("user_id", user.id);

                // Sign out
                await supabase.auth.signOut();
                Alert.alert("Account Deleted", getRandomMicrocopy("deleting"));
                router.replace("/welcome");
              }
            } catch {
              Alert.alert("Error", getRandomMicrocopy("error"));
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.spacer} />
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, cardStyle]}>
          <View style={styles.profileContent}>
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userName[0]}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Account Actions */}
        <Animated.View style={[styles.actions, actionsStyle]}>
          <Pressable
            onPress={handleSignOut}
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={styles.actionText}>
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionText, styles.deleteText]}>
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Warning */}
        <Animated.View style={[styles.warning, warningStyle]}>
          <Text style={styles.warningText}>
            <Text style={styles.warningBold}>Gentle Reminder: </Text>
            Deleting your account will mark it as deleted and sign you out. Your
            thoughts will remain encrypted in the quiet of the database, but you
            will no longer have the key to visit them.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#a1a1aa",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: "rgba(24, 24, 27, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(39, 39, 42, 0.8)",
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileContent: {
    alignItems: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(63, 63, 70, 0.8)",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(63, 63, 70, 0.5)",
    backgroundColor: "rgba(39, 39, 42, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: "Nunito_700Bold",
    color: "#a1a1aa",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#a1a1aa",
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(24, 24, 27, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(63, 63, 70, 0.5)",
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  deleteButton: {
    borderColor: "rgba(127, 29, 29, 0.6)",
    backgroundColor: "rgba(127, 29, 29, 0.1)",
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
  },
  deleteText: {
    color: "#fca5a5",
  },
  warning: {
    backgroundColor: "rgba(127, 29, 29, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(127, 29, 29, 0.3)",
    borderRadius: 24,
    padding: 20,
  },
  warningText: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#fca5a5",
    lineHeight: 22,
  },
  warningBold: {
    fontFamily: "Nunito_700Bold",
    color: "#fca5a5",
  },
});
