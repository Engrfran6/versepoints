import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RankBadge } from "@/components/rank"
import { Crown, Zap, TrendingUp } from "lucide-react"
import type { RankName, RankConfig } from "@/lib/types/phase2"
import { RANK_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default async function AdminRanksPage() {
  const supabase = await createClient()

  // Get rank configurations
  const { data: rankConfigs } = await supabase
    .from("rank_config")
    .select("*")
    .order("points_threshold", { ascending: true })

  // Get all user ranks
  const { data: userRanks } = await supabase.from("user_ranks").select("*, user:user_id(username, email)")

  // Get rank distribution
  const rankCounts = (userRanks || []).reduce(
    (acc, r) => {
      acc[r.rank_name as RankName] = (acc[r.rank_name as RankName] || 0) + 1
      return acc
    },
    {} as Record<RankName, number>,
  )

  // Get recent promotions
  const { data: recentPromotions } = await supabase
    .from("rank_rewards_log")
    .select("*, user:user_id(username)")
    .order("awarded_at", { ascending: false })
    .limit(10)

  const totalUsers = userRanks?.length || 0

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-500" />
          Rank System Management
        </h1>
        <p className="text-muted-foreground mt-1">Configure ranks and view user distribution</p>
      </div>

      {/* Rank Distribution */}
      <Card className="bg-card border-border mb-8">
        <CardHeader>
          <CardTitle className="text-foreground">Rank Distribution</CardTitle>
          <CardDescription className="text-muted-foreground">
            Current distribution of users across all ranks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {(["rookie", "silver", "gold", "diamond", "citizen"] as RankName[]).map((rank) => {
              const count = rankCounts[rank] || 0
              const percentage = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : "0"
              const colors = RANK_COLORS[rank]

              return (
                <div key={rank} className={cn("p-4 rounded-lg text-center", colors.bg, colors.border, "border")}>
                  <RankBadge rank={rank} size="md" showLabel={false} />
                  <p className={cn("text-2xl font-bold mt-2", colors.text)}>{count}</p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                  <p className={cn("text-xs font-medium uppercase mt-1", colors.text)}>{rank}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rank Configurations */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Rank Configurations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankConfigs?.map((config: RankConfig) => {
                const colors = RANK_COLORS[config.rank_name as RankName]
                return (
                  <div key={config.id} className={cn("p-4 rounded-lg", colors.bg, colors.border, "border")}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <RankBadge rank={config.rank_name as RankName} size="sm" showLabel={false} showGlow={false} />
                        <span className={cn("font-bold uppercase", colors.text)}>{config.rank_name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {config.points_threshold.toLocaleString()} VP
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Mining Boost:</span>
                        <span className={cn("ml-1 font-medium", colors.text)}>+{config.mining_boost}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Referral:</span>
                        <span className={cn("ml-1 font-medium", colors.text)}>x{config.referral_bonus_multiplier}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Daily:</span>
                        <span className={cn("ml-1 font-medium", colors.text)}>{config.daily_mining_reward} VP</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Promotions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPromotions?.map((promo) => {
                const user = promo.user as { username: string } | null
                const toColors = RANK_COLORS[promo.to_rank as RankName]
                return (
                  <div key={promo.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <RankBadge rank={promo.to_rank as RankName} size="xs" showLabel={false} />
                      <div>
                        <p className="font-medium text-foreground">{user?.username || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {promo.from_rank} → <span className={toColors.text}>{promo.to_rank}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(promo.awarded_at).toLocaleDateString()}
                    </span>
                  </div>
                )
              })}
              {(!recentPromotions || recentPromotions.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No promotions yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
