-- Part 4: Referral Earnings Table

CREATE TABLE IF NOT EXISTS public.referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL,
  earning_type TEXT NOT NULL CHECK (earning_type IN ('signup', 'mining', 'bonus')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

-- Users can view their own earnings
CREATE POLICY "referral_earnings_select_own" ON public.referral_earnings 
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert earnings
CREATE POLICY "referral_earnings_insert" ON public.referral_earnings 
  FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_referral_earnings_user ON public.referral_earnings(user_id);
CREATE INDEX idx_referral_earnings_created ON public.referral_earnings(created_at DESC);
