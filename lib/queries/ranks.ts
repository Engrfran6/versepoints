// lib/queries/rank.ts
import {supabase} from "@/lib/supabase/client";

export async function fetchRankUser(userId: string) {
  const {data, error} = await supabase
    .from("users")
    .select("*, user_ranks(*)")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchRankConfigs() {
  const {data, error} = await supabase
    .from("rank_config")
    .select("*")
    .order("points_threshold", {ascending: true});
  if (error) throw error;
  return data ?? [];
}

export async function fetchRankHistory(userId: string) {
  const {data, error} = await supabase
    .from("rank_rewards_log")
    .select("*")
    .eq("user_id", userId)
    .order("awarded_at", {ascending: false})
    .limit(5);
  if (error) throw error;
  return data ?? [];
}
