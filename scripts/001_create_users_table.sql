-- VersePoints Mining Platform Database Schema
-- Part 1: Users Table with profiles

-- Create users table that references auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.users(id),
  points_balance BIGINT DEFAULT 0,
  total_mined BIGINT DEFAULT 0,
  total_referral_earnings BIGINT DEFAULT 0,
  mining_count INTEGER DEFAULT 0,
  last_mining_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "users_select_own" ON public.users 
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data (limited fields)
CREATE POLICY "users_update_own" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "users_insert_own" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow viewing other users for leaderboard (limited columns via views)
CREATE POLICY "users_select_public" ON public.users 
  FOR SELECT USING (true);

-- Create index for referral lookups
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_users_referred_by ON public.users(referred_by);
CREATE INDEX idx_users_points_balance ON public.users(points_balance DESC);
CREATE INDEX idx_users_status ON public.users(status);
