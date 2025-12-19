-- VersePoints Phase 2: 5-Tier Ranking System
-- Run this after initial Phase 1 setup

-- User ranks table for tracking tier progression
CREATE TABLE IF NOT EXISTS user_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  rank_name VARCHAR(20) CHECK (rank_name IN ('rookie', 'silver', 'gold', 'diamond', 'citizen')) DEFAULT 'rookie',
  total_points_earned INTEGER DEFAULT 0,
  mining_speed_boost DECIMAL(5,2) DEFAULT 0.00,
  boost_expires_at TIMESTAMPTZ,
  referral_bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rank rewards log for tracking promotions and rewards given
CREATE TABLE IF NOT EXISTS rank_rewards_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_rank VARCHAR(20),
  to_rank VARCHAR(20),
  token_bonus_awarded INTEGER DEFAULT 0,
  nft_reward_id UUID,
  mining_boost_days INTEGER,
  mining_boost_percentage DECIMAL(5,2),
  unlocked_features JSONB DEFAULT '[]'::jsonb,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rank configuration table (admin configurable)
CREATE TABLE IF NOT EXISTS rank_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_name VARCHAR(20) UNIQUE NOT NULL,
  points_threshold INTEGER NOT NULL,
  mining_boost DECIMAL(5,2) DEFAULT 0.00,
  referral_bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,
  daily_mining_reward INTEGER DEFAULT 10,
  badge_color VARCHAR(20),
  badge_icon VARCHAR(50),
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rank configurations
INSERT INTO rank_config (rank_name, points_threshold, mining_boost, referral_bonus_multiplier, daily_mining_reward, badge_color, badge_icon, features) VALUES
  ('rookie', 0, 0.00, 1.00, 10, '#6B7280', 'shield', '["basic_mining", "referral_link"]'),
  ('silver', 10000, 5.00, 1.10, 12, '#9CA3AF', 'shield-plus', '["basic_mining", "referral_link", "discord_access"]'),
  ('gold', 50000, 15.00, 1.25, 15, '#F59E0B', 'award', '["basic_mining", "referral_link", "discord_access", "quest_system", "nft_marketplace"]'),
  ('diamond', 200000, 30.00, 1.50, 20, '#3B82F6', 'gem', '["basic_mining", "referral_link", "discord_access", "quest_system", "nft_marketplace", "governance_voting", "land_waitlist"]'),
  ('citizen', 1000000, 50.00, 2.00, 30, '#8B5CF6', 'crown', '["basic_mining", "referral_link", "discord_access", "quest_system", "nft_marketplace", "governance_voting", "land_waitlist", "governance_proposals", "elite_quests", "exclusive_nfts"]')
ON CONFLICT (rank_name) DO NOTHING;

-- Enable RLS
ALTER TABLE user_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_rewards_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_ranks
CREATE POLICY "Users can view their own rank" ON user_ranks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user ranks" ON user_ranks
  FOR ALL USING (true);

-- RLS Policies for rank_rewards_log
CREATE POLICY "Users can view their own rank rewards" ON rank_rewards_log
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for rank_config (public read)
CREATE POLICY "Anyone can view rank config" ON rank_config
  FOR SELECT USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_ranks_user_id ON user_ranks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ranks_rank_name ON user_ranks(rank_name);
CREATE INDEX IF NOT EXISTS idx_rank_rewards_user_id ON rank_rewards_log(user_id);
