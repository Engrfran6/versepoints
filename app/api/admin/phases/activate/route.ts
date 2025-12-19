import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const activateSchema = z.object({
  phaseNumber: z.number().min(1).max(12),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check admin status
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (!userData?.is_admin) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = activateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }

    const { phaseNumber } = validationResult.data

    // Get current active phase
    const { data: currentPhase } = await supabase.from("platform_phases").select("*").eq("is_active", true).single()

    // Validate phase progression
    if (currentPhase && phaseNumber !== currentPhase.phase_number + 1) {
      return NextResponse.json(
        { success: false, error: "Can only activate the next sequential phase" },
        { status: 400 },
      )
    }

    // Mark current phase as completed
    if (currentPhase) {
      await supabase
        .from("platform_phases")
        .update({ is_active: false, is_completed: true, end_date: new Date().toISOString() })
        .eq("id", currentPhase.id)
    }

    // Activate new phase
    const { error: activateError } = await supabase
      .from("platform_phases")
      .update({ is_active: true, start_date: new Date().toISOString() })
      .eq("phase_number", phaseNumber)

    if (activateError) {
      return NextResponse.json({ success: false, error: activateError.message }, { status: 500 })
    }

    // Log the phase activation
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "phase_activated",
      metadata: { phase_number: phaseNumber, previous_phase: currentPhase?.phase_number },
    })

    return NextResponse.json({ success: true, activatedPhase: phaseNumber })
  } catch (error) {
    console.error("Phase activation error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
