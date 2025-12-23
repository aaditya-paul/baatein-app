import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { ProfileClient } from "@/components/features/ProfileClient";

interface UserData {
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserData({
          fullName: user.user_metadata?.full_name || "User",
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || null,
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !userData) {
    return <LoadingScreen />;
  }

  return (
    <ProfileClient
      userName={userData.fullName}
      userEmail={userData.email}
      userImage={userData.avatarUrl || undefined}
    />
  );
}
