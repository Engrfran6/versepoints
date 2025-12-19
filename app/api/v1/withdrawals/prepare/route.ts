import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // This endpoint is a placeholder for future blockchain integration
    return NextResponse.json(
      {
        success: false,
        error: "Withdrawals are not yet available",
        message: "Blockchain integration coming in Phase 2",
        status: "locked",
      },
      { status: 503 },
    )
  } catch (error) {
    console.error("Withdrawal preparation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
