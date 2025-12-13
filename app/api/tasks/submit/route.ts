import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId, proofUrl } = await request.json()

    if (!taskId || !proofUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if task exists and is active
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("is_active", true)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user already completed this task
    const { data: existingTask } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_id", taskId)
      .single()

    if (existingTask) {
      return NextResponse.json({ error: "Task already submitted" }, { status: 400 })
    }

    // Create user task submission
    const { error: insertError } = await supabase.from("user_tasks").insert({
      user_id: user.id,
      task_id: taskId,
      status: "pending",
      proof_url: proofUrl,
      completed_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: "Failed to submit task" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Task submission error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
