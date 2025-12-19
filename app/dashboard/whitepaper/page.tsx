import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function WhitepaperPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">VersePoints Whitepaper</h1>
          <p className="text-muted-foreground">Complete project documentation and roadmap</p>
        </div>
      </div>

      <Card className="p-8">
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
          <p className="text-muted-foreground mb-6">
            VersePoints is a revolutionary Web2-to-Web3 mining platform that rewards users with points through daily
            mining activities, referrals, and task completion. The platform features a comprehensive ranking system, NFT
            marketplace, and a 12-phase roadmap leading to full blockchain integration.
          </p>

          <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
          <p className="text-muted-foreground mb-6">
            VersePoints combines gamification with cryptocurrency mechanics to create an engaging user experience. Users
            earn VersePoints (VP) through various activities and can eventually convert them to tokens when the platform
            migrates to blockchain.
          </p>

          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
            <li>Daily Mining System with 24-hour cooldown (100 VP per mine)</li>
            <li>Welcome Bonus: 1,000 VP for new users</li>
            <li>Streak Mining System with multipliers up to 3x</li>
            <li>5-Tier Ranking System (Rookie to Citizen)</li>
            <li>NFT Marketplace with mining boosts</li>
            <li>Referral Program with ongoing rewards</li>
            <li>Task System for bonus points</li>
            <li>Anti-Bot Security with device fingerprinting</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">Tokenomics (Phase 2)</h2>
          <p className="text-muted-foreground mb-6">
            The platform will migrate to blockchain technology in later phases, converting VersePoints to native tokens.
            Details on token distribution, supply, and utility will be announced as we approach Phase 6 (Token Launch).
          </p>

          <h2 className="text-2xl font-bold mb-4">12-Phase Roadmap</h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Phase 1: Foundation</h3>
              <p>Web2 platform launch with core mining and referral features</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Phase 2: NFT Integration</h3>
              <p>Launch NFT marketplace with mining boosts and exclusive rewards</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Phase 3: Community Growth</h3>
              <p>Expand user base and implement advanced social features</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Phase 4: Gamification</h3>
              <p>Add achievements, leaderboard competitions, and mini-games</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Phase 5: Partnerships</h3>
              <p>Strategic partnerships with blockchain projects and exchanges</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Phase 6: Token Launch</h3>
              <p>Deploy smart contracts and launch native token</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 mt-8">Security & Anti-Fraud</h2>
          <p className="text-muted-foreground mb-6">
            VersePoints implements multiple layers of security including IP rate limiting, device fingerprinting,
            behavioral analysis, and comprehensive audit logging to prevent bot abuse and ensure fair distribution of
            rewards.
          </p>

          <h2 className="text-2xl font-bold mb-4">Community & Support</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Telegram: https://t.me/VerseEstate001</li>
            <li>YouTube: https://youtube.com/@verseestate001</li>
            <li>TikTok: https://www.tiktok.com/@verseestate5</li>
            <li>Instagram: https://www.instagram.com/verse_estate</li>
            <li>Discord: https://discord.gg/2RtpUKYt</li>
            <li>WhatsApp: https://whatsapp.com/channel/0029VbBlIG7CXC3SvpwBTF2U</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
