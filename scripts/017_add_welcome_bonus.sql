-- Add welcome bonus tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_bonus_claimed BOOLEAN DEFAULT FALSE;

-- Create function to award welcome bonus on first login/verification
CREATE OR REPLACE FUNCTION award_welcome_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 1000 VP welcome bonus when user verifies email
  IF NEW.email_verified = TRUE AND (OLD.email_verified IS NULL OR OLD.email_verified = FALSE) THEN
    UPDATE users 
    SET 
      points_balance = points_balance + 1000,
      welcome_bonus_claimed = TRUE
    WHERE id = NEW.id AND welcome_bonus_claimed = FALSE;
    
    -- Log the welcome bonus
    INSERT INTO audit_log (user_id, action, ip_address, metadata)
    VALUES (NEW.id, 'welcome_bonus', '0.0.0.0', '{"points": 1000, "type": "welcome_bonus"}'::jsonb);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for welcome bonus
DROP TRIGGER IF EXISTS trigger_welcome_bonus ON users;
CREATE TRIGGER trigger_welcome_bonus
  AFTER UPDATE OF email_verified ON users
  FOR EACH ROW
  EXECUTE FUNCTION award_welcome_bonus();
