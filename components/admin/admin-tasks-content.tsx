"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Plus, Trash2, ExternalLink, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description: string | null
  points_reward: number
  task_type: string
  action_url: string | null
  verification_type: string
  is_active: boolean
  created_at: string
}

interface PendingSubmission {
  id: string
  proof_url: string
  completed_at: string
  users: { username: string; email: string }
  tasks: { title: string; points_reward: number }
}

export function AdminTasksContent({ tasks, pendingSubmissions }: { tasks: Task[]; pendingSubmissions: any[] }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingProof, setViewingProof] = useState<PendingSubmission | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points_reward: 50,
    task_type: "social",
    action_url: "",
    verification_type: "manual",
  })

  const handleVerifyTask = async (submissionId: string, approved: boolean) => {
    try {
      const response = await fetch("/api/admin/tasks/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, approved }),
      })

      if (!response.ok) throw new Error("Failed to verify task")

      toast.success(approved ? "Task approved!" : "Task rejected")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleCreateTask = async () => {
    const taskData = { ...formData }
    if (formData.task_type === "referral" || formData.task_type === "complete_profile") {
      taskData.action_url = ""
    }

    try {
      const response = await fetch("/api/admin/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) throw new Error("Failed to create task")

      toast.success("Task created successfully")
      setIsCreating(false)
      setFormData({
        title: "",
        description: "",
        points_reward: 50,
        task_type: "social",
        action_url: "",
        verification_type: "manual",
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (taskId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, isActive: !isActive }),
      })

      if (!response.ok) throw new Error("Failed to update task")

      toast.success(isActive ? "Task deactivated" : "Task activated")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch("/api/admin/tasks/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })

      if (!response.ok) throw new Error("Failed to delete task")

      toast.success("Task deleted")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Pending Submissions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Pending Verifications</CardTitle>
            <Badge variant="outline" className="text-orange-500 border-orange-500">
              {pendingSubmissions.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
              >
                <div>
                  <p className="font-medium text-foreground">{submission.tasks.title}</p>
                  <p className="text-sm text-muted-foreground">
                    by {submission.users.username} • +{submission.tasks.points_reward} VP
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setViewingProof(submission)} className="gap-2">
                    <Eye className="w-4 h-4" />
                    View Proof
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleVerifyTask(submission.id, true)}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleVerifyTask(submission.id, false)}
                    className="gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingSubmissions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No pending verifications</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Tasks */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">All Tasks</CardTitle>
            <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <Badge variant={task.is_active ? "default" : "secondary"}>
                      {task.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-primary border-primary">
                      +{task.points_reward} VP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {task.action_url && (
                    <Button size="sm" variant="outline" asChild className="gap-2 bg-transparent">
                      <a href={task.action_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleToggleActive(task.id, task.is_active)}>
                    {task.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Task Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Task Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="e.g., Follow us on Twitter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="Detailed task instructions"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points" className="text-foreground">
                  Points Reward
                </Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points_reward}
                  onChange={(e) => setFormData({ ...formData, points_reward: Number.parseInt(e.target.value) })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-foreground">
                  Task Type
                </Label>
                <Select
                  value={formData.task_type}
                  onValueChange={(value) => setFormData({ ...formData, task_type: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="complete_profile">Complete Profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.task_type !== "referral" && formData.task_type !== "complete_profile" && (
              <div className="space-y-2">
                <Label htmlFor="url" className="text-foreground">
                  Action URL
                </Label>
                <Input
                  id="url"
                  value={formData.action_url}
                  onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                  className="bg-background border-border text-foreground"
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreateTask} className="flex-1 bg-primary hover:bg-primary/90">
                Create Task
              </Button>
              <Button onClick={() => setIsCreating(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Proof Viewing Dialog */}
      <Dialog open={!!viewingProof} onOpenChange={() => setViewingProof(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Task Proof</DialogTitle>
          </DialogHeader>
          {viewingProof && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Task</p>
                <p className="font-medium text-foreground">{viewingProof.tasks.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User</p>
                <p className="font-medium text-foreground">{viewingProof.users.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proof URL</p>
                <a
                  href={viewingProof.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {viewingProof.proof_url}
                </a>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    handleVerifyTask(viewingProof.id, true)
                    setViewingProof(null)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    handleVerifyTask(viewingProof.id, false)
                    setViewingProof(null)
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
