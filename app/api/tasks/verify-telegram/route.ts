import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, chatId, username } = body

    if (!taskId || !chatId || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get Telegram bot token from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      // If no bot token, mark for manual review
      return NextResponse.json({
        verified: false,
        message: "Telegram verification unavailable. Marked for manual review.",
      })
    }

    // Verify membership using Telegram Bot API
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${username}`,
    )

    const telegramData = await telegramResponse.json()
    const isMember = telegramData.ok && ["member", "administrator", "creator"].includes(telegramData.result?.status)

    return NextResponse.json({
      verified: isMember,
      message: isMember ? "Membership verified!" : "Could not verify membership",
      data: {
        telegramUsername: username,
        chatId,
        membershipVerified: isMember,
      },
    })
  } catch (error: any) {
    console.error("[v0] Telegram verification error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
