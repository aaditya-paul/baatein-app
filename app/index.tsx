import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "../global.css";

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/journal");
      } else {
        router.replace("/welcome");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/welcome");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <LoadingScreen />
    </View>
  );
}
