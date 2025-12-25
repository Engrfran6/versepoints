"use client";

import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {UserPlus, Search, Ban, CheckCircle2, XCircle, Pickaxe} from "lucide-react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

interface Referral {
  id: string;
  status: string;
  signup_bonus_paid: boolean;
  first_mining_bonus_paid: boolean;
  created_at: string;
  referrer: {id: string; username: string; email: string; points_balance: number};
  referred: {
    id: string;
    username: string;
    email: string;
    points_balance: number;
    created_at: string;
    mining_count: number;
  };
}

export function AdminReferralsContent({referrals}: {referrals: Referral[]}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch =
      ref.referrer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referrer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referred.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || ref.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (referralId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/referrals/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({referralId, status: newStatus}),
      });

      if (!response.ok) throw new Error("Failed to update referral");

      toast.success(`Referral marked as ${newStatus}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const stats = {
    total: referrals.length,
    active: referrals.filter((r) => r.status === "active").length,
    pending: referrals.filter((r) => r.status === "pending").length,
    invalid: referrals.filter((r) => r.status === "invalid").length,
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Pickaxe className="w-8 h-8 text-primary" />
          Referrals Activity
        </h1>
        <p className="text-muted-foreground mt-1">Monitor referral activity</p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-500">{stats.invalid}</div>
            <p className="text-sm text-muted-foreground">Invalid</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            All Referrals ({filteredReferrals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReferrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        referral.status === "active"
                          ? "default"
                          : referral.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }>
                      {referral.status}
                    </Badge>
                    {referral.signup_bonus_paid && (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Signup Bonus Paid
                      </Badge>
                    )}
                    {referral.first_mining_bonus_paid && (
                      <Badge variant="outline" className="text-blue-500 border-blue-500">
                        Mining Bonus Paid
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Referrer</p>
                      <p className="font-medium text-foreground">
                        {referral.referrer.username} ({referral.referrer.email})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.referrer.points_balance} VP
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Referred User</p>
                      <p className="font-medium text-foreground">
                        {referral.referred.username} ({referral.referred.email})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.referred.mining_count} mines • {referral.referred.points_balance}{" "}
                        VP
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Referred on {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {referral.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(referral.id, "active")}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(referral.id, "invalid")}
                        className="gap-2">
                        <XCircle className="w-4 h-4" />
                        Invalidate
                      </Button>
                    </>
                  )}
                  {referral.status === "active" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUpdateStatus(referral.id, "invalid")}
                      className="gap-2">
                      <Ban className="w-4 h-4" />
                      Invalidate
                    </Button>
                  )}
                  {referral.status === "invalid" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(referral.id, "active")}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filteredReferrals.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No referrals found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
