import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { RankName } from "@/lib/types/phase2";
import { RankPageContent } from "./rank-page-content";

export default async function RankPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user data with rank
  const { data: userData } = await supabase
    .from("users")
    .select("*, user_ranks(*)")
    .eq("id", user.id)
    .single();

  // Get rank configurations
  const { data: rankConfigs } = await supabase
    .from("rank_config")
    .select("*")
    .order("points_threshold", { ascending: true });

  // Get rank history
  const { data: rankHistory } = await supabase
    .from("rank_rewards_log")
    .select("*")
    .eq("user_id", user.id)
    .order("awarded_at", { ascending: false })
    .limit(5);

  const currentRank = (userData?.user_ranks?.[0]?.rank_name ||
    "rookie") as RankName;
  const totalPoints = userData?.total_mined || 0;

  console.log("confirming rankConfigs===========", rankConfigs);

  return (
    <RankPageContent
      currentRank={currentRank}
      totalPoints={totalPoints}
      rankConfigs={rankConfigs || []}
      rankHistory={rankHistory || []}
    />
  );
}
