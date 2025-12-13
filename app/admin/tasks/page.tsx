import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminTasksContent } from "@/components/admin/admin-tasks-content"

export default async function AdminTasksPage() {
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

  // Get all tasks
  const { data: tasks } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

  // Get pending task submissions
  const { data: pendingSubmissions } = await supabase
    .from("user_tasks")
    .select(`
      *,
      users:user_id(username, email),
      tasks:task_id(title, points_reward)
    `)
    .eq("status", "pending")
    .order("completed_at", { ascending: false })

  return <AdminTasksContent tasks={tasks || []} pendingSubmissions={pendingSubmissions || []} />
}
