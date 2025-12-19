import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Package, TrendingUp, Flame } from "lucide-react"
import type { NFTCatalog, NFTTier, NFTTransaction } from "@/lib/types/phase2"
import { NFT_TIER_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { AdminNFTsContent } from "@/components/admin/admin-nfts-content"

export default async function AdminNFTsPage() {
  const supabase = await createClient()

  // Get NFT catalog
  const { data: nftCatalog } = await supabase.from("nft_catalog").select("*").order("tier", { ascending: true })

  // Get NFT sales stats
  const { data: nftSales } = await supabase.from("nft_transactions").select("*").eq("transaction_type", "purchase")

  // Group sales by NFT
  const salesByNft = (nftSales || []).reduce(
    (acc, sale) => {
      acc[sale.nft_id] = (acc[sale.nft_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Total revenue
  const totalRevenue = (nftSales || []).reduce((sum, sale) => sum + (sale.vp_amount || 0), 0)

  // Recent transactions
  const { data: recentTransactions } = await supabase
    .from("nft_transactions")
    .select("*, user:user_id(username), nft:nft_id(name, tier)")
    .order("created_at", { ascending: false })
    .limit(10)

  // Get upgrade stats
  const { count: totalUpgrades } = await supabase
    .from("nft_transactions")
    .select("*", { count: "exact", head: true })
    .eq("transaction_type", "upgrade")

  const { count: totalBurns } = await supabase
    .from("nft_transactions")
    .select("*", { count: "exact", head: true })
    .eq("transaction_type", "burn")

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Store className="w-8 h-8 text-primary" />
          NFT Management
        </h1>
        <p className="text-muted-foreground mt-1">Manage NFT catalog and view sales statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-foreground mt-1">{nftSales?.length || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VP Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upgrades</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalUpgrades || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NFTs Burned</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalBurns || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* NFT Catalog */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">NFT Catalog</CardTitle>
            <CardDescription className="text-muted-foreground">All available NFTs and their stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nftCatalog?.map((nft: NFTCatalog) => {
                const tierColors = NFT_TIER_COLORS[nft.tier as NFTTier]
                const sales = salesByNft[nft.id] || 0

                return (
                  <div key={nft.id} className={cn("p-4 rounded-lg", tierColors.bg, tierColors.border, "border")}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {nft.tier === "legendary"
                            ? "⚡"
                            : nft.tier === "diamond"
                              ? "💎"
                              : nft.tier === "gold"
                                ? "🏆"
                                : nft.tier === "silver"
                                  ? "🔧"
                                  : "⛏️"}
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{nft.name}</p>
                          <Badge className={cn("text-xs", tierColors.bg, tierColors.text)}>{nft.tier}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{nft.vp_cost.toLocaleString()} VP</p>
                        <p className="text-xs text-muted-foreground">{sales} sold</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Supply: {nft.current_supply}/{nft.max_supply || "∞"}
                      </span>
                      <span className={tierColors.text}>+{nft.mining_boost}% boost</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Transactions</CardTitle>
            <CardDescription className="text-muted-foreground">Latest NFT activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions?.map(
                (tx: NFTTransaction & { user?: { username: string }; nft?: { name: string; tier: string } }) => {
                  const tierColors = tx.nft ? NFT_TIER_COLORS[tx.nft.tier as NFTTier] : NFT_TIER_COLORS.basic

                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            tx.transaction_type === "purchase"
                              ? "bg-green-500/20 text-green-400"
                              : tx.transaction_type === "burn"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-amber-500/20 text-amber-400",
                          )}
                        >
                          {tx.transaction_type}
                        </Badge>
                        <div>
                          <p className="font-medium text-foreground">{tx.user?.username || "Unknown"}</p>
                          <p className={cn("text-xs", tierColors.text)}>{tx.nft?.name || "Unknown NFT"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {tx.vp_amount && <p className="text-sm font-medium text-primary">{tx.vp_amount} VP</p>}
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )
                },
              )}
              {(!recentTransactions || recentTransactions.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No transactions yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminNFTsContent nftCatalog={nftCatalog || []} />
    </div>
  )
}
