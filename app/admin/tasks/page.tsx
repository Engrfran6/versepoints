import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminTasksVerification } from "@/components/admin/admin-tasks-verification"

export default async function AdminTasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

  if (!userData?.is_admin) {
    redirect("/dashboard")
  }

  const { data: submissions } = await supabase
    .from("task_submissions")
    .select(`
      *,
      users:user_id(id, username, email),
      tasks:task_id(id, title, description, points_reward, platform, task_type)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
        <p className="text-muted-foreground mt-1">Review submissions, manage tasks, and monitor fraud</p>
      </div>

      <AdminTasksVerification submissions={submissions || []} />
    </div>
  )
}
