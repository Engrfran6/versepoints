-- VersePoints Phase 2: Rank System Functions

-- Function to check and process rank promotions
CREATE OR REPLACE FUNCTION check_rank_promotion(target_user_id UUID)
RETURNS TABLE(promoted BOOLEAN, new_rank VARCHAR(20), rewards JSONB) AS $$
DECLARE
  user_total_points INTEGER;
  current_rank VARCHAR(20);
  next_rank RECORD;
  promotion_rewards JSONB;
BEGIN
  -- Get user's total points and current rank
  SELECT COALESCE(ur.total_points_earned, u.total_mined), COALESCE(ur.rank_name, 'rookie')
  INTO user_total_points, current_rank
  FROM users u
  LEFT JOIN user_ranks ur ON ur.user_id = u.id
  WHERE u.id = target_user_id;

  -- Find the highest rank the user qualifies for
  SELECT * INTO next_rank
  FROM rank_config
  WHERE points_threshold <= user_total_points
  ORDER BY points_threshold DESC
  LIMIT 1;

  -- If user qualifies for a higher rank
  IF next_rank.rank_name IS NOT NULL AND next_rank.rank_name != current_rank THEN
    -- Calculate promotion rewards
    promotion_rewards := jsonb_build_object(
      'mining_boost', next_rank.mining_boost,
      'referral_multiplier', next_rank.referral_bonus_multiplier,
      'daily_reward', next_rank.daily_mining_reward,
      'features', next_rank.features
    );

    -- Update or insert user rank
    INSERT INTO user_ranks (user_id, rank_name, total_points_earned, mining_speed_boost, referral_bonus_multiplier)
    VALUES (target_user_id, next_rank.rank_name, user_total_points, next_rank.mining_boost, next_rank.referral_bonus_multiplier)
    ON CONFLICT (user_id) DO UPDATE SET
      rank_name = next_rank.rank_name,
      total_points_earned = user_total_points,
      mining_speed_boost = next_rank.mining_boost,
      referral_bonus_multiplier = next_rank.referral_bonus_multiplier,
      updated_at = NOW();

    -- Log the promotion
    INSERT INTO rank_rewards_log (user_id, from_rank, to_rank, mining_boost_percentage, unlocked_features)
    VALUES (target_user_id, current_rank, next_rank.rank_name, next_rank.mining_boost, next_rank.features);

    RETURN QUERY SELECT true, next_rank.rank_name, promotion_rewards;
  ELSE
    RETURN QUERY SELECT false, current_rank, '{}'::jsonb;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's effective mining rate (base + rank boost + NFT boost)
CREATE OR REPLACE FUNCTION get_user_mining_rate(target_user_id UUID)
RETURNS TABLE(base_rate INTEGER, rank_boost DECIMAL, nft_boost DECIMAL, total_rate DECIMAL) AS $$
DECLARE
  user_rank_boost DECIMAL;
  user_nft_boost DECIMAL;
  base_mining_rate INTEGER := 10;
BEGIN
  -- Get rank boost
  SELECT COALESCE(ur.mining_speed_boost, 0)
  INTO user_rank_boost
  FROM user_ranks ur
  WHERE ur.user_id = target_user_id;

  -- Get equipped NFT boosts
  SELECT COALESCE(SUM(nc.mining_boost), 0)
  INTO user_nft_boost
  FROM user_nfts un
  JOIN nft_catalog nc ON nc.id = un.nft_id
  WHERE un.user_id = target_user_id
    AND un.is_equipped = true
    AND un.is_burned = false;

  -- Get rank-specific base rate
  SELECT COALESCE(rc.daily_mining_reward, 10)
  INTO base_mining_rate
  FROM user_ranks ur
  JOIN rank_config rc ON rc.rank_name = ur.rank_name
  WHERE ur.user_id = target_user_id;

  RETURN QUERY SELECT 
    base_mining_rate,
    COALESCE(user_rank_boost, 0::DECIMAL),
    COALESCE(user_nft_boost, 0::DECIMAL),
    (base_mining_rate * (1 + (COALESCE(user_rank_boost, 0) + COALESCE(user_nft_boost, 0)) / 100))::DECIMAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize user rank on signup
CREATE OR REPLACE FUNCTION initialize_user_rank()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_ranks (user_id, rank_name, total_points_earned)
  VALUES (NEW.id, 'rookie', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create rank entry for new users
DROP TRIGGER IF EXISTS on_user_created_init_rank ON users;
CREATE TRIGGER on_user_created_init_rank
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_rank();

-- Function to update total points and check promotion after mining
CREATE OR REPLACE FUNCTION update_user_rank_on_mining()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total points in user_ranks
  UPDATE user_ranks
  SET total_points_earned = total_points_earned + NEW.points_earned,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  -- Check for rank promotion
  PERFORM check_rank_promotion(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check rank after each mining session
DROP TRIGGER IF EXISTS on_mining_check_rank ON mining_sessions;
CREATE TRIGGER on_mining_check_rank
  AFTER INSERT ON mining_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rank_on_mining();
