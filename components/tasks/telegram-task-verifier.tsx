"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Send, CheckCircle2, Loader2 } from "lucide-react"

interface TelegramTaskVerifierProps {
  taskId: string
  chatId: string
  chatTitle: string
  onComplete: (verificationData: Record<string, unknown>) => void
}

export function TelegramTaskVerifier({ taskId, chatId, chatTitle, onComplete }: TelegramTaskVerifierProps) {
  const [username, setUsername] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = async () => {
    if (!username.trim()) {
      toast.error("Please enter your Telegram username")
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch("/api/tasks/verify-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          chatId,
          username: username.replace("@", ""),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Verification failed")
      }

      if (data.verified) {
        setIsVerified(true)
        toast.success("Telegram membership verified!")
        onComplete({
          telegramUsername: username,
          chatId,
          chatTitle,
          verifiedAt: new Date().toISOString(),
        })
      } else {
        toast.error("Could not verify your membership. Please make sure you joined the group/channel.")
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="text-lg">Join Telegram</CardTitle>
        <CardDescription>Join our Telegram group/channel to complete this task</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-foreground mb-2">Step 1: Join Telegram</p>
          <Button
            onClick={() => window.open(`https://t.me/${chatId}`, "_blank")}
            className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90 text-white gap-2"
          >
            <Send className="w-4 h-4" />
            Open {chatTitle}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Step 2: Enter Your Username</p>
          <Label htmlFor="telegram-username" className="text-muted-foreground text-xs">
            Your Telegram username (without @)
          </Label>
          <Input
            id="telegram-username"
            placeholder="yourusername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isVerified}
            className="bg-background border-border"
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={isVerifying || isVerified || !username.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : isVerified ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Verified!
            </>
          ) : (
            "Verify Membership"
          )}
        </Button>

        {isVerified && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-500 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Membership verified! Task completed successfully.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
