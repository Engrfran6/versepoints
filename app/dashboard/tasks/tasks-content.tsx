"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckSquare,
  ExternalLink,
  CheckCircle2,
  Clock,
  Gift,
} from "lucide-react";
import { cn, extractYouTubeVideoId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { YouTubeTaskPlayer } from "@/components/tasks/youtube-task-player";

const FloatingParticles = dynamic(
  () =>
    import("@/components/3d/floating-particles").then(
      (mod) => mod.FloatingParticles
    ),
  { ssr: false }
);
const TaskCheckmark3D = dynamic(
  () =>
    import("@/components/3d/task-checkmark-3d").then(
      (mod) => mod.TaskCheckmark3D
    ),
  {
    ssr: false,
  }
);

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  points_reward: number;
  action_url: string | null;
  is_active: boolean;
  verification_type: string;
}

interface UserTask {
  id: string;
  task_id: string;
  status: string;
  proof_url: string | null;
}

interface TasksContentProps {
  tasks: Task[];
  userTasks: UserTask[];
}

export function TasksContent({ tasks, userTasks }: TasksContentProps) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completedTaskIds = new Set(userTasks?.map((ut) => ut.task_id) || []);
  const [activeYouTubeTask, setActiveYouTubeTask] = useState<{
    taskId: string;
    videoId: string;
  } | null>(null);

  const handleStartTask = (task: Task) => {
    if (
      task.task_type === "special" &&
      task.title.toLowerCase().includes("mining")
    ) {
      router.push("/dashboard");
      toast.info(
        `You will earn ${task.points_reward} when you mine for the first time`
      );
      return;
    }

    if (task.task_type === "referral") {
      router.push("/dashboard/referrals");
      toast.info("Share your referral link to complete this task");
      return;
    }

    if (
      task.title.toLowerCase().includes("profile") ||
      task.title.toLowerCase().includes("complete")
    ) {
      router.push("/dashboard/settings");
      toast.info("Complete your profile to earn points");
      return;
    }

    // ✅ YOUTUBE TASK
    if (task.action_url && task.title.toLowerCase().includes("watch")) {
      const videoId = extractYouTubeVideoId(task.action_url);

      if (!videoId) {
        toast.error("Invalid YouTube link");
        return;
      }

      if (completedTaskIds.has(task.id)) {
        toast.info("You already completed this task");
        return;
      }

      setActiveYouTubeTask({
        taskId: task.id,
        videoId,
      });

      return;
    }

    // Other tasks
    if (task.action_url) {
      window.open(task.action_url, "_blank");
      setTimeout(() => setSelectedTask(task), 1000);
    }
  };

  const handleSubmitProof = async () => {
    if (!selectedTask || !proofUrl.trim()) {
      toast.error("Please provide proof URL");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          proofUrl: proofUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit task");
      }

      toast.success("Task submitted! Awaiting admin verification");
      setSelectedTask(null);
      setProofUrl("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "social":
        return "🐦";
      case "daily":
        return "📅";
      case "special":
        return "⭐";
      case "referral":
        return "👥";
      default:
        return "✅";
    }
  };

  const getTaskStatus = (taskId: string) => {
    const userTask = userTasks?.find((ut) => ut.task_id === taskId);
    if (!userTask) return null;
    return userTask.status;
  };

  const noOfPendingTask = userTasks?.map(
    (ut) => ut.status === "pending"
  ).length;

  return (
    <div className="relative p-4 md:p-8 min-h-screen">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <FloatingParticles
          count={1000}
          color="#22c55e"
          className="opacity-20"
        />
      </Suspense>

      {/* Header with 3D Checkmark */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row items-center gap-6">
        <Suspense
          fallback={
            <div className="w-32 h-32 bg-muted/20 rounded-lg animate-pulse" />
          }
        >
          <div className="w-32 h-32 md:w-40 md:h-40">
            <TaskCheckmark3D />
          </div>
        </Suspense>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-primary" />
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete tasks to earn bonus VersePoints
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {tasks?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {tasks?.reduce((sum, t) => sum + t.points_reward, 0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total VP</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4 text-center grid grid-cols-2">
            <div>
              <p className="text-2xl font-bold text-green-500">
                {completedTaskIds.size}
              </p>
              <p className="text-xs text-muted-foreground">Completed Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {noOfPendingTask}
              </p>
              <p className="text-xs text-muted-foreground">Pending Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="relative z-10 space-y-4">
        {tasks?.map((task) => {
          const status = getTaskStatus(task.id);
          const isCompleted = status === "verified" || status === "completed";
          const isPending = status === "pending";
          const isSpecialTask =
            task.task_type === "referral" ||
            task.title.toLowerCase().includes("profile") ||
            task.title.toLowerCase().includes("complete");

          return (
            <Card
              key={task.id}
              className={cn(
                "bg-card/90 backdrop-blur-sm border-border transition-all",
                isCompleted && "opacity-60 bg-green-500/5 border-green-500/20"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {getTaskIcon(task.task_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {task.title}
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          <Gift className="w-3 h-3" />+{task.points_reward} VP
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {task.task_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {isCompleted ? (
                      <Button
                        disabled
                        variant="outline"
                        className="gap-2 bg-green-500/10 border-green-500/30"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Completed
                      </Button>
                    ) : isPending ? (
                      <Button
                        disabled
                        variant="outline"
                        className="gap-2 bg-yellow-500/10 border-yellow-500/30"
                      >
                        <Clock className="w-4 h-4 text-yellow-500" />
                        Pending
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleStartTask(task)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      >
                        {isSpecialTask ? "Go" : "Start"}
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!tasks || tasks.length === 0) && (
          <Card className="bg-card/90 backdrop-blur-sm border-border">
            <CardContent className="p-12 text-center">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No tasks available</p>
              <p className="text-sm text-muted-foreground">
                Check back later for new tasks!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Card */}
      <Card className="relative z-10 bg-primary/5 backdrop-blur-sm border-primary/20 mt-8">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">
            How Tasks Work
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Complete tasks to earn bonus VersePoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Click "Start" to open the task link</p>
          <p>• Complete the action (follow, subscribe, join, etc.)</p>
          <p>• Submit proof (screenshot or profile link)</p>
          <p>• Points are awarded after admin verification</p>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Submit Task Completion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Provide proof that you completed: {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="proof" className="text-foreground">
                Proof URL or Screenshot Link
              </Label>
              <Input
                id="proof"
                placeholder="https://twitter.com/yourprofile or imgur.com/screenshot"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="bg-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Provide a link to your profile, screenshot (uploaded to
                imgur.com), or any proof of completion
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitProof}
                disabled={isSubmitting || !proofUrl.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
              <Button
                onClick={() => setSelectedTask(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {activeYouTubeTask && (
        <Dialog open onOpenChange={() => setActiveYouTubeTask(null)}>
          <DialogContent className="max-w-4xl bg-card border-border">
            <DialogHeader>
              <DialogTitle>Watch Video to Complete Task</DialogTitle>
              <DialogDescription>
                Watch at least 90% of the video to earn points
              </DialogDescription>
            </DialogHeader>

            <YouTubeTaskPlayer
              videoId={activeYouTubeTask.videoId}
              taskId={activeYouTubeTask.taskId}
              requiredWatchPercentage={90}
              onComplete={(data) => {
                setActiveYouTubeTask(null);
                toast.success("Task completed successfully");
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
