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
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);

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
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentStyle}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
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
          </View>

          {/* Account Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleSignOut}
              disabled={isSigningOut}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
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
              <Text style={[styles.actionText, styles.deleteText]}>
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Text>
            </Pressable>
          </View>

          {/* Warning */}
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              <Text style={styles.warningBold}>Note: </Text>
              Deleting your account will mark it as deleted and sign you out.
              Your thoughts will remain encrypted but you will no longer have
              access to them.
            </Text>
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
  },
  spacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  profileCard: {
    marginBottom: 32,
    paddingVertical: 24,
  },
  profileContent: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#27272a",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Nunito_700Bold",
    color: "#71717a",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: "#71717a",
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  deleteButton: {
    borderColor: "#ef4444",
  },
  actionText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#f4f4f5",
  },
  deleteText: {
    color: "#ef4444",
  },
  warning: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 16,
  },
  warningText: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: "#71717a",
    lineHeight: 18,
  },
  warningBold: {
    fontFamily: "Nunito_700Bold",
    color: "#a1a1aa",
  },
});
