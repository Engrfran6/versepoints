"use client";

import {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {CheckCircle2, XCircle, Eye, AlertTriangle, ExternalLink, Clock} from "lucide-react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

interface TaskSubmission {
  id: string;
  status: string;
  proof_url: string | null;
  proof_data: any;
  fraud_score: number;
  completed_at: string;
  created_at: string;
  users: {
    id: string;
    username: string;
    email: string;
  };
  tasks: {
    id: string;
    title: string;
    description: string;
    points_reward: number;
    platform: string;
    task_type: string;
  };
}

export function AdminTasksVerification({submissions}: {submissions: TaskSubmission[]}) {
  const router = useRouter();
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveAllDialog, setShowApproveAllDialog] = useState(false);

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const verifiedSubmissions = submissions.filter((s) => s.status === "verified");
  const rejectedSubmissions = submissions.filter((s) => s.status === "rejected");

  const handleVerify = async (submissionId: string, approved: boolean, reason?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/admin/tasks/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({submissionId, approved, reason}),
      });

      if (!response.ok) throw new Error("Failed to verify submission");

      toast.success(approved ? "Submission approved!" : "Submission rejected");
      setSelectedSubmission(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAllPending = async () => {
    if (pendingSubmissions.length === 0) return;

    setIsProcessing(true);

    try {
      await Promise.all(
        pendingSubmissions.map((submission) =>
          fetch("/api/admin/tasks/verify", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              submissionId: submission.id,
              approved: true,
            }),
          }).then((res) => {
            if (!res.ok) throw new Error("Failed to approve one or more submissions");
          })
        )
      );

      toast.success(`${pendingSubmissions.length} submissions approved`);
      setShowApproveAllDialog(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Bulk approval failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const SubmissionCard = ({submission}: {submission: TaskSubmission}) => (
    <Card className="bg-card/90 border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground">{submission.tasks.title}</h4>
              {submission.fraud_score > 50 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  High Risk
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {submission.users.username} • {submission.users.email}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="capitalize">{submission.tasks.platform}</span>
              <span>+{submission.tasks.points_reward} VP</span>
              <span>{new Date(submission.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedSubmission(submission)}
              className="gap-2">
              <Eye className="w-4 h-4" />
              Review
            </Button>
            {submission.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleVerify(submission.id, true)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleVerify(submission.id, false)}
                  disabled={isProcessing}
                  className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Task Verification Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            Review and approve user task submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4" />
                Pending ({pendingSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Approved ({verifiedSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="w-4 h-4" />
                Rejected ({rejectedSubmissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingSubmissions.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowApproveAllDialog(true)}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Approve All Pending
                  </Button>
                </div>
              )}

              {pendingSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}

              {pendingSubmissions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pending submissions</p>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-3">
              {verifiedSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
              {verifiedSubmissions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No approved submissions</p>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-3">
              {rejectedSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
              {rejectedSubmissions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No rejected submissions</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submission Review Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Review Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Task Details */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Task</h4>
                <p className="text-sm text-foreground">{selectedSubmission.tasks.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedSubmission.tasks.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedSubmission.tasks.platform}</Badge>
                  <Badge variant="outline">{selectedSubmission.tasks.task_type}</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary">
                    +{selectedSubmission.tasks.points_reward} VP
                  </Badge>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">User</h4>
                <p className="text-sm text-foreground">{selectedSubmission.users.username}</p>
                <p className="text-xs text-muted-foreground">{selectedSubmission.users.email}</p>
                {selectedSubmission.fraud_score > 0 && (
                  <Badge
                    variant={selectedSubmission.fraud_score > 50 ? "destructive" : "secondary"}
                    className="mt-2">
                    Fraud Score: {selectedSubmission.fraud_score}
                  </Badge>
                )}
              </div>

              {/* Proof */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Proof Submitted</h4>
                {selectedSubmission.proof_url && (
                  <a
                    href={selectedSubmission.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline text-sm">
                    <ExternalLink className="w-4 h-4" />
                    View Proof Link
                  </a>
                )}
                {selectedSubmission.proof_data &&
                  Object.keys(selectedSubmission.proof_data).length > 0 && (
                    <pre className="bg-muted/30 p-3 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(selectedSubmission.proof_data, null, 2)}
                    </pre>
                  )}
              </div>

              {/* Actions */}
              {selectedSubmission.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleVerify(selectedSubmission.id, true)}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Submission
                  </Button>
                  <Button
                    onClick={() =>
                      handleVerify(selectedSubmission.id, false, "Does not meet requirements")
                    }
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1 gap-2">
                    <XCircle className="w-4 h-4" />
                    Reject Submission
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showApproveAllDialog} onOpenChange={setShowApproveAllDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirm Bulk Approval
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Hope you have verified all submissions before approval.
            <br />
            This action will approve <strong>all pending submissions</strong> and cannot be undone.
          </p>

          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowApproveAllDialog(false)}
              disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleApproveAllPending}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Yes, Approve All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
