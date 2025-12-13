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

    // Check if user is admin
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { submissionId, approved } = await request.json()

    // Get the submission
    const { data: submission, error: submissionError } = await supabase
      .from("user_tasks")
      .select("*, tasks(*)")
      .eq("id", submissionId)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    if (approved) {
      // Update submission status
      await supabase
        .from("user_tasks")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
          points_awarded: submission.tasks.points_reward,
        })
        .eq("id", submissionId)

      // Award points to user
      await supabase.rpc("increment_user_points", {
        user_id: submission.user_id,
        points: submission.tasks.points_reward,
      })
    } else {
      // Reject submission
      await supabase.from("user_tasks").update({ status: "rejected" }).eq("id", submissionId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Task verification error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
