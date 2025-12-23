import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts as useNunito,
  Nunito_400Regular,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import {
  useFonts as useOutfit,
  Outfit_400Regular,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Custom dark theme matching the web app's zinc palette
const BaateinDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#f4f4f5",
    background: "#09090b",
    card: "#18181b",
    text: "#f4f4f5",
    border: "#27272a",
    notification: "#f4f4f5",
  },
};

export default function RootLayout() {
  const [nunitoLoaded] = useNunito({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  const [outfitLoaded] = useOutfit({
    Outfit_400Regular,
    Outfit_700Bold,
  });

  const fontsLoaded = nunitoLoaded && outfitLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={BaateinDarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="journal" />
        <Stack.Screen name="profile" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
