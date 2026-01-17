"use client";

import {Suspense} from "react";
import dynamic from "next/dynamic";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {PhaseCard} from "@/components/phase/phase-card";
import {PhaseTimeline} from "@/components/phase/phase-timeline";
import {CurrentPhaseBanner} from "@/components/phase/current-phase-banner";
import {Rocket, Calendar, Target, Gift} from "lucide-react";
import type {PlatformPhase} from "@/lib/types/phase2";
import {fetchPlatformPhases} from "@/lib/queries/phases";
import {usePlatformPhases} from "@/lib/hooks/usePlatformPhases";
import {NFTMarketplaceSkeleton} from "@/components/skeleton/nft-marketplace-skeleton";

const PhaseProgressOrb = dynamic(
  () => import("@/components/3d/phase-progress-orb").then((mod) => mod.PhaseProgressOrb),
  {ssr: false}
);
const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  {ssr: false}
);

export function PhasesPageContent() {
  const {data: phases, isLoading: isLoadingPhases} = usePlatformPhases();

  // Get current active phase
  const currentPhase: PlatformPhase = phases?.find((p: PlatformPhase) => p.is_active);
  const currentPhaseIndex = phases?.findIndex((p: PlatformPhase) => p.is_active) || 0;
  const nextPhase: PlatformPhase = phases?.[currentPhaseIndex + 1];

  // Calculate phases stats
  const completedPhases =
    phases?.filter((p: PlatformPhase) => p.is_completed).length || (0 as number);
  const totalPhases = phases?.length || (12 as number);

  const progressPercentage = Math.round((completedPhases / totalPhases) * 100);

  return (
    <div className="relative p-4 md:p-8 min-h-screen">
      {isLoadingPhases ? (
        <NFTMarketplaceSkeleton />
      ) : (
        <>
          <Suspense fallback={null}>
            <FloatingParticles className="opacity-20" color="#f59e0b" count={1000} />
          </Suspense>

          {/* Header */}
          <div className="relative z-10 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Rocket className="w-8 h-8 text-primary" />
              Roadmap
            </h1>
            <p className="text-muted-foreground mt-1">
              Track the VersePoints platform development journey
            </p>
          </div>

          {/* Stats Cards with 3D Orb */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="col-span-2 md:col-span-1 bg-gradient-to-br from-card/90 to-primary/10 border-border backdrop-blur-sm row-span-2 flex items-center justify-center">
              <Suspense
                fallback={
                  <div className="w-32 h-32 flex items-center justify-center">
                    <div className="text-4xl font-bold text-primary">{progressPercentage}%</div>
                  </div>
                }>
                <div className="w-48 h-24">
                  <PhaseProgressOrb
                    progress={progressPercentage}
                    phaseNumber={currentPhase?.phase_number}
                    phaseName={currentPhase.phase_name}
                  />
                </div>
              </Suspense>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {currentPhase?.phase_number || 1}
                    </p>
                    <p className="text-xs text-muted-foreground">Current Phase</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Gift className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{completedPhases}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {totalPhases - completedPhases - 1}
                    </p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Rocket className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{progressPercentage}%</p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Phase Banner */}
          {currentPhase && (
            <div className="relative z-10">
              <CurrentPhaseBanner
                currentPhase={currentPhase}
                nextPhase={nextPhase}
                progress={Math.round(((currentPhase.phase_number - 1) / totalPhases) * 100)}
                className="mb-8"
              />
            </div>
          )}

          {/* Timeline */}
          <Card className="relative z-10 bg-card/90 backdrop-blur-sm border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Phase Timeline</CardTitle>
              <CardDescription className="text-muted-foreground">
                Our 12-phase journey from Web2 to full blockchain integration
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <PhaseTimeline
                phases={phases || []}
                currentPhaseNumber={currentPhase?.phase_number || 1}
              />
            </CardContent>
          </Card>

          {/* All Phases Grid */}
          <div className="relative z-10 space-y-4">
            <h2 className="text-xl font-bold text-foreground">All Phases</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {phases?.map((phase: PlatformPhase) => (
                <PhaseCard key={phase.id} phase={phase} isCurrentPhase={phase.is_active} />
              ))}
            </div>
          </div>

          {/* Future Vision Card */}
          <Card className="relative z-10 mt-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">The VersePoints Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                VersePoints is building toward a fully decentralized ecosystem where your mining
                efforts translate into real blockchain assets. Our 12-phase roadmap ensures a smooth
                transition from Web2 to Web3.
              </p>
              <div className="grid md:grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 rounded-lg bg-card">
                  <p className="text-3xl font-bold text-primary mb-2">Phase 1-4</p>
                  <p className="text-sm">Foundation & Growth</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card">
                  <p className="text-3xl font-bold text-accent mb-2">Phase 5-8</p>
                  <p className="text-sm">NFTs & Blockchain</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card">
                  <p className="text-3xl font-bold text-amber-400 mb-2">Phase 9-12</p>
                  <p className="text-sm">Full Ecosystem</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
