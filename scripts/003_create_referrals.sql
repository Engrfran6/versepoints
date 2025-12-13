-- Part 3: Referrals Table

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  signup_bonus_paid BOOLEAN DEFAULT FALSE,
  first_mining_bonus_paid BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'invalid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals where they are the referrer
CREATE POLICY "referrals_select_referrer" ON public.referrals 
  FOR SELECT USING (auth.uid() = referrer_id);

-- Users can view referrals where they are the referred
CREATE POLICY "referrals_select_referred" ON public.referrals 
  FOR SELECT USING (auth.uid() = referred_id);

-- System can insert referrals (via trigger)
CREATE POLICY "referrals_insert" ON public.referrals 
  FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);
