-- VersePoints Phase 2: NFT Marketplace System

-- NFT Catalog - All available NFTs
CREATE TABLE IF NOT EXISTS nft_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tier VARCHAR(20) CHECK (tier IN ('basic', 'silver', 'gold', 'diamond', 'legendary')) DEFAULT 'basic',
  vp_cost INTEGER NOT NULL,
  mining_boost DECIMAL(5,2) DEFAULT 0.00,
  special_effect VARCHAR(100),
  image_url TEXT,
  model_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  max_supply INTEGER,
  current_supply INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  required_rank VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User NFT Inventory
CREATE TABLE IF NOT EXISTS user_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nft_id UUID REFERENCES nft_catalog(id) ON DELETE CASCADE,
  purchase_cost INTEGER NOT NULL,
  is_equipped BOOLEAN DEFAULT false,
  is_burned BOOLEAN DEFAULT false,
  burned_at TIMESTAMPTZ,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- NFT Upgrade Combinations (burn mechanics)
CREATE TABLE IF NOT EXISTS nft_upgrade_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_tier VARCHAR(20) NOT NULL,
  input_quantity INTEGER NOT NULL DEFAULT 3,
  output_tier VARCHAR(20) NOT NULL,
  output_nft_id UUID REFERENCES nft_catalog(id),
  vp_cost INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFT Transaction History
CREATE TABLE IF NOT EXISTS nft_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nft_id UUID REFERENCES nft_catalog(id),
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('purchase', 'burn', 'upgrade', 'reward', 'transfer')),
  vp_amount INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample NFTs
INSERT INTO nft_catalog (name, description, tier, vp_cost, mining_boost, special_effect, image_url, max_supply, required_rank) VALUES
  ('Basic Pickaxe', 'A simple pickaxe for beginners. Boosts mining by 2%.', 'basic', 500, 2.00, NULL, '/nfts/basic-pickaxe.png', 10000, NULL),
  ('Silver Drill', 'An upgraded drill with enhanced mining power.', 'silver', 2500, 5.00, NULL, '/nfts/silver-drill.png', 5000, 'silver'),
  ('Golden Excavator', 'A powerful excavator for serious miners.', 'gold', 10000, 10.00, 'double_referral', '/nfts/golden-excavator.png', 2000, 'gold'),
  ('Diamond Core', 'Rare diamond-powered mining core.', 'diamond', 50000, 20.00, 'passive_earnings', '/nfts/diamond-core.png', 500, 'diamond'),
  ('Legendary Verse Engine', 'The ultimate mining machine. Grants auto-mining.', 'legendary', 200000, 35.00, 'auto_mining', '/nfts/legendary-engine.png', 100, 'citizen')
ON CONFLICT DO NOTHING;

-- Insert upgrade combinations
INSERT INTO nft_upgrade_combinations (input_tier, input_quantity, output_tier, vp_cost) VALUES
  ('basic', 3, 'silver', 500),
  ('silver', 3, 'gold', 2000),
  ('gold', 3, 'diamond', 10000),
  ('diamond', 3, 'legendary', 50000)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE nft_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_upgrade_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view NFT catalog" ON nft_catalog
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage NFT catalog" ON nft_catalog
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can view their own NFTs" ON user_nfts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFTs" ON user_nfts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage user NFTs" ON user_nfts
  FOR ALL USING (true);

CREATE POLICY "Anyone can view upgrade combinations" ON nft_upgrade_combinations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own NFT transactions" ON nft_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_nfts_user_id ON user_nfts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_equipped ON user_nfts(user_id, is_equipped) WHERE is_equipped = true;
CREATE INDEX IF NOT EXISTS idx_nft_catalog_tier ON nft_catalog(tier);
CREATE INDEX IF NOT EXISTS idx_nft_transactions_user_id ON nft_transactions(user_id);
