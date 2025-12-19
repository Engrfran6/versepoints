export interface User {
  id: string
  email: string
  username: string
  referral_code: string
  referred_by: string | null
  points_balance: number
  total_mined: number
  total_referral_earnings: number
  mining_count: number
  last_mining_at: string | null
  current_streak: number
  longest_streak: number
  streak_updated_at: string | null
  status: "active" | "suspended" | "banned"
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface MiningSession {
  id: string
  user_id: string
  points_earned: number
  ip_address: string | null
  user_agent: string | null
  fingerprint_hash: string | null
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  signup_bonus_paid: boolean
  first_mining_bonus_paid: boolean
  status: "pending" | "active" | "invalid"
  created_at: string
}

export interface ReferralEarning {
  id: string
  user_id: string
  referral_id: string
  referred_user_id: string
  points_earned: number
  earning_type: "signup" | "mining" | "bonus"
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  points_reward: number
  task_type:
    | "social"
    | "daily"
    | "special"
    | "referral"
    | "complete_profile"
    | "watch_video"
    | "comment_keyword"
    | "join_telegram"
    | "screenshot_proof"
    | "visit_link"
  platform: "youtube" | "instagram" | "tiktok" | "facebook" | "telegram" | "whatsapp" | "other"
  action_url: string | null
  verification_type: "manual" | "auto" | "admin"
  verification_method: "auto" | "semi_auto" | "manual"
  status: "draft" | "active" | "paused" | "expired"
  max_completions: number
  max_completions_per_user: number
  budget_limit: number
  spent_amount: number
  config: Record<string, unknown>
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_by: string | null
  created_at: string
}

export interface TaskSubmission {
  id: string
  user_id: string
  task_id: string
  status: "pending" | "completed" | "verified" | "rejected"
  proof_url: string | null
  proof_data: Record<string, unknown>
  points_awarded: number
  fraud_score: number
  completed_at: string | null
  verified_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  username: string
  points_balance: number
  mining_count: number
  created_at: string
  rank: number
}

export interface DeviceFingerprint {
  id: string
  user_id: string
  fingerprint_hash: string
  browser_info: Record<string, unknown> | null
  first_seen: string
  last_seen: string
  is_trusted: boolean
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface TaskAnalytics {
  task_id: string
  impressions: number
  starts: number
  completions: number
  approvals: number
  rejections: number
  total_cost: number
  updated_at: string
}

export interface UserRiskProfile {
  user_id: string
  fraud_score: number
  device_hash: string | null
  ip_hash: string | null
  flagged: boolean
  flag_reason: string | null
  submission_count: number
  rejection_count: number
  approval_count: number
  created_at: string
  updated_at: string
}

export interface YoutubeVerification {
  id: string
  submission_id: string
  video_id: string
  watch_duration: number
  required_duration: number
  playback_rate: number
  tab_switches: number
  verification_data: Record<string, unknown>
  verified: boolean
  created_at: string
  updated_at: string
}

export interface TelegramVerification {
  id: string
  submission_id: string
  telegram_username: string | null
  chat_id: string | null
  membership_verified: boolean
  verification_data: Record<string, unknown>
  created_at: string
}
