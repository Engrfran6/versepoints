import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { PlatformPhase } from "@/lib/types/phase2"
import { PhasesPageContent } from "./phases-page-content"

export default async function PhasesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get all phases
  const { data: phases } = await supabase.from("platform_phases").select("*").order("phase_number", { ascending: true })

  // Get current active phase
  const currentPhase = phases?.find((p: PlatformPhase) => p.is_active)
  const currentPhaseIndex = phases?.findIndex((p: PlatformPhase) => p.is_active) || 0
  const nextPhase = phases?.[currentPhaseIndex + 1]

  // Calculate phases stats
  const completedPhases = phases?.filter((p: PlatformPhase) => p.is_completed).length || 0
  const totalPhases = phases?.length || 12

  return (
    <PhasesPageContent
      phases={phases || []}
      currentPhase={currentPhase}
      nextPhase={nextPhase}
      completedPhases={completedPhases}
      totalPhases={totalPhases}
    />
  )
}
