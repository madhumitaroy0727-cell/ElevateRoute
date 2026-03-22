import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useMilestones() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["milestones", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("id, title, description, phase, estimated_weeks, status, order_index")
        .eq("user_id", user!.id)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAchievements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user!.id)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

export function useResources() {
  return useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("rating", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes — resources change rarely
  });
}

export function useBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("resource_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((b) => b.resource_id));
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}
