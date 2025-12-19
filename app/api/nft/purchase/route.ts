import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const purchaseSchema = z.object({
  nftId: z.string().uuid(),
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
    const validationResult = purchaseSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }

    const { nftId } = validationResult.data

    // Use the database function to purchase NFT
    const { data, error } = await supabase.rpc("purchase_nft", {
      buyer_id: user.id,
      nft_catalog_id: nftId,
    })

    if (error) {
      console.error("Purchase error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const result = data?.[0]

    if (!result?.success) {
      return NextResponse.json({ success: false, error: result?.message || "Purchase failed" }, { status: 400 })
    }

    // Get the NFT cost for response
    const { data: nftData } = await supabase.from("nft_catalog").select("vp_cost").eq("id", nftId).single()

    return NextResponse.json({
      success: true,
      userNftId: result.user_nft_id,
      cost: nftData?.vp_cost || 0,
    })
  } catch (error) {
    console.error("NFT purchase error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
