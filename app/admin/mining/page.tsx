import { createClient } from "@/lib/supabase/server"
import { AdminMiningContent } from "@/components/admin/admin-mining-content"

export default async function AdminMiningPage() {
  const supabase = await createClient()

  // Get mining sessions with user info
  const { data: sessions } = await supabase
    .from("mining_sessions")
    .select(`
      *,
      users (
        username,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  return <AdminMiningContent sessions={sessions || []} />
}
