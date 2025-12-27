"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

import {toast} from "sonner";
import TaskForm from "@/components/admin/task-form";
import {cn} from "@/lib/utils";

export type TaskType =
  | "complete profile"
  | "referral"
  | "watch youtube video"
  | "follow on social media"
  | "join community"
  | "share content"
  | "complete survey"
  | "daily check-in"
  | "app download"
  | "content creation"
  | "mine verse points"
  | "others";
export type PlatformType =
  | "twitter"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "discord"
  | "telegram"
  | "reddit"
  | "pinterest"
  | "snapchat"
  | "whatsapp"
  | "issued by verse estate"
  | "other";

export interface AdminTask {
  id: string;
  title: string;
  description: string;
  points_reward: number;
  starts_at: string | null;
  ends_at: string | null;
  task_type: TaskType;
  platform?: PlatformType;
  action_url?: string | null;
  status: "active" | "paused" | "expired" | "draft";
}

export default function TasksTable({tasks}: {tasks: AdminTask[]}) {
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>(tasks);

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/admin/tasks/delete", {
      method: "POST",
      body: JSON.stringify({id}),
    });

    res.ok ? toast.success("Task deleted") : toast.error("Failed");

    const {taskId} = await res.json();

    setAdminTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleToggle = async (task: AdminTask) => {
    const res = await fetch("/api/admin/tasks/toggle", {
      method: "POST",
      body: JSON.stringify({
        taskId: task.id,
        status: task.status,
      }),
    });

    res.ok ? toast.success("Task updated") : toast.error("Failed");

    const {updatedTask} = await res.json();

    setAdminTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  return (
    <>
      <Button className="mb-4" onClick={() => setEditingTask({} as AdminTask)}>
        + Create Task
      </Button>

      <div className="space-y-3">
        {adminTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.task_type}
                  {task.platform && ` • ${task.platform}`}
                  {" • "}+{task.points_reward} VP
                </p>
              </div>

              <div className="flex gap-2">
                <Badge
                  className={cn(
                    task.status === "active"
                      ? "bg-green-500"
                      : task.status === "paused"
                      ? "bg-yellow-500"
                      : task.status === "expired"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  )}>
                  {task.status}
                </Badge>

                <Button size="sm" variant="outline" onClick={() => handleToggle(task)}>
                  {task.status === "expired"
                    ? "Expired"
                    : task.status === "active"
                    ? "Disable"
                    : "Enable"}
                </Button>

                <Button size="sm" variant="outline" onClick={() => setEditingTask(task)}>
                  Edit
                </Button>

                <Button size="sm" variant="destructive" onClick={() => handleDelete(task.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          setAdminTasks={setAdminTasks}
        />
      )}
    </>
  );
}
