import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, Alert, Image } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase/client";
import { useEncryption } from "@/components/features/EncryptionProvider";
import { decryptContent } from "@/lib/crypto";
import { getRandomMicrocopy } from "@/lib/microcopies";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { loadPreferences, updatePreference } from "@/lib/supabase/preferences";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import * as Haptics from "expo-haptics";

const useHaptics = () => ({
  selection: () => {
    Haptics.selectionAsync?.().catch?.(() => {});
  },
  medium: () => {
    Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium).catch?.(
      () => {}
    );
  },
  heavy: () => {
    Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy).catch?.(() => {});
  },
  success: () => {
    Haptics.notificationAsync?.(
      Haptics.NotificationFeedbackType?.Success
    ).catch?.(() => {});
  },
  error: () => {
    Haptics.notificationAsync?.(
      Haptics.NotificationFeedbackType?.Error
    ).catch?.(() => {});
  },
});

export interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  is_deleted?: boolean;
}

interface JournalHomeProps {
  entries: JournalEntry[];
  userName?: string;
  userImage?: string;
}

export function JournalHome({
  entries,
  userName = "User",
  userImage,
}: JournalHomeProps) {
  const { dek } = useEncryption();
  const [decryptedEntries, setDecryptedEntries] = useState<JournalEntry[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(entries.length > 0);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const router = useRouter();
  const haptics = useHaptics();

  // Load user preferences on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      const preferences = await loadPreferences();
      setViewMode(preferences.viewMode || "grid");
      setIsLoadingPreferences(false);
    };
    loadUserPreferences();
  }, []);

  // Save view mode preference when it changes
  const handleViewModeChange = async (mode: "grid" | "list") => {
    haptics.selection();
    setViewMode(mode);
    await updatePreference("viewMode", mode);
  };

  // Decrypt entries when they change or dek becomes available
  useEffect(() => {
    const decryptAll = async () => {
      if (!dek || entries.length === 0) {
        setDecryptedEntries([]);
        setIsDecrypting(false);
        return;
      }

      setIsDecrypting(true);
      try {
        const results = await Promise.all(
          entries
            .filter((e) => !e.is_deleted)
            .map(async (entry) => {
              try {
                let decryptedTitle = null;
                if (entry.title) {
                  decryptedTitle = await decryptContent(entry.title, dek);
                }
                const decryptedContent = await decryptContent(
                  entry.content,
                  dek
                );
                return {
                  ...entry,
                  title: decryptedTitle,
                  content: decryptedContent,
                };
              } catch (err) {
                console.error(`Failed to decrypt entry ${entry.id}:`, err);
                return { ...entry, title: "🔒 Error decrypting", content: "" };
              }
            })
        );
        setDecryptedEntries(results);
      } catch (err) {
        console.error("Critical decryption error:", err);
      } finally {
        setIsDecrypting(false);
      }
    };

    decryptAll();
  }, [entries, dek]);

  // Format date
  const today = new Date();
  const dateString = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Dynamic greeting based on time of day
  const hour = today.getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const handleDelete = (id: string) => {
    haptics.heavy();
    Alert.alert(
      "Let go of this moment?",
      "This entry will be moved to trash.",
      [
        {
          text: "Keep it",
          style: "cancel",
          onPress: () => haptics.selection(),
        },
        {
          text: "Yes, let go",
          style: "destructive",
          onPress: async () => {
            haptics.medium();
            try {
              const { error } = await supabase
                .from("entries")
                .update({ is_deleted: true })
                .eq("id", id);

              if (error) {
                haptics.error();
                console.error("Delete error:", error);
                Alert.alert("Error", getRandomMicrocopy("error"));
                return;
              }

              haptics.success();
              setDecryptedEntries((prev) => prev.filter((e) => e.id !== id));
            } catch (err) {
              haptics.error();
              console.error("Delete error:", err);
              Alert.alert("Error", getRandomMicrocopy("error"));
            }
          },
        },
      ]
    );
  };

  if (isLoadingPreferences) {
    return <LoadingScreen />;
  }

  const renderItem = ({
    item: entry,
    index,
  }: {
    item: JournalEntry;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Card
        className={viewMode === "grid" ? "mb-4" : "mb-3"}
        onPress={() => {
          haptics.selection();
          router.push(`/journal/${entry.id}`);
        }}
        onLongPress={() => handleDelete(entry.id)}
      >
        <CardHeader>
          <Text className="text-muted-foreground text-xs font-sans uppercase tracking-wider mb-1">
            {new Date(entry.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {entry.title && <CardTitle>{entry.title}</CardTitle>}
        </CardHeader>
        <CardDescription numberOfLines={viewMode === "grid" ? 4 : 1}>
          {stripHtml(entry.content)}
        </CardDescription>
      </Card>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-6">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-muted-foreground text-sm font-sans uppercase tracking-wider mb-1">
              📅 {dateString}
            </Text>
            <Text className="text-3xl font-heading font-bold text-foreground">
              {greeting}, {userName}.
            </Text>
            <Text className="text-lg font-sans text-muted-foreground mt-1">
              {getRandomMicrocopy("welcome")}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              haptics.selection();
              router.push("/profile");
            }}
            hitSlop={10}
          >
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                className="w-12 h-12 rounded-full border-2 border-border"
              />
            ) : (
              <View className="w-12 h-12 rounded-full border-2 border-border bg-secondary items-center justify-center">
                <Text className="text-foreground font-bold text-lg">
                  {userName[0]}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* View Mode Toggle */}
        <View className="flex-row mt-4 bg-secondary/20 p-1 rounded-full self-start">
          <Pressable
            onPress={() => handleViewModeChange("grid")}
            className={`px-4 py-2 rounded-full ${
              viewMode === "grid" ? "bg-secondary" : ""
            }`}
          >
            <Text
              className={
                viewMode === "grid"
                  ? "text-foreground font-sans font-medium"
                  : "text-muted-foreground font-sans font-medium"
              }
            >
              Grid
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleViewModeChange("list")}
            className={`px-4 py-2 rounded-full ${
              viewMode === "list" ? "bg-secondary" : ""
            }`}
          >
            <Text
              className={
                viewMode === "list"
                  ? "text-foreground font-sans font-medium"
                  : "text-muted-foreground font-sans font-medium"
              }
            >
              List
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {isDecrypting ? (
        <LoadingScreen />
      ) : decryptedEntries.length === 0 ? (
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-1 items-center justify-center p-6"
        >
          <View className="w-24 h-24 rounded-full bg-secondary/30 items-center justify-center mb-6">
            <Text className="text-4xl">✍️</Text>
          </View>
          <Text className="text-xl font-heading font-semibold text-foreground text-center mb-2">
            Your journal is empty
          </Text>
          <Text className="text-muted-foreground font-sans text-center mb-6 max-w-xs">
            Capture your thoughts, ideas, and memories. Your space, your rules.
          </Text>
          <Button
            onPress={() => {
              haptics.medium();
              router.push("/journal/new");
            }}
            className="rounded-full px-8 h-12"
          >
            Start Writing
          </Button>
        </Animated.View>
      ) : (
        <>
          {/* Daily Prompt */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="mx-4 mb-4 p-4 rounded-2xl bg-secondary/20 border border-border"
          >
            <Text className="text-base font-heading font-semibold text-foreground mb-1">
              Daily Prompt
            </Text>
            <Text className="text-muted-foreground font-sans italic">
              &ldquo;{getRandomMicrocopy("prompts")}&rdquo;
            </Text>
          </Animated.View>

          <FlatList
            data={decryptedEntries}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 pb-24"
            numColumns={viewMode === "grid" ? 2 : 1}
            key={viewMode}
            columnWrapperClassName={viewMode === "grid" ? "gap-4" : undefined}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* FAB */}
      <Animated.View
        entering={ZoomIn.delay(500).duration(400)}
        className="absolute bottom-8 right-6"
      >
        <Pressable
          onPress={() => {
            haptics.medium();
            router.push("/journal/new");
          }}
          className="w-16 h-16 rounded-full bg-foreground items-center justify-center shadow-lg shadow-black/50 active:scale-95 transition-transform"
        >
          <Text className="text-background text-3xl font-bold font-sans pb-1">
            +
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
