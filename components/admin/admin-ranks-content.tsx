"use client";

import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Plus, Edit, Trash2, Crown} from "lucide-react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {RankBadge} from "@/components/rank/rank-badge";
import {RANK_COLORS} from "@/lib/constants";
import {cn} from "@/lib/utils";
import type {RankConfig, RankName} from "@/lib/types/phase2";

export function AdminRanksContent({rankConfigs}: {rankConfigs: RankConfig[]}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRank, setEditingRank] = useState<RankConfig | null>(null);

  const [formData, setFormData] = useState({
    rank_name: "rookie",
    points_threshold: 1000,
    referrals_required: 3,
    mining_boost: 0,
    referral_bonus_multiplier: 1,
    daily_mining_reward: 10000,
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/admin/ranks/save", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...formData, id: editingRank?.id}),
      });

      if (!res.ok) throw new Error("Failed to save rank");

      toast.success(editingRank ? "Rank updated" : "Rank created");
      setIsCreating(false);
      setEditingRank(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rank?")) return;

    try {
      const res = await fetch("/api/admin/ranks/delete", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id}),
      });

      if (!res.ok) throw new Error("Failed to delete rank");

      toast.success("Rank deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <>
      {/* ===== Rank List ===== */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Rank Configurations
          </CardTitle>

          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Rank
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {rankConfigs.map((config) => {
            const colors = RANK_COLORS[config.rank_name as RankName];

            return (
              <div
                key={config.id}
                className={cn("rounded-lg border p-4", colors.bg, colors.border)}>
                {/* Top row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <RankBadge rank={config.rank_name as RankName} size="sm" showLabel={false} />

                    <div>
                      <p className={cn("font-bold uppercase", colors.text)}>{config.rank_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {config.points_threshold.toLocaleString()} VP • {config.referrals_required}{" "}
                        referrals
                      </p>

                      {/* Stats */}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span>
                          <span className="text-muted-foreground">Boost:</span>{" "}
                          <span className={colors.text}>+{config.mining_boost}%</span>
                        </span>

                        <span>
                          <span className="text-muted-foreground">Referral:</span>{" "}
                          <span className={colors.text}>x{config.referral_bonus_multiplier}</span>
                        </span>

                        <span>
                          <span className="text-muted-foreground">Daily:</span>{" "}
                          <span className={colors.text}>{config.daily_mining_reward} VP</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:self-start">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRank(config);
                        setFormData(config as any);
                        setIsCreating(true);
                      }}>
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button size="sm" variant="destructive" onClick={() => handleDelete(config.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ===== Create / Edit Dialog ===== */}
      <Dialog
        open={isCreating}
        onOpenChange={(open) => {
          setIsCreating(open);
          if (!open) setEditingRank(null);
        }}>
        <DialogContent className="max-w-lg sm:max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingRank ? "Edit Rank" : "Create Rank"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label>Rank Name</Label>
              <Input
                value={formData.rank_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rank_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Points Required</Label>
                <Input
                  type="number"
                  value={formData.points_threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points_threshold: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Referrals Required</Label>
                <Input
                  type="number"
                  value={formData.referrals_required}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referrals_required: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Mining Boost %</Label>
                <Input
                  type="number"
                  value={formData.mining_boost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mining_boost: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Referral Multiplier</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.referral_bonus_multiplier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referral_bonus_multiplier: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Daily Reward</Label>
                <Input
                  type="number"
                  value={formData.daily_mining_reward}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_mining_reward: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleSubmit} className="flex-1">
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
