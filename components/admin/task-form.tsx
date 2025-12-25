"use client";

import {useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {toast} from "sonner";
import type {AdminTask, TaskType, PlatformType} from "@/app/admin/tasks/task-table";

// Define task types and platforms as arrays
const TASK_TYPES: TaskType[] = [
  "complete profile",
  "referral",
  "watch youtube video",
  "follow on social media",
  "join community",
  "share content",
  "complete survey",
  "daily check-in",
  "app download",
  "content creation",
  "mine verse points",
  "others",
];

const PLATFORMS: PlatformType[] = [
  "twitter",
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "discord",
  "telegram",
  "reddit",
  "pinterest",
  "snapchat",
  "whatsapp",
  "issued by verse estate",
  "other",
];

export default function TaskForm({
  task,
  onClose,
}: // onSaved,
{
  task: Partial<AdminTask>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    ...task,
    starts_at: task.starts_at ? task.starts_at.split("T")[0] : "",
    ends_at: task.ends_at ? task.ends_at.split("T")[0] : "",
  });

  const save = async () => {
    const payload = {
      ...form,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };

    const res = await fetch("/api/admin/tasks/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error("Failed to save task");
      return;
    }

    toast.success("Task saved");
    // onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{task.id ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Follow us on Twitter"
              value={form.title ?? ""}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe what the user needs to do"
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
          </div>

          {/* Points + Task Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Points Reward</Label>
              <Input
                type="number"
                placeholder="100"
                value={form.points_reward ?? ""}
                onChange={(e) => setForm({...form, points_reward: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1">
              <Label>Task Type</Label>
              <Select
                value={form.task_type ?? TASK_TYPES[0]}
                onValueChange={(value) => setForm({...form, task_type: value as TaskType})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform + URL (only for 'others' type) */}
          {form.task_type !== "referral" && form.task_type !== "complete profile" && (
            <div className="rounded-lg border p-4 space-y-4 bg-muted/30">
              <div className="space-y-1">
                <Label>Social platform</Label>
                <Select
                  value={form.platform ?? ""}
                  onValueChange={(value) => setForm({...form, platform: value as PlatformType})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Action URL</Label>
                <Input
                  placeholder="https://..."
                  value={form.action_url ?? ""}
                  onChange={(e) => setForm({...form, action_url: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Start + End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Task Starts at</Label>
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) =>
                  setForm({
                    ...form,
                    starts_at: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Task Ends at</Label>
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ends_at: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button onClick={save} className="flex-1">
              Save Task
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
