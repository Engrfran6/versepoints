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

    const { userId, amount } = await request.json()

    // Get current balance
    const { data: userData } = await supabase.from("users").select("points_balance").eq("id", userId).single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newBalance = userData.points_balance + amount

    const { error } = await supabase.from("users").update({ points_balance: newBalance }).eq("id", userId)

    if (error) throw error

    // Log action
    await supabase.from("audit_log").insert({
      user_id: userId,
      action: "admin_points_adjustment",
      metadata: {
        adjustment: amount,
        new_balance: newBalance,
        admin_id: user.id,
      },
    })

    return NextResponse.json({ success: true, newBalance })
  } catch (error) {
    console.error("Points adjustment error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
