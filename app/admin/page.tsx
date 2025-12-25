import {createClient} from "@/lib/supabase/server";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Users,
  Pickaxe,
  Coins,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  Store,
  Rocket,
} from "lucide-react";
import {RankBadge} from "@/components/rank";
import type {RankName} from "@/lib/types/phase2";
import {supabaseAdmin} from "@/lib/supabase/admin";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get stats
  const {count: totalUsers} = await supabase
    .from("users")
    .select("*", {count: "exact", head: true});

  const {count: activeUsers} = await supabase
    .from("users")
    .select("*", {count: "exact", head: true})
    .eq("status", "active");

  const {count: totalMiningSessions} = await supabase
    .from("mining_sessions")
    .select("*", {count: "exact", head: true});

  const {data: totalPointsData} = await supabase.from("users").select("points_balance");

  const totalPoints = totalPointsData?.reduce((sum, u) => sum + u.points_balance, 0) || 0;

  // Get today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {count: todaySignups} = await supabase
    .from("users")
    .select("*", {count: "exact", head: true})
    .gte("created_at", today.toISOString());

  const {count: todayMining} = await supabase
    .from("mining_sessions")
    .select("*", {count: "exact", head: true})
    .gte("created_at", today.toISOString());

  // Get suspicious activity count
  const {count: suspiciousCount} = await supabase
    .from("audit_log")
    .select("*", {count: "exact", head: true})
    .in("action", ["mining_ip_blocked", "mining_fingerprint_conflict"])
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Get rank distribution
  const {data: rankDistribution} = await supabase.from("user_ranks").select("rank_name");

  const rankCounts = (rankDistribution || []).reduce((acc, r) => {
    acc[r.rank_name as RankName] = (acc[r.rank_name as RankName] || 0) + 1;
    return acc;
  }, {} as Record<RankName, number>);

  // Get NFT stats
  const {count: totalNFTsSold} = await supabase
    .from("user_nfts")
    .select("*", {count: "exact", head: true});

  const {count: totalNFTsEquipped} = await supabase
    .from("user_nfts")
    .select("*", {count: "exact", head: true})
    .eq("is_equipped", true);

  // Get current phase
  const {data: currentPhase} = await supabase
    .from("platform_phases")
    .select("*")
    .eq("is_active", true)
    .single();

  // Recent users
  const {data: recentUsers} = await supabase
    .from("users")
    .select("id, username, email, points_balance, created_at, status")
    .order("created_at", {ascending: false})
    .limit(5);

  // Recent mining
  const {data: recentMining} = await supabaseAdmin
    .from("mining_sessions")
    .select(
      `
      id,
      points_earned,
      created_at,
      user:user_id (username)
    `
    )
    .order("created_at", {ascending: false})
    .limit(5);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and management</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalUsers || 0}</p>
                <p className="text-xs text-green-500 mt-1">+{todaySignups || 0} today</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mining Sessions</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {totalMiningSessions || 0}
                </p>
                <p className="text-xs text-green-500 mt-1">+{todayMining || 0} today</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Pickaxe className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {totalPoints.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">In circulation</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Coins className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                <p className="text-2xl font-bold text-foreground mt-1">{suspiciousCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 24h</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase 2 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Phase</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {currentPhase?.phase_number || 1}
                </p>
                <p className="text-xs text-primary mt-1">{currentPhase?.phase_name || "Genesis"}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10">
                <Rocket className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NFTs Sold</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalNFTsSold || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalNFTsEquipped || 0} equipped
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Store className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border col-span-2">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-3">Rank Distribution</p>
            <div className="flex items-center justify-between gap-2">
              {(["rookie", "silver", "gold", "diamond", "citizen"] as RankName[]).map((rank) => (
                <div key={rank} className="flex flex-col items-center">
                  <RankBadge rank={rank} size="xs" showLabel={false} showGlow={false} />
                  <span className="text-sm font-bold text-foreground mt-1">
                    {rankCounts[rank] || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{user.points_balance} VP</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentUsers || recentUsers.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No users yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Mining */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Mining Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMining?.map((session) => {
                const user = session.user as unknown as {username: string} | null;
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{user?.username || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold text-primary">+{session.points_earned} VP</span>
                  </div>
                );
              })}
              {(!recentMining || recentMining.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No mining activity yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
