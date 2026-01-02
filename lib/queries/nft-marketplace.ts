"use client";

import {createClient} from "@/lib/supabase/client";

const supabase = createClient();

/** User with rank */
export async function fetchUserWithRank(userId: string) {
  const {data, error} = await supabase
    .from("users")
    .select("points_balance, user_current_rank, user_ranks(*)")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

/** NFT catalog */
export async function fetchNFTCatalog() {
  const {data, error} = await supabase
    .from("nft_catalog")
    .select("*")
    .eq("is_active", true)
    .order("vp_cost", {ascending: true});

  if (error) throw error;
  return data ?? [];
}

/** User NFTs */
export async function fetchUserNFTs(userId: string) {
  const {data, error} = await supabase
    .from("user_nfts")
    .select("*, nft:nft_catalog(*)")
    .eq("user_id", userId)
    .eq("is_burned", false)
    .order("acquired_at", {ascending: false});

  if (error) throw error;
  return data ?? [];
}

/** Upgrade combinations */
export async function fetchNFTUpgradeCombinations() {
  const {data, error} = await supabase
    .from("nft_upgrade_combinations")
    .select("*")
    .eq("is_active", true);

  if (error) throw error;
  return data ?? [];
}
