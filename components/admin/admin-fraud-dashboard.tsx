"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, TrendingUp, Users } from "lucide-react"

interface UserRiskProfile {
  user_id: string
  fraud_score: number
  flagged: boolean
  flag_reason: string | null
  submission_count: number
  rejection_count: number
  approval_count: number
  users: {
    username: string
    email: string
  }
}

export function AdminFraudDashboard({ riskProfiles }: { riskProfiles: UserRiskProfile[] }) {
  const flaggedUsers = riskProfiles.filter((p) => p.flagged)
  const highRiskUsers = riskProfiles.filter((p) => p.fraud_score > 50 && !p.flagged)
  const avgFraudScore = riskProfiles.reduce((sum, p) => sum + p.fraud_score, 0) / (riskProfiles.length || 1)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{riskProfiles.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
            <p className="text-2xl font-bold text-orange-500">{highRiskUsers.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Flagged</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{flaggedUsers.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Avg Risk Score</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgFraudScore.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Users */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            High Risk Users
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Users with fraud score above 50 requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highRiskUsers.map((profile) => (
              <div
                key={profile.user_id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
              >
                <div>
                  <p className="font-medium text-foreground">{profile.users.username}</p>
                  <p className="text-sm text-muted-foreground">{profile.users.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{profile.submission_count} submissions</span>
                    <span>{profile.rejection_count} rejections</span>
                    <span>{profile.approval_count} approvals</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {profile.fraud_score}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
            {highRiskUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No high-risk users detected</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flagged Users */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Flagged Users
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Users manually flagged for suspicious activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {flaggedUsers.map((profile) => (
              <div
                key={profile.user_id}
                className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20"
              >
                <div>
                  <p className="font-medium text-foreground">{profile.users.username}</p>
                  <p className="text-sm text-muted-foreground">{profile.users.email}</p>
                  {profile.flag_reason && <p className="text-sm text-red-500 mt-1">Reason: {profile.flag_reason}</p>}
                </div>
                <Button size="sm" variant="outline">
                  Unflag
                </Button>
              </div>
            ))}
            {flaggedUsers.length === 0 && <p className="text-center text-muted-foreground py-8">No flagged users</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
