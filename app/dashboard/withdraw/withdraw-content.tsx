"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Lock, Rocket, Bell, Coins } from "lucide-react"

const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  { ssr: false },
)
const Vault3D = dynamic(() => import("@/components/3d/vault-3d").then((mod) => mod.Vault3D), { ssr: false })

interface WithdrawContentProps {
  pointsBalance: number
}

export function WithdrawContent({ pointsBalance }: WithdrawContentProps) {
  return (
    <div className="relative p-4 md:p-8 min-h-screen">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <FloatingParticles count={800} color="#8b5cf6" className="opacity-20" />
      </Suspense>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Wallet className="w-8 h-8 text-primary" />
          Withdraw
        </h1>
        <p className="text-muted-foreground mt-1">Convert your VersePoints to tokens</p>
      </div>

      {/* Balance Card */}
      <Card className="relative z-10 bg-gradient-to-br from-card/90 to-primary/5 border-border gradient-border mb-8 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-4xl font-bold text-foreground mt-1">{pointsBalance.toLocaleString()}</p>
              <p className="text-sm text-primary mt-1">VersePoints</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10">
              <Coins className="w-10 h-10 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Card with 3D Vault */}
      <Card className="relative z-10 bg-card/90 backdrop-blur-sm border-border">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* 3D Vault */}
            <Suspense fallback={<div className="w-48 h-48 bg-muted/20 rounded-lg animate-pulse" />}>
              <div className="w-48 h-48 md:w-64 md:h-64">
                <Vault3D />
              </div>
            </Suspense>

            <div className="flex-1 text-center md:text-left">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto md:mx-0 mb-6">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Withdrawals Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                We&apos;re working on blockchain integration to allow you to convert your VersePoints to tokens. Stay
                tuned for updates!
              </p>
              <Button disabled className="gap-2">
                <Lock className="w-4 h-4" />
                Withdrawal Unavailable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <div className="relative z-10 grid md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-primary/5 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-foreground text-lg">Phase 1</CardTitle>
            <CardDescription className="text-primary">Current</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Daily mining system</li>
              <li>• Referral rewards</li>
              <li>• Leaderboard rankings</li>
              <li>• Task completion</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-foreground text-lg">Phase 2</CardTitle>
            <CardDescription className="text-muted-foreground">Coming Soon</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Blockchain integration</li>
              <li>• Token conversion</li>
              <li>• Wallet connection</li>
              <li>• Withdrawal system</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-foreground text-lg">Phase 3</CardTitle>
            <CardDescription className="text-muted-foreground">Future</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• NFT rewards</li>
              <li>• Staking system</li>
              <li>• Governance voting</li>
              <li>• Premium features</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Notification Signup */}
      <Card className="relative z-10 bg-card/90 backdrop-blur-sm border-border mt-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Get Notified</h3>
                <p className="text-sm text-muted-foreground">We&apos;ll email you when withdrawals are available</p>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Notify Me</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
