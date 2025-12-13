-- Part 2: Mining Sessions Table

CREATE TABLE IF NOT EXISTS public.mining_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL DEFAULT 10,
  ip_address INET,
  user_agent TEXT,
  fingerprint_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own mining sessions
CREATE POLICY "mining_sessions_select_own" ON public.mining_sessions 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own mining sessions
CREATE POLICY "mining_sessions_insert_own" ON public.mining_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_mining_sessions_user_id ON public.mining_sessions(user_id);
CREATE INDEX idx_mining_sessions_created_at ON public.mining_sessions(created_at DESC);
CREATE INDEX idx_mining_sessions_ip ON public.mining_sessions(ip_address);
