"use client"

import { cn } from "@/lib/utils"
import type { PlatformPhase } from "@/lib/types/phase2"
import { Check, Play, Lock } from "lucide-react"

interface PhaseTimelineProps {
  phases: PlatformPhase[]
  currentPhaseNumber: number
  className?: string
}

export function PhaseTimeline({ phases, currentPhaseNumber, className }: PhaseTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Progress Line */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${((currentPhaseNumber - 1) / (phases.length - 1)) * 100}%` }}
        />
      </div>

      {/* Phase Dots */}
      <div className="relative flex justify-between">
        {phases.map((phase) => {
          const isCompleted = phase.is_completed
          const isActive = phase.is_active
          const isFuture = !isCompleted && !isActive

          return (
            <div key={phase.id} className="flex flex-col items-center" style={{ width: `${100 / phases.length}%` }}>
              {/* Dot */}
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all",
                  isCompleted
                    ? "bg-green-500 border-green-500/50 text-white"
                    : isActive
                      ? "bg-primary border-primary/50 text-primary-foreground animate-pulse"
                      : "bg-muted border-border text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isActive ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>

              {/* Phase Number */}
              <span
                className={cn(
                  "mt-2 text-xs font-bold",
                  isCompleted ? "text-green-400" : isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                Phase {phase.phase_number}
              </span>

              {/* Phase Name (hidden on mobile) */}
              <span
                className={cn(
                  "hidden md:block text-[10px] text-center mt-1 max-w-[80px] truncate",
                  isCompleted || isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {phase.phase_name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
