"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { PlatformPhase } from "@/lib/types/phase2"
import { Rocket, Check, ArrowRight } from "lucide-react"

interface CurrentPhaseBannerProps {
  currentPhase: PlatformPhase
  nextPhase?: PlatformPhase
  progress?: number
  className?: string
}

export function CurrentPhaseBanner({ currentPhase, nextPhase, progress = 0, className }: CurrentPhaseBannerProps) {
  return (
    <Card className={cn("bg-gradient-to-br from-card to-primary/10 border-border gradient-border", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Current Phase Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Current Phase</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Phase {currentPhase.phase_number}: {currentPhase.phase_name}
            </h2>
            <p className="text-sm text-muted-foreground">{currentPhase.description}</p>

            {/* Active Features */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(currentPhase.features_unlocked as string[]).slice(0, 5).map((feature, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                >
                  <Check className="w-3 h-3" />
                  {feature.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Progress to Next Phase */}
          {nextPhase && (
            <div className="w-full md:w-64 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to Phase {nextPhase.phase_number}</span>
                <span className="font-medium text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Next: {nextPhase.phase_name}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
