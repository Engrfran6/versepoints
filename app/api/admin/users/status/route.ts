import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminCheck } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, status } = await request.json()

    const { error } = await supabase.from("users").update({ status }).eq("id", userId)

    if (error) throw error

    // Log action
    await supabase.from("audit_log").insert({
      user_id: userId,
      action: "admin_status_change",
      metadata: { new_status: status, admin_id: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Status update error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
