import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, points_balance, status, created_at")
      .eq("id", id)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found", verified: false }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      verified: user.status === "active",
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        balance: user.points_balance,
        status: user.status,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error", verified: false }, { status: 500 })
  }
}
