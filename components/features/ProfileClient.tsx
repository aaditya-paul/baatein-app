import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase/client";
import { getRandomMicrocopy } from "@/lib/microcopies";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", getRandomMicrocopy("error"));
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This will mark your data as inaccessible.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Call your delete API endpoint here
              const response = await fetch("/api/profile/delete", {
                method: "POST",
              });
              if (response.ok) {
                router.replace("/");
              } else {
                throw new Error("Failed to delete account");
              }
            } catch (error) {
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
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.profileCard}
        >
          <View style={styles.profileInfo}>
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userName[0]}</Text>
              </View>
            )}
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Account Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleSignOut}
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.actionButton,
              styles.signOutButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionIcon}>🚪</Text>
            {isSigningOut ? (
              <ActivityIndicator color="#f4f4f5" />
            ) : (
              <Text style={styles.actionText}>
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
            {isDeleting ? (
              <ActivityIndicator color="#fef2f2" />
            ) : (
              <Text style={styles.deleteText}>
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Warning */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.warning}
        >
          <Text style={styles.warningText}>
            <Text style={styles.warningBold}>Gentle Reminder:</Text> Deleting
            your account will mark it as deleted and sign you out. Your thoughts
            will remain encrypted in the quiet of the database, but you will no
            longer have the key to visit them.
          </Text>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  content: {
    flex: 1,
    maxWidth: 672,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 24,
    color: "#6366F1",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  profileCard: {
    backgroundColor: "rgba(39, 39, 42, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
  },
  profileInfo: {
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(39, 39, 42, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#a1a1aa",
  },
  nameContainer: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f4f4f5",
  },
  userEmail: {
    fontSize: 14,
    color: "#a1a1aa",
    marginTop: 4,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    borderRadius: 999,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "transparent",
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#f4f4f5",
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fef2f2",
  },
  warning: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 24,
    padding: 24,
  },
  warningText: {
    fontSize: 14,
    color: "rgba(239, 68, 68, 0.8)",
    lineHeight: 20,
  },
  warningBold: {
    fontWeight: "700",
    color: "#ef4444",
  },
});
