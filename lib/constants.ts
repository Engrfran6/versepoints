export const MINING_CONSTANTS = {
  POINTS_PER_MINE: 10000,
  MINING_COOLDOWN_HOURS: 24,
  WELCOME_BONUS: 1000,
  REFERRAL_SIGNUP_BONUS: 50,
  REFERRAL_FIRST_MINING_BONUS: 100,
  REFERRAL_ONGOING_BONUS: 20,
  STREAK_BONUS_MULTIPLIERS: {
    3: 1.1, // 3 day streak = 10% bonus
    7: 1.25, // 7 day streak = 25% bonus
    14: 1.5, // 14 day streak = 50% bonus
    30: 2.0, // 30 day streak = 100% bonus (2x)
    60: 2.5, // 60 day streak = 150% bonus
    100: 3.0, // 100 day streak = 200% bonus (3x)
  } as Record<number, number>,
  STREAK_GRACE_HOURS: 36, // Hours before streak resets (gives 12hr grace period)
}

export const RATE_LIMITS = {
  MINING_PER_IP_HOURS: 24,
  REGISTRATIONS_PER_IP_HOUR: 5,
  API_REQUESTS_PER_MINUTE: 60,
}

export const APP_CONFIG = {
  APP_NAME: "VersePoints",
  APP_DESCRIPTION: "Mine VersePoints daily and earn rewards",
  SUPPORT_EMAIL: "support@versepoints.com",
}

export const RANK_THRESHOLDS = {
  rookie: 1000,
  silver: 50000,
  gold: 250000,
  diamond: 1000000,
  citizen: 5000000,
} as const

export const RANK_REFERRAL_REQUIREMENTS = {
  rookie: 3,
  silver: 10,
  gold: 25,
  diamond: 50,
  citizen: 100,
} as const

export const RANK_COLORS = {
  rookie: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
    glow: "shadow-gray-500/20",
    hex: "#6B7280",
  },
  silver: {
    bg: "bg-slate-400/20",
    text: "text-slate-300",
    border: "border-slate-400/30",
    glow: "shadow-slate-400/20",
    hex: "#9CA3AF",
  },
  gold: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    hex: "#F59E0B",
  },
  diamond: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    hex: "#3B82F6",
  },
  citizen: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/20",
    hex: "#8B5CF6",
  },
} as const

export const NFT_TIER_COLORS = {
  basic: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
  },
  silver: {
    bg: "bg-slate-400/20",
    text: "text-slate-300",
    border: "border-slate-400/30",
  },
  gold: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  diamond: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  legendary: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
} as const

export const PHASE_FEATURES = {
  1: ["free_mining", "basic_dashboard", "referral_link"],
  2: ["referral_bonuses", "leaderboard", "user_profiles"],
  3: ["boosted_mining", "social_tasks", "daily_quests"],
  4: ["nft_marketplace", "token_presale", "nft_boosts"],
  5: ["rank_system", "tier_rewards", "exclusive_quests"],
  6: ["governance_voting", "community_polls", "proposals"],
  7: ["staking", "liquidity_pools", "token_burns"],
  8: ["blockchain_wallet", "on_chain_mining", "token_withdrawals"],
  9: ["nft_trading", "nft_breeding", "rare_nfts"],
  10: ["land_plots", "virtual_mining", "3d_avatars"],
  11: ["dao_governance", "treasury_voting", "protocol_upgrades"],
  12: ["full_ecosystem", "cross_chain", "enterprise_api"],
} as const
