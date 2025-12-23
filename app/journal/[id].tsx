import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase/client";
import { NewEntry } from "@/components/features/journal";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export default function EntryDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entryData, setEntryData] = useState<{
    id: string;
    title: string | null;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("entries")
        .select("id, title, content")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching entry:", error);
      } else {
        setEntryData(data);
      }
    } catch (error) {
      console.error("Error fetching entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!entryData) {
    return <LoadingScreen message="Entry not found" />;
  }

  return <NewEntry initialData={entryData} />;
}
