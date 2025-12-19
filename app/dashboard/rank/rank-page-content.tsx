"use client";

import {Suspense} from "react";
import dynamic from "next/dynamic";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {RankBadge} from "@/components/rank/rank-badge";
import {RankProgress} from "@/components/rank/rank-progress";
import {RankRewardsCard} from "@/components/rank/rank-rewards-card";
import {Trophy, TrendingUp, History} from "lucide-react";
import type {RankName, RankConfig, RankRewardsLog} from "@/lib/types/phase2";

const AnimatedRankBadge = dynamic(
  () => import("@/components/3d/animated-rank-badge").then((mod) => mod.AnimatedRankBadge),
  {ssr: false}
);
const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  {ssr: false}
);

interface RankPageContentProps {
  currentRank: RankName;
  totalPoints: number;
  rankConfigs: RankConfig[];
  rankHistory: RankRewardsLog[];
}

export function RankPageContent({
  currentRank,
  totalPoints,
  rankConfigs,
  rankHistory,
}: RankPageContentProps) {
  return (
    <div className="relative p-4 md:p-8 min-h-screen">
      <Suspense fallback={null}>
        <FloatingParticles className="opacity-20" color="#a855f7" count={1000} />
      </Suspense>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Your Rank
        </h1>
        <p className="text-muted-foreground mt-1">Track your progress and unlock rewards</p>
      </div>

      {/* Current Rank Card with 3D Badge */}
      <Card className="relative z-10 mb-8 bg-gradient-to-br from-card/90 to-primary/10 border-border gradient-border backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Suspense fallback={<RankBadge rank={currentRank} size="xl" />}>
              <div className="w-40 h-40 md:w-48 md:h-48">
                <AnimatedRankBadge rank={currentRank} />
              </div>
            </Suspense>
            <div className="flex-1 w-full">
              <RankProgress currentRank={currentRank} totalPoints={totalPoints} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Ranks */}
      <div className="relative z-10 mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Rank Tiers
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {rankConfigs?.map((config: RankConfig) => (
            <RankRewardsCard
              key={config.rank_name}
              rank={config.rank_name as RankName}
              currentRank={currentRank}
              miningBoost={config.mining_boost}
              referralMultiplier={config.referral_bonus_multiplier}
              dailyReward={config.daily_mining_reward}
              features={config.features as string[]}
              referers={config.referers}
            />
          ))}
        </div>
      </div>

      {/* Rank History */}
      <Card className="relative z-10 bg-card/90 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Rank History
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your promotion history and rewards received
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankHistory && rankHistory.length > 0 ? (
            <div className="space-y-3">
              {rankHistory.map((log: RankRewardsLog) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <RankBadge rank={log.to_rank as RankName} size="sm" showLabel={false} />
                    <div>
                      <p className="font-medium text-foreground">
                        Promoted to <span className="uppercase">{log.to_rank}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.awarded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {log.mining_boost_percentage && (
                    <span className="text-sm text-primary">
                      +{log.mining_boost_percentage}% boost
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rank promotions yet</p>
              <p className="text-sm">Keep mining to earn your first promotion!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
