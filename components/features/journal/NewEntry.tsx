import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { supabase } from "@/lib/supabase/client";
import { useEncryption } from "@/components/features/EncryptionProvider";
import { encryptContent, decryptContent } from "@/lib/crypto";
import { getRandomMicrocopy } from "@/lib/microcopies";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Button } from "@/components/ui/Button";

interface EditorProps {
  initialData?: {
    id: string;
    title: string | null;
    content: string;
  };
}

export function NewEntry({ initialData }: EditorProps) {
  const { dek } = useEncryption();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(!!initialData);
  const richText = useRef<RichEditor>(null);

  // Decrypt and load initialData
  useEffect(() => {
    const loadAndDecrypt = async () => {
      if (!initialData || !dek) return;

      try {
        setIsDecrypting(true);

        let decryptedTitle = "";
        if (initialData.title) {
          decryptedTitle = await decryptContent(initialData.title, dek);
        }

        const decryptedContent = await decryptContent(initialData.content, dek);

        setTitle(decryptedTitle);
        setContent(decryptedContent);
        richText.current?.setContentHTML(decryptedContent);
      } catch (err) {
        console.error("Failed to decrypt entry:", err);
        Alert.alert("Error", getRandomMicrocopy("error"));
      } finally {
        setIsDecrypting(false);
      }
    };

    loadAndDecrypt();
  }, [initialData, dek]);

  const handleSave = async () => {
    if (isSaving || !dek) return;

    const htmlContent = await richText.current?.getContentHtml();

    if (!htmlContent?.trim() && !title.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const encryptedTitle = await encryptContent(
          title.trim() || "Untitled",
          dek
        );
        const encryptedContent = await encryptContent(htmlContent || "", dek);

        let error;

        if (initialData?.id) {
          const result = await supabase
            .from("entries")
            .update({
              title: encryptedTitle,
              content: encryptedContent,
              updated_at: new Date().toISOString(),
            })
            .eq("id", initialData.id);
          error = result.error;
        } else {
          const result = await supabase.from("entries").insert({
            user_id: user.id,
            title: encryptedTitle,
            content: encryptedContent,
          });
          error = result.error;
        }

        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }

        Alert.alert("Saved", getRandomMicrocopy("saving"));
        router.back();
      } else {
        Alert.alert("Error", "You need to be logged in to save.");
      }
    } catch (error: any) {
      console.error("Error saving entry:", error);
      Alert.alert("Error", getRandomMicrocopy("error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isDecrypting) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary text-lg">← Back</Text>
          </Pressable>
          <Text className="text-muted-foreground text-sm">
            {initialData ? "Editing" : new Date().toLocaleDateString()}
          </Text>
          <Button
            onPress={handleSave}
            disabled={isSaving}
            loading={isSaving}
            size="sm"
            className="rounded-full px-6"
          >
            Save
          </Button>
        </View>

        <ScrollView className="flex-1 px-4">
          <Animated.View entering={FadeIn.duration(300)}>
            {/* Title Input */}
            <TextInput
              placeholder="Title (optional)"
              placeholderTextColor="#a1a1aa"
              className="text-3xl font-heading font-bold text-foreground py-4"
              value={title}
              onChangeText={setTitle}
            />

            {/* Rich Text Editor */}
            <RichEditor
              ref={richText}
              initialContentHTML={content}
              placeholder="Write what's on your mind..."
              onChange={(html) => setContent(html)}
              editorStyle={{
                backgroundColor: "#09090b",
                color: "#f4f4f5",
                placeholderColor: "#52525b",
                contentCSSText: `
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 16px;
                  line-height: 1.6;
                  padding: 0;
                `,
              }}
              style={{
                minHeight: 300,
              }}
            />
          </Animated.View>
        </ScrollView>

        {/* Bottom Toolbar */}
        <View className="border-t border-border bg-card px-4 py-2">
          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.insertBulletsList,
              actions.setStrikethrough,
              actions.heading1,
            ]}
            iconTint="#a1a1aa"
            selectedIconTint="#f4f4f5"
            style={{
              backgroundColor: "transparent",
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
