import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

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

    const { taskId, proofUrl, proofData } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 })
    }

    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("is_active", true)
      .eq("status", "active")
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found or inactive" }, { status: 404 })
    }

    const { data: existingTask } = await supabase
      .from("task_submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_id", taskId)
      .single()

    if (existingTask) {
      return NextResponse.json({ error: "Task already submitted" }, { status: 400 })
    }

    if (task.max_completions_per_user) {
      const { count } = await supabase
        .from("task_submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("task_id", taskId)

      if (count && count >= task.max_completions_per_user) {
        return NextResponse.json({ error: "Maximum completions reached for this task" }, { status: 400 })
      }
    }

    const userAgent = request.headers.get("user-agent") || ""
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    const { error: insertError } = await supabaseAdmin.from("task_submissions").insert({
      user_id: user.id,
      task_id: taskId,
      status: "pending",
      proof_url: proofUrl || null,
      proof_data: proofData || {},
      completed_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: "Failed to submit task" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Task submitted for verification" })
  } catch (error: any) {
    console.error("Task submission error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
