import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NFTMarketplaceContent } from "./nft-marketplace-content"
import type { RankName } from "@/lib/types/phase2"

export default async function NFTMarketplacePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user data with rank
  const { data: userData } = await supabase.from("users").select("*, user_ranks(*)").eq("id", user.id).single()

  // Get NFT catalog
  const { data: nftCatalog } = await supabase
    .from("nft_catalog")
    .select("*")
    .eq("is_active", true)
    .order("vp_cost", { ascending: true })

  // Get user's NFTs with catalog data
  const { data: userNfts } = await supabase
    .from("user_nfts")
    .select("*, nft:nft_catalog(*)")
    .eq("user_id", user.id)
    .eq("is_burned", false)
    .order("acquired_at", { ascending: false })

  // Get upgrade combinations
  const { data: upgradeCombinations } = await supabase
    .from("nft_upgrade_combinations")
    .select("*")
    .eq("is_active", true)

  const currentRank = (userData?.user_ranks?.[0]?.rank_name || "rookie") as RankName

  return (
    <NFTMarketplaceContent
      userId={user.id}
      userBalance={userData?.points_balance || 0}
      userRank={currentRank}
      nftCatalog={nftCatalog || []}
      userNfts={userNfts || []}
      upgradeCombinations={upgradeCombinations || []}
    />
  )
}
