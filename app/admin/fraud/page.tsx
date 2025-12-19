import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield, Eye, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function FraudDetectionPage() {
  const supabase = await createClient()

  // Get suspicious activity logs
  const { data: suspiciousLogs } = await supabase
    .from("audit_log")
    .select(`
      *,
      user:user_id (username, email, status)
    `)
    .in("action", ["mining_ip_blocked", "mining_fingerprint_conflict", "suspicious_activity"])
    .order("created_at", { ascending: false })
    .limit(50)

  // Get users with multiple fingerprints
  const { data: multiFingerprint } = await supabase.from("device_fingerprints").select("user_id")

  // Group by user_id and count
  const fingerprintCounts =
    multiFingerprint?.reduce(
      (acc, fp) => {
        acc[fp.user_id] = (acc[fp.user_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const suspiciousUsers = Object.entries(fingerprintCounts)
    .filter(([, count]) => count > 3)
    .map(([userId]) => userId)

  // Get stats
  const { count: blockedToday } = await supabase
    .from("audit_log")
    .select("*", { count: "exact", head: true })
    .eq("action", "mining_ip_blocked")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const { count: fingerprintConflicts } = await supabase
    .from("audit_log")
    .select("*", { count: "exact", head: true })
    .eq("action", "mining_fingerprint_conflict")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const getActionLabel = (action: string) => {
    switch (action) {
      case "mining_ip_blocked":
        return { label: "IP Blocked", color: "text-yellow-500 bg-yellow-500/10" }
      case "mining_fingerprint_conflict":
        return { label: "Fingerprint Conflict", color: "text-red-500 bg-red-500/10" }
      default:
        return { label: action, color: "text-muted-foreground bg-muted" }
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          Fraud Detection
        </h1>
        <p className="text-muted-foreground mt-1">Monitor and investigate suspicious activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">IP Blocks (24h)</p>
                <p className="text-2xl font-bold text-foreground mt-1">{blockedToday || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Ban className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fingerprint Issues</p>
                <p className="text-2xl font-bold text-foreground mt-1">{fingerprintConflicts || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspicious Users</p>
                <p className="text-2xl font-bold text-foreground mt-1">{suspiciousUsers.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <Eye className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-green-500 mt-1">Active</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Suspicious Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suspiciousLogs?.map((log) => {
              const actionInfo = getActionLabel(log.action)
              const user = log.user as { username: string; email: string; status: string } | null
              const metadata = log.metadata as Record<string, unknown> | null

              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg", actionInfo.color.split(" ")[1])}>
                      <AlertTriangle className={cn("w-4 h-4", actionInfo.color.split(" ")[0])} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", actionInfo.color)}>
                          {actionInfo.label}
                        </span>
                      </div>
                      <p className="font-medium text-foreground mt-1">{user?.username || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      {metadata?.reason && (
                        <p className="text-sm text-muted-foreground mt-1">Reason: {String(metadata.reason)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                    {log.ip_address && (
                      <p className="text-xs font-mono text-muted-foreground mt-1">IP: {log.ip_address}</p>
                    )}
                  </div>
                </div>
              )
            })}

            {(!suspiciousLogs || suspiciousLogs.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No suspicious activity detected</p>
                <p className="text-sm">The system is monitoring for threats</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
