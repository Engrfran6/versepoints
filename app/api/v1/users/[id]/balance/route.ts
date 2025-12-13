import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, points_balance, total_mined, mining_count")
      .eq("id", id)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        username: user.username,
        balance: user.points_balance,
        totalMined: user.total_mined,
        miningCount: user.mining_count,
      },
    })
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
