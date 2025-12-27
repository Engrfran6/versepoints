"use client";

import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Plus, Edit, Trash2, Package} from "lucide-react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {NFT_TIER_COLORS} from "@/lib/constants";
import {cn} from "@/lib/utils";
import type {NFTCatalog, NFTTier} from "@/lib/types/phase2";

export function AdminNFTsContent({nftCatalog}: {nftCatalog: NFTCatalog[]}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingNFT, setEditingNFT] = useState<NFTCatalog | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tier: "basic" as NFTTier,
    mining_boost: 0,
    vp_cost: 1000,
    max_supply: 100,
    required_rank: "rookie",
    special_effect: "",
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/admin/nfts/save", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...formData, id: editingNFT?.id}),
      });

      if (!response.ok) throw new Error("Failed to save NFT");

      toast.success(editingNFT ? "NFT updated" : "NFT created");
      setIsCreating(false);
      setEditingNFT(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this NFT?")) return;

    try {
      const response = await fetch("/api/admin/nfts/delete", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id}),
      });

      if (!response.ok) throw new Error("Failed to delete NFT");

      toast.success("NFT deleted");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              NFT Catalog Management
            </CardTitle>
            <Button disabled onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create NFT
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nftCatalog.map((nft) => {
              const tierColors = NFT_TIER_COLORS[nft.tier as NFTTier];
              return (
                <div
                  key={nft.id}
                  className={cn("p-4 rounded-lg border", tierColors.bg, tierColors.border)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {nft.tier === "legendary"
                          ? "⚡"
                          : nft.tier === "diamond"
                          ? "💎"
                          : nft.tier === "gold"
                          ? "🏆"
                          : nft.tier === "silver"
                          ? "🔧"
                          : "⛏️"}
                      </span>
                      <div>
                        <p className="font-bold text-foreground">{nft.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {nft.tier} • +{nft.mining_boost}% boost • {nft.vp_cost.toLocaleString()}{" "}
                          VP
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingNFT(nft);
                          setFormData(nft as any);
                          setIsCreating(true);
                        }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        disabled
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(nft.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isCreating}
        onOpenChange={(open) => {
          setIsCreating(open);
          if (!open) setEditingNFT(null);
        }}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNFT ? "Edit NFT" : "Create NFT"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>NFT Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tier</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) => setFormData({...formData, tier: value as NFTTier})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Required Rank</Label>
                <Select
                  value={formData.required_rank}
                  onValueChange={(value) => setFormData({...formData, required_rank: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rookie">Rookie</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="citizen">Citizen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Mining Boost %</Label>
                <Input
                  type="number"
                  value={formData.mining_boost}
                  onChange={(e) =>
                    setFormData({...formData, mining_boost: Number.parseInt(e.target.value)})
                  }
                />
              </div>
              <div>
                <Label>VP Cost</Label>
                <Input
                  type="number"
                  value={formData.vp_cost}
                  onChange={(e) =>
                    setFormData({...formData, vp_cost: Number.parseInt(e.target.value)})
                  }
                />
              </div>
              <div>
                <Label>Max Supply</Label>
                <Input
                  type="number"
                  value={formData.max_supply || ""}
                  onChange={(e) =>
                    setFormData({...formData, max_supply: Number.parseInt(e.target.value) || null})
                  }
                />
              </div>
            </div>
            <div>
              <Label>Special Effect</Label>
              <Input
                value={formData.special_effect || ""}
                onChange={(e) => setFormData({...formData, special_effect: e.target.value})}
                placeholder="e.g., 2x streak protection"
              />
            </div>
            <div className="flex gap-2">
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
