-- Add streak mining columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_updated_at TIMESTAMPTZ;

-- Create streak bonus config table
CREATE TABLE IF NOT EXISTS streak_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streak_days INTEGER NOT NULL UNIQUE,
  bonus_multiplier DECIMAL(3,2) NOT NULL,
  badge_name TEXT,
  badge_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default streak configs
INSERT INTO streak_config (streak_days, bonus_multiplier, badge_name, badge_color) VALUES
  (3, 1.10, 'Hot Start', '#f97316'),
  (7, 1.25, 'Week Warrior', '#eab308'),
  (14, 1.50, 'Fortnight Fighter', '#22c55e'),
  (30, 2.00, 'Monthly Master', '#3b82f6'),
  (60, 2.50, 'Diamond Hands', '#8b5cf6'),
  (100, 3.00, 'Legendary Miner', '#ec4899')
ON CONFLICT (streak_days) DO NOTHING;

-- Create function to calculate streak bonus
CREATE OR REPLACE FUNCTION get_streak_multiplier(streak_days INTEGER)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  multiplier DECIMAL(3,2) := 1.0;
BEGIN
  SELECT COALESCE(
    (SELECT bonus_multiplier FROM streak_config 
     WHERE streak_days <= $1 
     ORDER BY streak_days DESC 
     LIMIT 1),
    1.0
  ) INTO multiplier;
  RETURN multiplier;
END;
$$ LANGUAGE plpgsql;

-- Create function to update streak on mining
CREATE OR REPLACE FUNCTION update_mining_streak(user_uuid UUID)
RETURNS TABLE(new_streak INTEGER, multiplier DECIMAL(3,2), streak_broken BOOLEAN) AS $$
DECLARE
  last_mining TIMESTAMPTZ;
  current_str INTEGER;
  hours_since_last DECIMAL;
  grace_hours INTEGER := 36;
BEGIN
  SELECT last_mining_at, current_streak INTO last_mining, current_str
  FROM users WHERE id = user_uuid;
  
  IF last_mining IS NULL THEN
    -- First mining ever
    UPDATE users SET current_streak = 1, streak_updated_at = NOW() WHERE id = user_uuid;
    RETURN QUERY SELECT 1, 1.0::DECIMAL(3,2), FALSE;
  ELSE
    hours_since_last := EXTRACT(EPOCH FROM (NOW() - last_mining)) / 3600;
    
    IF hours_since_last <= grace_hours THEN
      -- Continue streak
      current_str := current_str + 1;
      UPDATE users SET 
        current_streak = current_str, 
        longest_streak = GREATEST(longest_streak, current_str),
        streak_updated_at = NOW() 
      WHERE id = user_uuid;
      RETURN QUERY SELECT current_str, get_streak_multiplier(current_str), FALSE;
    ELSE
      -- Streak broken, reset to 1
      UPDATE users SET 
        current_streak = 1, 
        streak_updated_at = NOW() 
      WHERE id = user_uuid;
      RETURN QUERY SELECT 1, 1.0::DECIMAL(3,2), TRUE;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
