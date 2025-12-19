// Phase 2 Types - Ranks, NFTs, Phases

export type RankName = "rookie" | "silver" | "gold" | "diamond" | "citizen";

export interface UserRank {
  id: string;
  user_id: string;
  rank_name: RankName;
  total_points_earned: number;
  mining_speed_boost: number;
  boost_expires_at: string | null;
  referral_bonus_multiplier: number;
  achieved_at: string;
  updated_at: string;
}

export interface RankConfig {
  id: string;
  rank_name: RankName;
  points_threshold: number;
  mining_boost: number;
  referral_bonus_multiplier: number;
  daily_mining_reward: number;
  badge_color: string;
  badge_icon: string;
  features: string[];
  created_at: string;
  referers: number;
}

export interface RankRewardsLog {
  id: string;
  user_id: string;
  from_rank: RankName | null;
  to_rank: RankName;
  token_bonus_awarded: number;
  nft_reward_id: string | null;
  mining_boost_days: number | null;
  mining_boost_percentage: number | null;
  unlocked_features: string[];
  awarded_at: string;
}

export type NFTTier = "basic" | "silver" | "gold" | "diamond" | "legendary";

export interface NFTCatalog {
  id: string;
  name: string;
  description: string | null;
  tier: NFTTier;
  vp_cost: number;
  mining_boost: number;
  special_effect: string | null;
  image_url: string | null;
  model_url: string | null;
  metadata: Record<string, unknown>;
  max_supply: number | null;
  current_supply: number;
  is_active: boolean;
  required_rank: RankName | null;
  created_at: string;
}

export interface UserNFT {
  id: string;
  user_id: string;
  nft_id: string;
  purchase_cost: number;
  is_equipped: boolean;
  is_burned: boolean;
  burned_at: string | null;
  acquired_at: string;
  metadata: Record<string, unknown>;
  // Joined data
  nft?: NFTCatalog;
}

export interface NFTUpgradeCombination {
  id: string;
  input_tier: NFTTier;
  input_quantity: number;
  output_tier: NFTTier;
  output_nft_id: string | null;
  vp_cost: number;
  is_active: boolean;
  created_at: string;
}

export interface NFTTransaction {
  id: string;
  user_id: string;
  nft_id: string;
  transaction_type: "purchase" | "burn" | "upgrade" | "reward" | "transfer";
  vp_amount: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PlatformPhase {
  id: string;
  phase_number: number;
  phase_name: string;
  description: string | null;
  is_active: boolean;
  is_completed: boolean;
  start_date: string | null;
  end_date: string | null;
  features_unlocked: string[];
  rewards: Record<string, unknown>;
  created_at: string;
}

export interface UserPhaseProgress {
  id: string;
  user_id: string;
  phase_number: number;
  tasks_completed: number;
  rewards_claimed: Record<string, unknown>;
  joined_at: string;
}

// Extended User type with Phase 2 data
export interface UserWithRank {
  id: string;
  email: string;
  username: string;
  referral_code: string;
  referred_by: string | null;
  points_balance: number;
  total_mined: number;
  total_referral_earnings: number;
  mining_count: number;
  last_mining_at: string | null;
  status: "active" | "suspended" | "banned";
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  // Phase 2 joined data
  user_rank?: UserRank;
  equipped_nfts?: UserNFT[];
}

// Mining rate calculation result
export interface MiningRate {
  base_rate: number;
  rank_boost: number;
  nft_boost: number;
  total_rate: number;
}

// Rank promotion result
export interface RankPromotionResult {
  promoted: boolean;
  new_rank: RankName;
  rewards: {
    mining_boost?: number;
    referral_multiplier?: number;
    daily_reward?: number;
    features?: string[];
  };
}
