"use client";

import {Suspense} from "react";
import dynamic from "next/dynamic";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Trophy, Medal, Award, Crown} from "lucide-react";
import {cn} from "@/lib/utils";
import {useLeaderboard, useUserRank} from "@/lib/hooks/useLeaderBoard";
import {LeaderboardSkeleton} from "@/components/skeleton/leader-skeleton";

const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  {ssr: false}
);
const LeaderboardTrophy3D = dynamic(
  () => import("@/components/3d/leaderboard-trophy-3d").then((mod) => mod.LeaderboardTrophy3D),
  {ssr: false}
);

interface LeaderboardEntry {
  id: string;
  username: string;
  points_balance: number;
  mining_count: number;
  rank: number;
}

interface LeaderboardContentProps {
  currentUserId: string;
}

export function LeaderboardContent({currentUserId}: LeaderboardContentProps) {
  const {data: leaderboard, isLoading: leaderboardLoading} = useLeaderboard(100);
  const {data: userRank, isLoading: userRankLoading} = useUserRank(currentUserId);

  const isLoading = leaderboardLoading || userRankLoading;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-mono text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30";
      case 2:
        return "bg-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-amber-600/10 border-amber-600/30";
      default:
        return "bg-muted/50 border-transparent";
    }
  };

  return (
    <div className="relative p-4 md:p-8 min-h-screen">
      {isLoading ? (
        <LeaderboardSkeleton />
      ) : (
        <>
          {/* 3D Background */}
          <Suspense fallback={null}>
            <FloatingParticles count={1200} color="#ffd700" className="opacity-20" />
          </Suspense>

          {/* Header with 3D Trophy */}
          <div className="relative z-10 mb-8 flex flex-col md:flex-row items-center gap-6">
            <Suspense fallback={<div className="w-32 h-32 bg-muted/20 rounded-lg animate-pulse" />}>
              <div className="w-32 h-32 md:w-40 md:h-40">
                <LeaderboardTrophy3D />
              </div>
            </Suspense>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                Leaderboard
              </h1>
              <p className="text-muted-foreground mt-1">Top miners by VersePoints balance</p>
            </div>
          </div>

          {/* User's Position */}
          {userRank && (
            <Card className="relative z-10 bg-primary/5 border-primary/20 mb-8 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Position</p>
                    <p className="text-3xl font-bold text-foreground">#{userRank.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="text-3xl font-bold text-primary">
                      {userRank.points_balance.toLocaleString()} VP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top 3 Podium */}
          {leaderboard && leaderboard.length >= 3 && (
            <div className="relative z-10 grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center pt-8">
                <div className="w-16 h-16 rounded-full bg-gray-400/20 flex items-center justify-center mb-3 ring-2 ring-gray-400/30">
                  <Medal className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-bold text-foreground text-center truncate w-full">
                  {leaderboard[1]?.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  {leaderboard[1]?.points_balance.toLocaleString()} VP
                </p>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3 ring-4 ring-yellow-500/30 animate-pulse">
                  <Crown className="w-10 h-10 text-yellow-500" />
                </div>
                <p className="font-bold text-foreground text-center truncate w-full text-lg">
                  {leaderboard[0]?.username}
                </p>
                <p className="text-sm text-primary font-bold">
                  {leaderboard[0]?.points_balance.toLocaleString()} VP
                </p>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center pt-12">
                <div className="w-14 h-14 rounded-full bg-amber-600/20 flex items-center justify-center mb-3 ring-2 ring-amber-600/30">
                  <Award className="w-7 h-7 text-amber-600" />
                </div>
                <p className="font-bold text-foreground text-center truncate w-full">
                  {leaderboard[2]?.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  {leaderboard[2]?.points_balance.toLocaleString()} VP
                </p>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <Card className="relative z-10 bg-card/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-foreground">All Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard?.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      entry.id === currentUserId
                        ? "bg-primary/10 border-primary/30"
                        : getRankStyle(entry.rank)
                    )}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                      <div>
                        <p
                          className={cn(
                            "font-medium",
                            entry.id === currentUserId ? "text-primary" : "text-foreground"
                          )}>
                          {entry.username}
                          {entry.id === currentUserId && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.mining_count} mining sessions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {entry.points_balance.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">VersePoints</p>
                    </div>
                  </div>
                ))}

                {(!leaderboard || leaderboard.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No rankings yet</p>
                    <p className="text-sm">Start mining to appear on the leaderboard!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
