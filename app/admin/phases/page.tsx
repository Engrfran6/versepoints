"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, Play, Check, Lock, AlertTriangle } from "lucide-react"
import type { PlatformPhase } from "@/lib/types/phase2"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function AdminPhasesPage() {
  const router = useRouter()
  const [phases, setPhases] = useState<PlatformPhase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activatingPhase, setActivatingPhase] = useState<number | null>(null)

  useEffect(() => {
    loadPhases()
  }, [])

  const loadPhases = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("platform_phases").select("*").order("phase_number", { ascending: true })

    setPhases(data || [])
    setIsLoading(false)
  }

  const activatePhase = async (phaseNumber: number) => {
    setActivatingPhase(phaseNumber)

    try {
      const response = await fetch("/api/admin/phases/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phaseNumber }),
      })

      if (response.ok) {
        await loadPhases()
        router.refresh()
      }
    } finally {
      setActivatingPhase(null)
    }
  }

  const currentPhase = phases.find((p) => p.is_active)
  const completedCount = phases.filter((p) => p.is_completed).length

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Rocket className="w-8 h-8 text-accent" />
          Phase Control
        </h1>
        <p className="text-muted-foreground mt-1">Manage platform phases and feature releases</p>
      </div>

      {/* Current Phase Card */}
      <Card className="bg-gradient-to-br from-card to-accent/10 border-accent/30 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Active Phase</p>
              <h2 className="text-2xl font-bold text-foreground">
                Phase {currentPhase?.phase_number || 1}: {currentPhase?.phase_name || "Genesis Launch"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{currentPhase?.description}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-accent">{completedCount}</p>
              <p className="text-sm text-muted-foreground">of {phases.length} completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="bg-destructive/10 border-destructive/30 mb-8">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-destructive">
            Phase activation is irreversible. Ensure all prerequisites are met before advancing to the next phase.
          </p>
        </CardContent>
      </Card>

      {/* All Phases */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Phases</CardTitle>
          <CardDescription className="text-muted-foreground">
            Click &quot;Activate&quot; to advance to the next phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase, index) => {
              const isNext = currentPhase && phase.phase_number === currentPhase.phase_number + 1
              const canActivate = isNext && !phase.is_active && !phase.is_completed

              return (
                <div
                  key={phase.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    phase.is_completed
                      ? "bg-green-500/10 border-green-500/30"
                      : phase.is_active
                        ? "bg-primary/10 border-primary/30"
                        : isNext
                          ? "bg-accent/10 border-accent/30"
                          : "bg-muted/50 border-border",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          phase.is_completed
                            ? "bg-green-500 text-white"
                            : phase.is_active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {phase.is_completed ? <Check className="w-5 h-5" /> : phase.phase_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{phase.phase_name}</h3>
                          <Badge
                            className={cn(
                              phase.is_completed
                                ? "bg-green-500/20 text-green-400"
                                : phase.is_active
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            {phase.is_completed ? "Completed" : phase.is_active ? "Active" : "Locked"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(phase.features_unlocked as string[]).slice(0, 4).map((feature, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground"
                            >
                              {feature.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canActivate && (
                        <Button
                          onClick={() => activatePhase(phase.phase_number)}
                          disabled={activatingPhase === phase.phase_number}
                          className="gap-2"
                        >
                          {activatingPhase === phase.phase_number ? (
                            "Activating..."
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                      {phase.is_active && <Badge className="bg-primary text-primary-foreground">Current</Badge>}
                      {!phase.is_active && !phase.is_completed && !isNext && (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
