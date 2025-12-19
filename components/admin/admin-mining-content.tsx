"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pickaxe, Search, TrendingUp } from "lucide-react"

interface MiningSession {
  id: string
  user_id: string
  points_earned: number
  ip_address: string
  user_agent: string
  created_at: string
  users: {
    username: string
    email: string
  }
}

interface AdminMiningContentProps {
  sessions: MiningSession[]
}

export function AdminMiningContent({ sessions: initialSessions }: AdminMiningContentProps) {
  const [search, setSearch] = useState("")

  const filteredSessions = initialSessions.filter(
    (session) =>
      session.users.username.toLowerCase().includes(search.toLowerCase()) ||
      session.users.email.toLowerCase().includes(search.toLowerCase()) ||
      session.ip_address.includes(search),
  )

  const totalMined = initialSessions.reduce((sum, s) => sum + s.points_earned, 0)
  const todayMined = initialSessions.filter(
    (s) => new Date(s.created_at).toDateString() === new Date().toDateString(),
  ).length

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Pickaxe className="w-8 h-8 text-primary" />
          Mining Activity
        </h1>
        <p className="text-muted-foreground mt-1">Monitor all mining sessions</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-card via-card/95 to-primary/10 border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Pickaxe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{initialSessions.length}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card/95 to-green-500/10 border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{todayMined}</p>
                <p className="text-sm text-muted-foreground">Today's Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card/95 to-cyan-500/10 border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Pickaxe className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMined.toLocaleString()} VP</p>
                <p className="text-sm text-muted-foreground">Total Mined</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, email, or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mining Sessions Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Mining Sessions ({filteredSessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Points Earned</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{session.users.username}</p>
                        <p className="text-xs text-muted-foreground">{session.users.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-primary">+{session.points_earned} VP</span>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {session.ip_address}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(session.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSessions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Pickaxe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No mining sessions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
