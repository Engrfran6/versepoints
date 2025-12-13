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
  task_type: "social" | "daily" | "special" | "referral"
  action_url: string | null
  verification_type: "manual" | "auto" | "admin"
  max_completions: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface UserTask {
  id: string
  user_id: string
  task_id: string
  status: "pending" | "completed" | "verified" | "rejected"
  proof_url: string | null
  points_awarded: number
  completed_at: string | null
  verified_at: string | null
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
