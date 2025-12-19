import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user data
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData) {
    redirect("/auth/login")
  }

  if (userData.is_admin) {
    redirect("/admin")
  }

  // Get referral count
  const { count: referralCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id)

  // Get user rank
  const { data: leaderboard } = await supabase.from("leaderboard_view").select("rank").eq("id", user.id).single()

  return <DashboardContent user={userData} referralCount={referralCount || 0} rank={leaderboard?.rank || 0} />
}
