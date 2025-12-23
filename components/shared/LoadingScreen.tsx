import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { getRandomMicrocopy } from "@/lib/microcopies";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const displayMessage = message || getRandomMicrocopy("loading");

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <ActivityIndicator size="large" color="#f4f4f5" />
      <Text className="text-muted-foreground font-sans text-center mt-4 text-base">
        {displayMessage}
      </Text>
    </View>
  );
}
