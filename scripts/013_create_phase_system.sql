-- VersePoints Phase 2: Phase Progression System

-- Platform phases table
CREATE TABLE IF NOT EXISTS platform_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number INTEGER UNIQUE NOT NULL,
  phase_name VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  features_unlocked JSONB DEFAULT '[]'::jsonb,
  rewards JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 12 phases
INSERT INTO platform_phases (phase_number, phase_name, description, features_unlocked, rewards) VALUES
  (1, 'Genesis Launch', 'Platform launch with basic mining functionality', '["free_mining", "basic_dashboard", "referral_link"]', '{"base_mining_rate": 10}'),
  (2, 'Growth & Referrals', 'Enhanced referral system and leaderboards', '["referral_bonuses", "leaderboard", "user_profiles"]', '{"referral_bonus": 5}'),
  (3, 'Engagement Boost', 'Boosted mining and social tasks', '["boosted_mining", "social_tasks", "daily_quests"]', '{"mining_boost": 1.5}'),
  (4, 'NFT Introduction', 'NFT marketplace and token presale', '["nft_marketplace", "token_presale", "nft_boosts"]', '{"nft_discount": 10}'),
  (5, 'Tier System', '5-tier ranking system with rewards', '["rank_system", "tier_rewards", "exclusive_quests"]', '{"rank_bonus": true}'),
  (6, 'Governance Alpha', 'Basic governance and voting', '["governance_voting", "community_polls", "proposals"]', '{"voting_power": true}'),
  (7, 'Economic Expansion', 'Enhanced tokenomics and staking', '["staking", "liquidity_pools", "token_burns"]', '{"staking_apy": 12}'),
  (8, 'Blockchain Integration', 'Full blockchain connectivity', '["blockchain_wallet", "on_chain_mining", "token_withdrawals"]', '{"withdrawal_enabled": true}'),
  (9, 'NFT Evolution', 'Advanced NFT features and trading', '["nft_trading", "nft_breeding", "rare_nfts"]', '{"rare_drop_rate": 5}'),
  (10, 'Metaverse Prep', 'Virtual land and metaverse features', '["land_plots", "virtual_mining", "3d_avatars"]', '{"land_discount": 20}'),
  (11, 'Full Decentralization', 'DAO governance and community control', '["dao_governance", "treasury_voting", "protocol_upgrades"]', '{"dao_tokens": true}'),
  (12, 'Verse Ecosystem', 'Complete ecosystem with all features', '["full_ecosystem", "cross_chain", "enterprise_api"]', '{"ecosystem_rewards": true}')
ON CONFLICT (phase_number) DO NOTHING;

-- Set Phase 1 as active by default
UPDATE platform_phases SET is_active = true, start_date = NOW() WHERE phase_number = 1;

-- Phase user progress tracking
CREATE TABLE IF NOT EXISTS user_phase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phase_number INTEGER REFERENCES platform_phases(phase_number),
  tasks_completed INTEGER DEFAULT 0,
  rewards_claimed JSONB DEFAULT '{}'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, phase_number)
);

-- Enable RLS
ALTER TABLE platform_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_phase_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view phases" ON platform_phases
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage phases" ON platform_phases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can view their own phase progress" ON user_phase_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user phase progress" ON user_phase_progress
  FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_platform_phases_active ON platform_phases(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_phase_progress_user_id ON user_phase_progress(user_id);
