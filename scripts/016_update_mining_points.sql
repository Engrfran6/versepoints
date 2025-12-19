-- Update base mining rate to 100 points
UPDATE system_settings 
SET value = '100' 
WHERE key = 'base_mining_rate';

-- If system_settings doesn't exist, update the phase config
UPDATE platform_phases 
SET settings = jsonb_set(settings, '{base_mining_rate}', '100')
WHERE phase_number = 1;

-- Update rank config daily mining rewards proportionally
UPDATE rank_config SET daily_mining_reward = 100 WHERE rank_name = 'rookie';
UPDATE rank_config SET daily_mining_reward = 110 WHERE rank_name = 'silver';
UPDATE rank_config SET daily_mining_reward = 125 WHERE rank_name = 'gold';
UPDATE rank_config SET daily_mining_reward = 150 WHERE rank_name = 'diamond';
UPDATE rank_config SET daily_mining_reward = 200 WHERE rank_name = 'citizen';

-- Update the get_user_mining_rate function default
CREATE OR REPLACE FUNCTION get_user_mining_rate(p_user_id UUID)
RETURNS TABLE (
  base_rate INTEGER,
  rank_boost DECIMAL,
  nft_boost DECIMAL,
  total_rate DECIMAL
) AS $$
DECLARE
  user_rank_boost DECIMAL := 0;
  user_nft_boost DECIMAL := 0;
  base_mining_rate INTEGER := 100; -- Updated from 10 to 100
BEGIN
  -- Get rank boost
  SELECT COALESCE(rc.mining_boost, 0) INTO user_rank_boost
  FROM users u
  LEFT JOIN rank_config rc ON rc.rank_name = u.current_rank
  WHERE u.id = p_user_id;

  -- Get total NFT boost from equipped NFTs
  SELECT COALESCE(SUM(nc.mining_boost), 0) INTO user_nft_boost
  FROM user_nfts un
  JOIN nft_catalog nc ON nc.id = un.nft_id
  WHERE un.user_id = p_user_id AND un.is_equipped = TRUE;

  RETURN QUERY SELECT 
    base_mining_rate,
    user_rank_boost,
    user_nft_boost,
    (base_mining_rate * (1 + (COALESCE(user_rank_boost, 0) + COALESCE(user_nft_boost, 0)) / 100))::DECIMAL;
END;
$$ LANGUAGE plpgsql;
