"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, MoreVertical, Ban, CheckCircle, Coins, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { User } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface AdminUsersContentProps {
  users: User[]
}

export function AdminUsersContent({ users: initialUsers }: AdminUsersContentProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pointsDialog, setPointsDialog] = useState(false)
  const [detailsDialog, setDetailsDialog] = useState(false)
  const [pointsAmount, setPointsAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      })

      if (response.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus as User["status"] } : u)))
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustPoints = async () => {
    if (!selectedUser || !pointsAmount) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: Number.parseInt(pointsAmount),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, points_balance: data.newBalance } : u)))
        setPointsDialog(false)
        setPointsAmount("")
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Failed to adjust points:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">View and manage all users</p>
      </div>

      {/* Search */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Points</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mining</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-primary">{user.points_balance.toLocaleString()} VP</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-foreground">{user.mining_count}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          user.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : user.status === "suspended"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-red-500/10 text-red-500",
                        )}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(user)
                              setPointsDialog(true)
                            }}
                          >
                            <Coins className="w-4 h-4" />
                            Adjust Points
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(user)
                              setDetailsDialog(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-yellow-500"
                              onClick={() => handleStatusChange(user.id, "suspended")}
                            >
                              <Ban className="w-4 h-4" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-green-500"
                              onClick={() => handleStatusChange(user.id, "active")}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Points Adjustment Dialog */}
      <Dialog open={pointsDialog} onOpenChange={setPointsDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Adjust Points</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Adjust points for {selectedUser?.username}. Use negative values to deduct.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-foreground">Current Balance</Label>
              <p className="text-2xl font-bold text-primary">{selectedUser?.points_balance.toLocaleString()} VP</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="points" className="text-foreground">
                Adjustment Amount
              </Label>
              <Input
                id="points"
                type="number"
                placeholder="e.g., 100 or -50"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPointsDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdjustPoints}
              disabled={isLoading || !pointsAmount}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Saving..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">User Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Complete information for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Username</Label>
                <p className="text-foreground font-medium">{selectedUser?.username}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="text-foreground font-medium">{selectedUser?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Points Balance</Label>
                <p className="text-2xl font-bold text-primary">{selectedUser?.points_balance.toLocaleString()} VP</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Status</Label>
                <span
                  className={cn(
                    "inline-block px-2 py-1 rounded-full text-xs font-medium mt-1",
                    selectedUser?.status === "active"
                      ? "bg-green-500/10 text-green-500"
                      : selectedUser?.status === "suspended"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-red-500/10 text-red-500",
                  )}
                >
                  {selectedUser?.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Mining Count</Label>
                <p className="text-foreground font-medium">{selectedUser?.mining_count}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Referral Count</Label>
                <p className="text-foreground font-medium">{selectedUser?.referral_count}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Referral Code</Label>
                <code className="text-xs text-foreground bg-muted px-2 py-1 rounded">
                  {selectedUser?.referral_code}
                </code>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Joined</Label>
                <p className="text-foreground font-medium">
                  {selectedUser?.created_at && new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {selectedUser?.last_mining_at && (
              <div>
                <Label className="text-muted-foreground text-xs">Last Mining</Label>
                <p className="text-foreground font-medium">{new Date(selectedUser.last_mining_at).toLocaleString()}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
