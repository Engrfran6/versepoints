"use client";

import {Suspense, useState} from "react";
import dynamic from "next/dynamic";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {CheckSquare} from "lucide-react";
import {cn, extractYouTubeVideoId} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {YouTubeTaskPlayer} from "@/components/tasks/youtube-task-player";
import {TaskType} from "@/app/admin/tasks/task-table";
import {TaskCard} from "./motion-card";
import {AnimatePresence} from "framer-motion";
import {TaskCardSkeleton} from "../../../components/skeleton/task-card-skeleton";
import {useTasks, useUserTasks} from "@/lib/hooks/useTask";
import {useQueryClient} from "@tanstack/react-query";

const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  {ssr: false}
);
const TaskCheckmark3D = dynamic(
  () => import("@/components/3d/task-checkmark-3d").then((mod) => mod.TaskCheckmark3D),
  {
    ssr: false,
  }
);

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: TaskType;
  points_reward: number;
  action_url: string | null;
  is_active: boolean;
  verification_type: string;
  status: string;
}

interface TasksContentProps {
  userId: string;
}

export function TasksContent({userId}: TasksContentProps) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeYouTubeTask, setActiveYouTubeTask] = useState<{
    taskId: string;
    videoId: string;
  } | null>(null);
  const [youtubeProgress, setYoutubeProgress] = useState(0);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const queryClient = useQueryClient();

  const {data: tasks = [], isLoading: tasksLoading} = useTasks();
  const {data: userTasks = [], isLoading: userTasksLoading} = useUserTasks(userId);

  if (tasksLoading || userTasksLoading) {
    return (
      <div className="space-y-4 px-4 pt-16">
        {Array.from({length: 6}).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const completedTaskIds = new Set(userTasks?.map((ut: any) => ut.task_id) || []);

  const openExternalAndCollectProof = (task: Task) => {
    if (!task.action_url) {
      toast.error("No action link provided");
      return;
    }

    window.open(task.action_url, "_blank");

    setTimeout(() => {
      setSelectedTask(task);
    }, 800);
  };

  type TaskHandler = (task: Task) => void;

  const TASK_HANDLERS: Record<TaskType, TaskHandler> = {
    "mine verse points": (task) => {
      router.push("/dashboard");
      toast.info(`You will earn ${task.points_reward} VP when you mine for the first time`);
    },

    referral: () => {
      router.push("/dashboard/referrals");
      toast.info("Share your referral link to complete this task");
    },

    "complete profile": () => {
      router.push("/dashboard/settings");
      toast.info("Complete your profile to earn points");
    },

    "watch youtube video": (task) => {
      if (!task.action_url) {
        toast.error("Missing YouTube link");
        return;
      }

      const videoId = extractYouTubeVideoId(task.action_url);

      if (!videoId) {
        toast.error("Invalid YouTube link");
        return;
      }

      setActiveYouTubeTask({
        taskId: task.id,
        videoId,
      });
    },

    // 👇 All “open + submit proof” tasks
    "follow on social media": openExternalAndCollectProof,
    "join community": openExternalAndCollectProof,
    "share content": openExternalAndCollectProof,
    "complete survey": openExternalAndCollectProof,
    "app download": openExternalAndCollectProof,
    "content creation": openExternalAndCollectProof,
    "daily check-in": openExternalAndCollectProof,
    others: openExternalAndCollectProof,
  };

  const handleStartTask = (task: Task) => {
    if (completedTaskIds.has(task.id)) {
      toast.info("You already completed this task");
      return;
    }

    const handler = TASK_HANDLERS[task.task_type];

    if (!handler) {
      toast.error(`No handler defined for task type: ${task.task_type}`);
      return;
    }

    handler(task);
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
        headers: {"Content-Type": "application/json"},
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
      await queryClient.invalidateQueries({queryKey: ["tasks"]});
      await queryClient.invalidateQueries({queryKey: ["userTasks", userId]});
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitYouTubeTask = async (taskId: string) => {
    try {
      const response = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          taskId,
          proofUrl: `https://www.youtube.com/watch?v=${activeYouTubeTask?.videoId}`,
          verificationType: "youtube",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit YouTube task");
      }

      toast.success("YouTube task completed!");
      await queryClient.invalidateQueries({queryKey: ["tasks"]});
      await queryClient.invalidateQueries({queryKey: ["userTasks", userId]});
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
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
    const userTask = userTasks?.find((ut: any) => ut.task_id === taskId);
    if (!userTask) return null;
    return userTask.status;
  };

  const noOfPendingTask = userTasks?.filter((ut: any) => ut.status === "pending");
  const noOfVerifiedTask = userTasks?.filter((ut: any) => ut.status === "verified");

  function StatusButton({
    icon: Icon,
    label,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    color: "green" | "yellow" | "red";
  }) {
    const styles = {
      green: "bg-green-500/10 border-green-500/30 text-green-500",
      yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
      red: "bg-red-500/10 border-red-500/30 text-red-500",
    };

    return (
      <Button disabled variant="outline" className={cn("gap-2", styles[color])}>
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "relative p-4 md:p-8 min-h-screen transition-all duration-300",
        activeYouTubeTask && "blur-sm pointer-events-none select-none"
      )}>
      {/* 3D Background */}
      <Suspense fallback={null}>
        <FloatingParticles count={1000} color="#22c55e" className="opacity-20" />
      </Suspense>
      {/* Header with 3D Checkmark */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row items-center gap-6">
        <Suspense fallback={<div className="w-32 h-32 bg-muted/20 rounded-lg animate-pulse" />}>
          <div className="w-32 h-32 md:w-40 md:h-40">
            <TaskCheckmark3D />
          </div>
        </Suspense>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-primary" />
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">Complete tasks to earn bonus VersePoints</p>
        </div>
      </div>
      {/* Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{tasks?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Available Task</p>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {tasks?.reduce((sum: any, t: any) => sum + t.points_reward, 0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total Task VP</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4 text-center grid grid-cols-3">
            <div>
              <p className="text-2xl font-bold text-blue-400">{completedTaskIds.size}</p>
              <p className="text-xs text-muted-foreground">Completed Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{noOfVerifiedTask?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Approved Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{noOfPendingTask?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Pending Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Tasks List */}

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {tasks.map((task: Task) => {
            const status = getTaskStatus(task.id);
            const isCompleted = status === "verified";
            const isPending = status === "pending";
            const isPaused = task.status === "paused" && !isCompleted && !isPending;

            const isSpecialTask =
              task.task_type === "referral" ||
              task.title.toLowerCase().includes("profile") ||
              task.title.toLowerCase().includes("complete");

            return (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={isCompleted}
                isPending={isPending}
                isPaused={isPaused}
                isSpecialTask={isSpecialTask}
                handleStartTask={handleStartTask}
                getTaskIcon={getTaskIcon}
              />
            );
          })}
        </div>
      </AnimatePresence>

      {/* Info Card */}
      <Card className="relative z-10 bg-primary/5 backdrop-blur-sm border-primary/20 mt-8">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">How Tasks Work</CardTitle>
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
            <DialogTitle className="text-foreground">Submit Task Completion</DialogTitle>
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
                Provide a link to your profile, screenshot (uploaded to imgur.com), or any proof of
                completion
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitProof}
                disabled={isSubmitting || !proofUrl.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
              <Button onClick={() => setSelectedTask(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {activeYouTubeTask && (
        <Dialog
          open
          onOpenChange={(open) => {
            // User is trying to close the dialog
            if (!open && youtubeProgress < 90) {
              setConfirmExitOpen(true);
              return;
            }

            // Safe to close (completed)
            setActiveYouTubeTask(null);
            setYoutubeProgress(0);
          }}>
          <DialogContent
            className="max-w-4xl bg-card border-border"
            onPointerDownOutside={(e) => {
              if (youtubeProgress < 90) {
                e.preventDefault();
                setConfirmExitOpen(true);
              }
            }}
            onEscapeKeyDown={(e) => {
              if (youtubeProgress < 90) {
                e.preventDefault();
                setConfirmExitOpen(true);
              }
            }}>
            <DialogHeader>
              <DialogTitle>Watch Video to Complete Task</DialogTitle>
              <DialogDescription>Watch at least 90% of the video to earn points</DialogDescription>
            </DialogHeader>

            <YouTubeTaskPlayer
              videoId={activeYouTubeTask.videoId}
              taskId={activeYouTubeTask.taskId}
              requiredWatchPercentage={90}
              onProgress={(p) => setYoutubeProgress(p)}
              onComplete={async () => {
                setActiveYouTubeTask(null);
                setYoutubeProgress(0);
                submitYouTubeTask(activeYouTubeTask.taskId);
                toast.success("Task completed successfully");
                await queryClient.invalidateQueries({queryKey: ["tasks"]});
                await queryClient.invalidateQueries({queryKey: ["userTasks", userId]});
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Leave task early?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You haven’t completed this task yet.
              <br />
              If you exit now, you will earn <strong>0 points</strong> for this task.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-4">
            <Button className="flex-1" onClick={() => setConfirmExitOpen(false)}>
              Continue Watching
            </Button>

            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setConfirmExitOpen(false);
                setActiveYouTubeTask(null);
                setYoutubeProgress(0);
                toast.info("You exited early — no points awarded");
              }}>
              Exit Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
