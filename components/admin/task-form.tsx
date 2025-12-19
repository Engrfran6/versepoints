"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AdminTask } from "@/app/admin/tasks/task-table";

export default function TaskForm({
  task,
  onClose,
  onSaved,
}: {
  task: Partial<AdminTask>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(task);

  const save = async () => {
    const res = await fetch("/api/admin/tasks/create", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      toast.error("Failed to create task");
      return;
    }

    toast.success("Task saved");
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.id ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            className="input"
            placeholder="Title"
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="textarea"
            placeholder="Description"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="number"
            className="input"
            placeholder="Points"
            value={form.points_reward ?? ""}
            onChange={(e) =>
              setForm({ ...form, points_reward: Number(e.target.value) })
            }
          />

          <select
            className="select"
            value={form.task_type ?? "manual"}
            onChange={(e) =>
              setForm({ ...form, task_type: e.target.value as any })
            }
          >
            <option value="manual">Manual</option>
            <option value="referral">Referral</option>
            <option value="auto">Auto</option>
          </select>

          {form.task_type === "manual" && (
            <>
              <select
                className="select"
                value={form.platform ?? ""}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value as any })
                }
              >
                <option value="">Select platform</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="telegram">Telegram</option>
              </select>

              <input
                className="input"
                placeholder="Action URL"
                value={form.action_url ?? ""}
                onChange={(e) =>
                  setForm({ ...form, action_url: e.target.value })
                }
              />
            </>
          )}

          <Button onClick={save} className="w-full">
            Save Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
