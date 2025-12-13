"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2 } from "lucide-react"

interface ReferralLinkProps {
  referralCode: string
}

export function ReferralLink({ referralCode }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false)

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/sign-up?ref=${referralCode}`
      : `https://versepoints.com/auth/sign-up?ref=${referralCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join VersePoints",
        text: "Start mining VersePoints and earn rewards!",
        url: referralUrl,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Your Referral Link
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Share this link to earn bonus points when friends sign up
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input value={referralUrl} readOnly className="bg-input border-border text-foreground font-mono text-sm" />
          <Button onClick={handleCopy} variant="outline" className="px-3 bg-transparent">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button onClick={handleShare} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Share
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Your code: <span className="font-mono font-bold text-primary">{referralCode}</span>
        </p>
      </CardContent>
    </Card>
  )
}
