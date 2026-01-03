"use client";

import {supabase} from "@/lib/supabase/client";

/** Fetch top leaderboard entries */
export async function fetchLeaderboard(limit = 100) {
  const {data, error} = await supabase
    .from("leaderboard_view")
    .select("*")
    .order("rank", {ascending: true})
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Fetch current user's rank */
export async function fetchUserRank(userId: string) {
  const {data, error} = await supabase
    .from("leaderboard_view")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}
