import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminReferralsContent } from "@/components/admin/admin-referrals-content"

export default async function AdminReferralsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

  if (!userData?.is_admin) {
    redirect("/dashboard")
  }

  // Get all referrals with user details
  const { data: referrals } = await supabase
    .from("referrals")
    .select(
      `
      *,
      referrer:referrer_id(id, username, email, points_balance),
      referred:referred_id(id, username, email, points_balance, created_at, mining_count)
    `,
    )
    .order("created_at", { ascending: false })

  return <AdminReferralsContent referrals={referrals || []} />
}
