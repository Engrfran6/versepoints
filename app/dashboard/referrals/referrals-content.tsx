"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReferralLink } from "@/components/dashboard/referral-link"
import { Users, UserCheck, Coins, TrendingUp } from "lucide-react"

const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  { ssr: false },
)
const ReferralNetwork3D = dynamic(
  () => import("@/components/3d/referral-network-3d").then((mod) => mod.ReferralNetwork3D),
  { ssr: false },
)

interface ReferredUser {
  username: string
  mining_count: number
}

interface Referral {
  id: string
  status: string
  created_at: string
  referred: ReferredUser | null
}

interface Earning {
  id: string
  earning_type: string
  points_earned: number
  created_at: string
}

interface ReferralsContentProps {
  userData: { referral_code: string; total_referral_earnings: number } | null
  referrals: Referral[]
  earnings: Earning[]
}

export function ReferralsContent({ userData, referrals, earnings }: ReferralsContentProps) {
  const totalReferrals = referrals?.length || 0
  const activeReferrals = referrals?.filter((r) => r.status === "active").length || 0
  const totalEarnings = userData?.total_referral_earnings || 0

  return (
    <div className="relative p-4 md:p-8 min-h-screen">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <FloatingParticles count={1000} color="#8b5cf6" className="opacity-20" />
      </Suspense>

      {/* Header with 3D Network */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row items-center gap-6">
        <Suspense fallback={<div className="w-32 h-32 bg-muted/20 rounded-lg animate-pulse" />}>
          <div className="w-40 h-40 md:w-48 md:h-48">
            <ReferralNetwork3D />
          </div>
        </Suspense>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Referrals</h1>
          <p className="text-muted-foreground mt-1">Invite friends and earn bonus VersePoints</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeReferrals}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalEarnings}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+2</p>
                <p className="text-xs text-muted-foreground">Per Mining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <div className="relative z-10 mb-8">
        <ReferralLink referralCode={userData?.referral_code || ""} />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 gap-6">
        {/* Referrals List */}
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Your Referrals</CardTitle>
            <CardDescription className="text-muted-foreground">Users who signed up with your link</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals && referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((referral) => {
                  const referred = referral.referred as ReferredUser | null
                  return (
                    <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-foreground">{referred?.username || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{referred?.mining_count || 0} mining sessions</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          referral.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No referrals yet</p>
                <p className="text-sm">Share your link to start earning!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Earnings</CardTitle>
            <CardDescription className="text-muted-foreground">Points earned from referrals</CardDescription>
          </CardHeader>
          <CardContent>
            {earnings && earnings.length > 0 ? (
              <div className="space-y-3">
                {earnings.map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground capitalize">{earning.earning_type} bonus</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-primary">+{earning.points_earned} VP</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No earnings yet</p>
                <p className="text-sm">Refer friends to start earning!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="relative z-10 bg-primary/5 backdrop-blur-sm border-primary/20 mt-8">
        <CardHeader>
          <CardTitle className="text-foreground">How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">Share Your Link</h3>
              <p className="text-sm text-muted-foreground">Send your unique referral link to friends</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">They Sign Up & Mine</h3>
              <p className="text-sm text-muted-foreground">Earn +10 VP when they complete first mining</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">Ongoing Rewards</h3>
              <p className="text-sm text-muted-foreground">Get +2 VP every time they mine</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
