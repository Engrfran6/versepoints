import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const upgradeSchema = z.object({
  nftIds: z.array(z.string().uuid()).length(3),
  targetTier: z.enum(["basic", "silver", "gold", "diamond", "legendary"]),
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
    const validationResult = upgradeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }

    const { nftIds, targetTier } = validationResult.data

    // Use the database function to upgrade NFTs
    const { data, error } = await supabase.rpc("upgrade_nfts", {
      owner_id: user.id,
      nft_ids: nftIds,
      target_tier: targetTier,
    })

    if (error) {
      console.error("Upgrade error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const result = data?.[0]

    if (!result?.success) {
      return NextResponse.json({ success: false, error: result?.message || "Upgrade failed" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      newNftId: result.new_nft_id,
      message: result.message,
    })
  } catch (error) {
    console.error("NFT upgrade error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
