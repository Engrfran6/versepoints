import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TasksContent } from "./tasks-content"

export default async function TasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get all active tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_active", true)
    .order("points_reward", { ascending: false })

  // Get user's completed tasks
  const { data: userTasks } = await supabase.from("user_tasks").select("*").eq("user_id", user.id)

  return <TasksContent tasks={tasks || []} userTasks={userTasks || []} />
}
