"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PlatformPhase } from "@/lib/types/phase2"
import { Check, Lock, Play, Clock } from "lucide-react"

interface PhaseCardProps {
  phase: PlatformPhase
  isCurrentPhase: boolean
  className?: string
}

const PHASE_COLORS = [
  { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/30" },
  { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
  { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", border: "border-fuchsia-500/30" },
  { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
  { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
  { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  { bg: "bg-lime-500/20", text: "text-lime-400", border: "border-lime-500/30" },
  { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30" },
  { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
]

export function PhaseCard({ phase, isCurrentPhase, className }: PhaseCardProps) {
  const colorIndex = (phase.phase_number - 1) % PHASE_COLORS.length
  const colors = PHASE_COLORS[colorIndex]

  const getStatusIcon = () => {
    if (phase.is_completed) return <Check className="w-4 h-4" />
    if (phase.is_active) return <Play className="w-4 h-4" />
    return <Lock className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (phase.is_completed) return "Completed"
    if (phase.is_active) return "Active"
    return "Locked"
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        colors.border,
        "border-2",
        isCurrentPhase && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        !phase.is_active && !phase.is_completed && "opacity-50",
        className,
      )}
    >
      {/* Phase Number Badge */}
      <div
        className={cn("absolute top-0 left-0 w-12 h-12 flex items-center justify-center", colors.bg, "rounded-br-xl")}
      >
        <span className={cn("text-xl font-bold", colors.text)}>{phase.phase_number}</span>
      </div>

      {/* Status Badge */}
      <Badge
        className={cn(
          "absolute top-2 right-2",
          phase.is_completed
            ? "bg-green-500/20 text-green-400 border-green-500/30"
            : phase.is_active
              ? "bg-primary/20 text-primary border-primary/30"
              : "bg-muted text-muted-foreground border-border",
        )}
      >
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>

      <CardContent className="pt-14 pb-4 px-4">
        {/* Phase Name */}
        <h3
          className={cn(
            "font-bold text-lg mb-2",
            phase.is_active || phase.is_completed ? colors.text : "text-muted-foreground",
          )}
        >
          {phase.phase_name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{phase.description}</p>

        {/* Features */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Features:</p>
          <div className="flex flex-wrap gap-1">
            {(phase.features_unlocked as string[]).slice(0, 3).map((feature, i) => (
              <span key={i} className={cn("px-2 py-0.5 rounded-full text-[10px]", colors.bg, colors.text)}>
                {feature.replace(/_/g, " ")}
              </span>
            ))}
            {(phase.features_unlocked as string[]).length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground">
                +{(phase.features_unlocked as string[]).length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Dates */}
        {phase.start_date && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {phase.is_completed
                ? `Completed ${new Date(phase.end_date || phase.start_date).toLocaleDateString()}`
                : phase.is_active
                  ? `Started ${new Date(phase.start_date).toLocaleDateString()}`
                  : "Coming Soon"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
