-- Update rank thresholds and mining points

-- Update rank configuration with new thresholds and referral requirements
UPDATE rank_config SET points_threshold = 1000 WHERE rank_name = 'rookie';
UPDATE rank_config SET points_threshold = 50000 WHERE rank_name = 'silver';
UPDATE rank_config SET points_threshold = 250000 WHERE rank_name = 'gold';
UPDATE rank_config SET points_threshold = 1000000 WHERE rank_name = 'diamond';
UPDATE rank_config SET points_threshold = 5000000 WHERE rank_name = 'citizen';

-- Add referral requirement column to rank_config
ALTER TABLE rank_config ADD COLUMN IF NOT EXISTS referrals_required INTEGER DEFAULT 0;

-- Update referral requirements
UPDATE rank_config SET referrals_required = 3 WHERE rank_name = 'rookie';
UPDATE rank_config SET referrals_required = 10 WHERE rank_name = 'silver';
UPDATE rank_config SET referrals_required = 25 WHERE rank_name = 'gold';
UPDATE rank_config SET referrals_required = 50 WHERE rank_name = 'diamond';
UPDATE rank_config SET referrals_required = 100 WHERE rank_name = 'citizen';

-- Add referral_count to user_ranks table
ALTER TABLE user_ranks ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Function to check and auto-award ranks
CREATE OR REPLACE FUNCTION check_and_award_rank()
RETURNS TRIGGER AS $$
DECLARE
  user_rank RECORD;
  user_referrals INTEGER;
  new_rank_name VARCHAR(20);
  rank_configs RECORD;
BEGIN
  -- Get user's current rank
  SELECT * INTO user_rank FROM user_ranks WHERE user_id = NEW.id;
  
  -- If no rank exists, create rookie rank
  IF user_rank IS NULL THEN
    INSERT INTO user_ranks (user_id, rank_name, total_points_earned, referral_count)
    VALUES (NEW.id, 'rookie', NEW.points_balance, 0);
    RETURN NEW;
  END IF;
  
  -- Count user's successful referrals
  SELECT COUNT(*) INTO user_referrals
  FROM referrals
  WHERE referrer_id = NEW.id AND status = 'active';
  
  -- Update referral count
  UPDATE user_ranks 
  SET referral_count = user_referrals, total_points_earned = NEW.points_balance
  WHERE user_id = NEW.id;
  
  -- Check for rank promotions (from highest to lowest)
  FOR rank_configs IN 
    SELECT * FROM rank_config 
    WHERE points_threshold <= NEW.points_balance 
      AND referrals_required <= user_referrals
    ORDER BY points_threshold DESC
    LIMIT 1
  LOOP
    IF rank_configs.rank_name != user_rank.rank_name THEN
      -- Award new rank
      UPDATE user_ranks 
      SET 
        rank_name = rank_configs.rank_name,
        achieved_at = NOW(),
        updated_at = NOW()
      WHERE user_id = NEW.id;
      
      -- Log rank promotion
      INSERT INTO rank_rewards_log (
        user_id,
        from_rank,
        to_rank,
        awarded_at
      ) VALUES (
        NEW.id,
        user_rank.rank_name,
        rank_configs.rank_name,
        NOW()
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-check ranks on points update
DROP TRIGGER IF EXISTS auto_check_rank ON users;
CREATE TRIGGER auto_check_rank
  AFTER UPDATE OF points_balance ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_rank();

-- Update mining sessions default points
ALTER TABLE mining_sessions ALTER COLUMN points_earned SET DEFAULT 10000;
