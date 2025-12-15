-- Create table for withdrawal notification subscriptions
CREATE TABLE IF NOT EXISTS withdrawal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Enable RLS
ALTER TABLE withdrawal_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" ON withdrawal_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON withdrawal_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_withdrawal_notifications_user_id ON withdrawal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_notifications_subscribed ON withdrawal_notifications(subscribed);
