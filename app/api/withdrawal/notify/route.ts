import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { z } from "zod"

const notifySchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = notifySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 })
    }

    const { email } = validationResult.data

    // Store notification request in withdrawal_notifications table
    const { error: insertError } = await supabaseAdmin.from("withdrawal_notifications").insert({
      user_id: user.id,
      email,
      subscribed: true,
    })

    if (insertError) {
      // Check if already subscribed
      if (insertError.code === "23505") {
        return NextResponse.json({ success: false, error: "Already subscribed" }, { status: 400 })
      }
      throw insertError
    }

    return NextResponse.json({ success: true, message: "Notification subscription added" })
  } catch (error) {
    console.error("Notify error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
