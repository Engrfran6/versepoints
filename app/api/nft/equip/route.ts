import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const equipSchema = z.object({
  userNftId: z.string().uuid(),
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
    const validationResult = equipSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }

    const { userNftId } = validationResult.data

    // Use the database function to toggle equip
    const { data, error } = await supabase.rpc("toggle_nft_equipped", {
      owner_id: user.id,
      user_nft_id: userNftId,
    })

    if (error) {
      console.error("Equip error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const result = data?.[0]

    if (!result?.success) {
      return NextResponse.json({ success: false, error: "Failed to toggle equip" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      isEquipped: result.is_now_equipped,
    })
  } catch (error) {
    console.error("NFT equip error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
