import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LeaderboardContent } from "./leaderboard-content"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get leaderboard data
  const { data: leaderboard } = await supabase.from("leaderboard_view").select("*").limit(100)

  // Get current user's rank
  const { data: userRank } = await supabase.from("leaderboard_view").select("*").eq("id", user.id).single()

  return <LeaderboardContent leaderboard={leaderboard || []} userRank={userRank} currentUserId={user.id} />
}
