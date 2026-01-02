"use client";

import {createClient} from "@/lib/supabase/client";
const supabase = createClient();

export async function fetchReferralCount(userId: string) {
  const {count, error} = await supabase
    .from("referrals")
    .select("*", {count: "exact", head: true})
    .eq("referrer_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchLeaderBoardRank(userId: string) {
  const {data, error} = await supabase
    .from("leaderboard_view")
    .select("rank")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data?.rank ?? 0;
}

export async function fetchReferralStatus() {
  const {data, error} = await supabase.rpc("get_referral_status");
  if (error) throw error;
  return data;
}
