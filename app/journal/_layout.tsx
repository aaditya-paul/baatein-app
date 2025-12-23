import { Stack } from "expo-router";
import { EncryptionProvider } from "@/components/features/EncryptionProvider";

export default function JournalLayout() {
  return (
    <EncryptionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="new" />
        <Stack.Screen name="[id]" />
      </Stack>
    </EncryptionProvider>
  );
}
