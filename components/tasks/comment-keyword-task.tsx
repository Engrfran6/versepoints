"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Copy, ExternalLink, CheckCircle2 } from "lucide-react"

interface CommentKeywordTaskProps {
  taskId: string
  platform: "instagram" | "tiktok" | "facebook"
  postUrl: string
  keyword: string
  onComplete: (verificationData: Record<string, unknown>) => void
}

export function CommentKeywordTask({ taskId, platform, postUrl, keyword, onComplete }: CommentKeywordTaskProps) {
  const [username, setUsername] = useState("")
  const [commentUrl, setCommentUrl] = useState("")

  const handleCopyKeyword = () => {
    navigator.clipboard.writeText(keyword)
    toast.success("Keyword copied to clipboard!")
  }

  const handleSubmit = () => {
    if (!username.trim() || !commentUrl.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    onComplete({
      platform,
      username: username.trim(),
      commentUrl: commentUrl.trim(),
      keyword,
      submittedAt: new Date().toISOString(),
    })

    toast.success("Task submitted for manual review")
  }

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="text-lg capitalize">{platform} Comment Task</CardTitle>
        <CardDescription>Comment on our post with the special keyword</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1 */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
          <p className="text-sm font-medium text-foreground">Step 1: Visit Our Post</p>
          <Button
            onClick={() => window.open(postUrl, "_blank")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open {platform} Post
          </Button>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
          <p className="text-sm font-medium text-foreground">Step 2: Copy Keyword</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono text-foreground">{keyword}</code>
            <Button
              onClick={handleCopyKeyword}
              variant="outline"
              size="sm"
              className="gap-2 border-border bg-transparent"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Include this keyword in your comment</p>
        </div>

        {/* Step 3 */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Step 3: Submit Proof</p>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs text-muted-foreground">
              Your {platform} username
            </Label>
            <Input
              id="username"
              placeholder={`@yourusername`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment-url" className="text-xs text-muted-foreground">
              Link to your comment (optional but helps verification)
            </Label>
            <Input
              id="comment-url"
              placeholder="https://..."
              value={commentUrl}
              onChange={(e) => setCommentUrl(e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!username.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Submit for Manual Review
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          This task requires manual review by our team. Points will be awarded after verification.
        </p>
      </CardContent>
    </Card>
  )
}
