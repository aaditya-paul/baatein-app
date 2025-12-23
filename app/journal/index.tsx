import { useEffect, useState } from "react";
import { View } from "react-native";
import { supabase } from "@/lib/supabase/client";
import { JournalHome, type JournalEntry } from "@/components/features/journal";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export default function JournalIndex() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [userName, setUserName] = useState("User");
  const [userImage, setUserImage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get user metadata
        const fullName = user.user_metadata?.full_name || "User";
        const firstName = fullName.split(" ")[0];
        setUserName(firstName);
        setUserImage(user.user_metadata?.avatar_url);

        // Fetch entries
        const { data: entriesData, error } = await supabase
          .from("entries")
          .select("id, title, content, created_at, is_deleted")
          .eq("user_id", user.id)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching entries:", error);
        } else {
          setEntries(entriesData || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <JournalHome
        entries={entries}
        userName={userName}
        userImage={userImage}
      />
    </View>
  );
}
