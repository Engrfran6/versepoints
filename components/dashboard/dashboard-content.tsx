"use client";

import {cn, formatNumberShort} from "@/lib/utils";

import {useState, useCallback, Suspense, useEffect, useMemo} from "react";
import dynamic from "next/dynamic";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {MiningButton} from "@/components/dashboard/mining-button";
import {PointsDisplay} from "@/components/dashboard/points-display";
import {StatsCard} from "@/components/dashboard/stats-card";
import {ReferralLink} from "@/components/dashboard/referral-link";
import {Pickaxe, Users, Trophy, TrendingUp, Gift, Sparkles, Star, Flame, Zap} from "lucide-react";
import type {User} from "@/lib/types/database";
import {generateFingerprint, getBrowserInfo} from "@/lib/fingerprint";
import {MINING_CONSTANTS} from "@/lib/constants";
import {useMiningProgress} from "@/hooks/useMiningProgress";
import {Button} from "../ui/button";
import {toast} from "sonner";
import {useLeaderBoardRank, useReferralCount, useReferralStatus} from "@/lib/hooks/useReferral";
import {DashboardSkeleton} from "@/components/skeleton/DashboardSkeleton";

const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  {ssr: false}
);
const MiningRigScene = dynamic(
  () => import("@/components/3d/mining-rig-scene").then((mod) => mod.MiningRigScene),
  {
    ssr: false,
  }
);

interface DashboardContentProps {
  user: User;
  // referralCount: number;
  // rank: number;
  // referralStatus: {
  //   has_referral: boolean;
  //   referral_signup_paid: boolean;
  //   referral_mining_paid: boolean;
  // };
}

