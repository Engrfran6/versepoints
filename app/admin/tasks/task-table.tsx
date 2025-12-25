"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

import {toast} from "sonner";
import TaskForm from "@/components/admin/task-form";

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
  status: "active" | "disabled";
}

export default function TasksTable({tasks}: {tasks: AdminTask[]}) {
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/admin/tasks/delete", {
      method: "POST",
      body: JSON.stringify({id}),
    });

    console.log("delete response", res);

    res.ok ? toast.success("Task deleted") : toast.error("Failed");
  };

  const handleToggle = async (task: AdminTask) => {
    const res = await fetch("/api/admin/tasks/toggle", {
      method: "POST",
      body: JSON.stringify({
        taskId: task.id,
        status: task.status === "active" ? "disabled" : "active",
      }),
    });

    res.ok ? toast.success("Task updated") : toast.error("Failed");
  };

  return (
    <>
      <Button className="mb-4" onClick={() => setEditingTask({} as AdminTask)}>
        + Create Task
      </Button>

      <div className="space-y-3">
        {tasks.map((task) => (
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
                <Badge variant={task.status === "active" ? "default" : "secondary"}>
                  {task.status}
                </Badge>

                <Button size="sm" variant="outline" onClick={() => handleToggle(task)}>
                  {task.status === "active" ? "Disable" : "Enable"}
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

      {editingTask && <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />}
    </>
  );
}
