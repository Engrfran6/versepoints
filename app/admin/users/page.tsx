import { createClient } from "@/lib/supabase/server"
import { AdminUsersContent } from "@/components/admin/admin-users-content"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Get all users
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return <AdminUsersContent users={users || []} />
}