export function DashboardContent({user: initialUser}: DashboardContentProps) {
  const [user, setUser] = useState(initialUser);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showReferralBanner, setShowReferralBanner] = useState(false);

  const {data: referralCount = 0, isLoading: tasksLoading} = useReferralCount(user.id);

  const {data: rank = 0, isLoading: rankLoading} = useLeaderBoardRank(user.id);

  const {data: referralStatus = [], isLoading: referralStatusLoading} = useReferralStatus();

  const isLoading = tasksLoading || rankLoading || referralStatusLoading;

  const REFERRAL_BANNER_KEY = "referral_banner_last_dismissed";
  const REFERRAL_BANNER_DELAY = 5 * 60 * 1000; // 5 minutes

  const showReferralStatus =
    referralStatus.has_referral &&
    (!referralStatus.referral_signup_paid || !referralStatus.referral_mining_paid);

  useEffect(() => {
    if (!showReferralStatus) {
      setShowReferralBanner(false);
      return;
    }

    const lastDismissed = localStorage.getItem(REFERRAL_BANNER_KEY);

    // First time → show immediately
    if (!lastDismissed) {
      setShowReferralBanner(true);
      return;
    }

    const elapsed = Date.now() - Number(lastDismissed);

    // Re-show after delay
    if (elapsed > REFERRAL_BANNER_DELAY) {
      setShowReferralBanner(true);
    }
  }, [showReferralStatus]);

  const dismissReferralBanner = () => {
    localStorage.setItem(REFERRAL_BANNER_KEY, Date.now().toString());
    setShowReferralBanner(false);
  };

  useEffect(() => {
    // Show welcome message for new users (joined in last 60 minutes)
    const joinedAt = new Date(user.created_at).getTime();
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (joinedAt > twentyFourHoursAgo && user.mining_count === 0) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [user.created_at, user.mining_count]);

  const getStreakMultiplier = (streak: number): number => {
    const thresholds = Object.entries(MINING_CONSTANTS.STREAK_BONUS_MULTIPLIERS)
      .map(([days, mult]) => ({days: Number.parseInt(days), mult}))
      .sort((a, b) => b.days - a.days);

    for (const {days, mult} of thresholds) {
      if (streak >= days) return mult;
    }
    return 1.0;
  };

  const {isMiningNow} = useMiningProgress(
    user.points_balance,
    MINING_CONSTANTS.POINTS_PER_MINE ?? 0,
    user.last_mining_at,
    user.is_mining
  );

  const getNextStreakMilestone = (streak: number): {days: number; multiplier: number} | null => {
    const thresholds = Object.entries(MINING_CONSTANTS.STREAK_BONUS_MULTIPLIERS)
      .map(([days, mult]) => ({days: Number.parseInt(days), mult}))
      .sort((a, b) => a.days - b.days);

    for (const {days, mult} of thresholds) {
      if (streak < days) return {days, multiplier: mult};
    }
    return null;
  };

  const currentMultiplier = getStreakMultiplier(user.current_streak || 0);
  const nextMilestone = getNextStreakMilestone(user.current_streak || 0);

  const handleMine = useCallback(async () => {
    try {
      const fingerprint = await generateFingerprint();
      const browserInfo = getBrowserInfo();

      const response = await fetch("/api/mining/mine", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fingerprint, browserInfo}),
      });

      const data = await response.json();

      if (data.success) {
        setUser((prev) => ({
          ...prev,
          points_balance: prev.points_balance,
          total_mined: prev.total_mined + (data.points || MINING_CONSTANTS.POINTS_PER_MINE),
          mining_count: prev.mining_count + 1,
          last_mining_at: new Date().toISOString(),
          current_streak: data.streak || (prev.current_streak || 0) + 1,
          longest_streak: Math.max(
            prev.longest_streak || 0,
            data.streak || (prev.current_streak || 0) + 1
          ),
        }));
        return {...data, streak: data.streak, multiplier: data.multiplier};
      }

      return data;
    } catch {
      return {success: false, error: "Network error"};
    } finally {
      setTimeout(() => isMiningNow, 2000);
    }
  }, []);

  const isWelcomeBack = (() => {
    const lastMinedAt = user.last_mining_at;
    if (!lastMinedAt) return false;

    const lastVisit = new Date(lastMinedAt).getTime();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return now - lastVisit > twentyFourHours;
  })();

  const {created_at: newUserCreatedAt} = user;
  const DAY = 24 * 60 * 60 * 1000;

  const isNewUser =
    !user.welcome_bonus_claimed &&
    Date.now() - new Date(newUserCreatedAt).getTime() < DAY &&
    user.mining_count === 0;

  const [pending, setPending] = useState(false);
  const handleCLaimWelcome = async () => {
    if (!isNewUser) return;
    setPending(true);

    try {
      const res = await fetch("/api/user/claim-welcome", {method: "POST"});
      const data = await res.json();

      if (data.success) {
        setUser((prev) => ({
          ...prev,
          points_balance: data.newBalance,
          welcome_bonus_claimed: true,
        }));

        toast.success(`+${data.pointsAwarded} VP added`);
      }
    } catch (error) {
      toast.warning("Error processing claim");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative p-4 md:p-8 min-h-screen">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <Suspense fallback={null}>
            <FloatingParticles className="opacity-30" count={1500} />
          </Suspense>

          {showReferralBanner && (
            <Card className="bg-primary/10 border-primary/30 mt-8 mb-6 shadow-lg hover:border-primary/50 transition-colors">
              <CardContent className="flex items-start gap-3 p-4 w-full">
                <Gift className="w-6 h-6 text-primary mt-1" />

                <div className="space-y-1 flex-1">
                  <p className="font-semibold text-foreground">Referral Rewards</p>

                  {!referralStatus.referral_signup_paid && (
                    <p className="text-sm text-muted-foreground">
                      🎉 Your signup referral bonus is being processed.
                    </p>
                  )}

                  {!referralStatus.referral_mining_paid && (
                    <p className="text-sm text-muted-foreground">
                      ⛏️ Mine once to unlock your referral mining bonus.
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={dismissReferralBanner}>
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}

          {showWelcome && (
            <div>
              <Card className="bg-gray-600 w-full h-max border-primary/50 shadow-lg shadow-primary/20">
                <CardContent className="px-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-2">
                      Welcome Bonus!
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You received{" "}
                      <span className="text-primary font-bold">
                        {MINING_CONSTANTS.WELCOME_BONUS} VP
                      </span>{" "}
                      for joining!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Header */}
          <div className="relative z-10 mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-foreground">
              {isWelcomeBack ? "Welcome back," : "Welcome,"}{" "}
              <span className="text-primary">{user.username}</span>
            </h1>

            <p className="text-muted-foreground mt-1">Ready to mine some VersePoints?</p>
          </div>

          {/* Main Grid */}
          <div className="relative z-10 grid gap-6 lg:grid-cols-3">
            {/* Left Column - Mining */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                className={cn(
                  "relative border-border shadow-2xl overflow-hidden transition-all duration-700",
                  isMiningNow ? "bg-[#655304]" : "bg-[#132239]"
                )}>
                {/* BASE GRADIENT */}
                {isNewUser && (
                  <div className="-mb-7 -mt-3 flex items-center justify-center gap-2">
                    <span className=" text-sm text-muted-foreground">
                      🎉 +1,000 VP welcome bonus awaits
                    </span>

                    <Button
                      disabled={pending}
                      variant="outline"
                      size="sm"
                      onClick={handleCLaimWelcome}>
                      {pending ? "Claiming..." : "Claim now"}
                    </Button>
                  </div>
                )}

                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none transition-opacity duration-700",
                    isMiningNow
                      ? "bg-gradient-to-br from-green-400/40 via-cyan-900/30 to-indigo-900/40 opacity-100"
                      : "bg-gradient-to-br from-purple-950/60 via-indigo-900/40 to-teal-950/30 opacity-90"
                  )}
                />

                {/* RADIAL ENERGY CORE */}
                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none transition-all duration-700",
                    isMiningNow
                      ? "bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_65%)] animate-pulse"
                      : "bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_70%)]"
                  )}
                />

                <CardContent className="p-6 relative z-20">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                      <Suspense
                        fallback={
                          <div className="w-32 h-32 bg-muted/20 rounded-lg animate-pulse" />
                        }>
                        <div className="w-32 hidden lg:block h-32 md:w-40 md:h-40 relative">
                          <MiningRigScene />

                          {/* Mining glow — purple + cyan hybrid */}
                          <div
                            className={cn(
                              "absolute inset-0 rounded-lg transition-all duration-500",
                              isMiningNow
                                ? "shadow-[0_0_40px_rgba(168,85,247,0.35),0_0_60px_rgba(34,211,238,0.25)]"
                                : "shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                            )}
                          />
                        </div>
                      </Suspense>

                      {/* <PointsDisplay points={displayPoints} animate isMiningNow={isMiningNow} /> */}
                      <PointsDisplay
                        userPoints={user.points_balance}
                        userLastMine={user.last_mining_at}
                        userIsMining={user.is_mining!}
                        animate
                      />
                    </div>

                    <MiningButton
                      lastMiningAt={user.last_mining_at}
                      currentStreak={user.current_streak || 0}
                      onMine={handleMine}
                    />
                  </div>
                </CardContent>
              </Card>

              {(user.current_streak || 0) > 0 && (
                <Card className="bg-gradient-to-r from-orange-500/10 via-card to-yellow-500/10 border-orange-500/20 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground flex items-center gap-2">
                            {user.current_streak} Day Streak
                            {currentMultiplier > 1 && (
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                {currentMultiplier}x Bonus
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Longest: {user.longest_streak || user.current_streak} days
                          </p>
                        </div>
                      </div>
                      {nextMilestone && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Next milestone</p>
                          <p className="font-bold text-foreground flex items-center gap-1">
                            {nextMilestone.days} days
                            <Zap className="w-4 h-4 text-yellow-400" />
                            {nextMilestone.multiplier}x
                          </p>
                          <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all"
                              style={{
                                width: `${
                                  ((user.current_streak || 0) / nextMilestone.days) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Mined"
                  value={formatNumberShort(user.total_mined)}
                  icon={Pickaxe}
                  className="hover:scale-105 transition-transform duration-300 bg-card/90 backdrop-blur-sm"
                />
                <StatsCard
                  title="Mining Sessions"
                  value={user.mining_count}
                  icon={TrendingUp}
                  className="hover:scale-105 transition-transform duration-300 bg-card/90 backdrop-blur-sm"
                />
                <StatsCard
                  title="Referrals"
                  value={referralCount}
                  icon={Users}
                  className="hover:scale-105 transition-transform duration-300 bg-card/90 backdrop-blur-sm"
                />
                <StatsCard
                  title="Global Rank"
                  value={rank > 0 ? `#${rank}` : "-"}
                  icon={Trophy}
                  className="hover:scale-105 transition-transform duration-300 bg-card/90 backdrop-blur-sm"
                />
              </div>

              {/* Referral Link */}
              <ReferralLink referralCode={user.referral_code} />
            </div>

            {/* Right Column - Activity */}
            <div className="space-y-6">
              <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Mining Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-muted-foreground">Base points per mine</span>
                    <Badge variant="outline" className="border-primary/50 text-primary font-bold">
                      {MINING_CONSTANTS.POINTS_PER_MINE} VP
                    </Badge>
                  </div>
                  {currentMultiplier > 1 && (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <span className="text-orange-400 flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        Streak bonus
                      </span>
                      <Badge className="bg-orange-500/20 text-orange-400 font-bold">
                        {Math.floor(MINING_CONSTANTS.POINTS_PER_MINE * currentMultiplier)} VP (
                        {currentMultiplier}x)
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-muted-foreground">Cooldown</span>
                    <span className="font-bold text-foreground">
                      {MINING_CONSTANTS.MINING_COOLDOWN_HOURS} hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-muted-foreground">Referral bonus</span>
                    <Badge variant="outline" className="border-accent/50 text-accent font-bold">
                      +{MINING_CONSTANTS.REFERRAL_FIRST_MINING_BONUS} VP
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-muted-foreground">Welcome bonus</span>
                    <Badge className="bg-primary/20 text-primary font-bold animate-pulse">
                      {MINING_CONSTANTS.WELCOME_BONUS} VP
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-bold text-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/5 via-card to-yellow-500/5 backdrop-blur-sm border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    Streak Bonuses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(MINING_CONSTANTS.STREAK_BONUS_MULTIPLIERS).map(([days, mult]) => {
                    const isAchieved = (user.current_streak || 0) >= Number.parseInt(days);
                    const isNext =
                      !isAchieved &&
                      (user.current_streak || 0) < Number.parseInt(days) &&
                      Object.keys(MINING_CONSTANTS.STREAK_BONUS_MULTIPLIERS)
                        .map(Number)
                        .filter((d) => d < Number.parseInt(days))
                        .every(
                          (d) => (user.current_streak || 0) >= d || d > (user.current_streak || 0)
                        );

                    return (
                      <div
                        key={days}
                        className={cn(
                          "flex justify-between items-center p-2 rounded-lg transition-all",
                          isAchieved
                            ? "bg-orange-500/20 border border-orange-500/30"
                            : isNext
                            ? "bg-muted/50 border border-dashed border-orange-500/30"
                            : "bg-muted/20 opacity-60"
                        )}>
                        <span
                          className={cn(
                            "text-sm flex items-center gap-1",
                            isAchieved ? "text-orange-400 font-medium" : "text-muted-foreground"
                          )}>
                          {isAchieved && <Sparkles className="w-3 h-3" />}
                          {days} days
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            isAchieved
                              ? "border-orange-500/50 text-orange-400"
                              : "border-muted-foreground/30"
                          )}>
                          {mult}x bonus
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-primary/5 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    {text: "Mine daily to build your streak bonus", icon: Flame},
                    {
                      text: "Share your referral link for bonus points",
                      icon: Users,
                    },
                    {text: "Complete tasks for extra rewards", icon: Star},
                    {text: "Climb the leaderboard for recognition", icon: Trophy},
                  ].map((tip, i) => (
                    <p
                      key={i}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-default">
                      <tip.icon className="w-4 h-4 text-primary" />
                      {tip.text}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
