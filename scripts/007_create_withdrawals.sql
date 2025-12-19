-- Part 7: Withdrawal Requests Table (Future Use)

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points_amount BIGINT NOT NULL,
  wallet_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  transaction_hash TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawal requests
CREATE POLICY "withdrawals_select_own" ON public.withdrawal_requests 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own withdrawal requests
CREATE POLICY "withdrawals_insert_own" ON public.withdrawal_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_withdrawals_user ON public.withdrawal_requests(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawal_requests(status);
