-- Enhanced Task Verification System
-- Extends existing task system with platform-specific verification, fraud detection, and budget controls

-- Drop existing constraints to add new types
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_task_type_check;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_verification_type_check;

-- Add new columns to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'other' CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'facebook', 'telegram', 'whatsapp', 'other'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'manual' CHECK (verification_method IN ('auto', 'semi_auto', 'manual'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'expired'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS budget_limit INTEGER DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS spent_amount INTEGER DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS max_completions_per_user INTEGER DEFAULT 1;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update task_type constraint
ALTER TABLE public.tasks ADD CONSTRAINT tasks_task_type_check 
  CHECK (task_type IN ('social', 'daily', 'special', 'referral', 'complete_profile', 'watch_video', 'comment_keyword', 'join_telegram', 'screenshot_proof', 'visit_link'));

-- Rename user_tasks to task_submissions for clarity
ALTER TABLE IF EXISTS public.user_tasks RENAME TO task_submissions;

-- Add new columns to task_submissions
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS proof_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS fraud_score INTEGER DEFAULT 0;
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create task_analytics table
CREATE TABLE IF NOT EXISTS public.task_analytics (
  task_id UUID PRIMARY KEY REFERENCES public.tasks(id) ON DELETE CASCADE,
  impressions INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  approvals INTEGER DEFAULT 0,
  rejections INTEGER DEFAULT 0,
  total_cost INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_risk_profiles table
CREATE TABLE IF NOT EXISTS public.user_risk_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  fraud_score INTEGER DEFAULT 0,
  device_hash TEXT,
  ip_hash TEXT,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  submission_count INTEGER DEFAULT 0,
  rejection_count INTEGER DEFAULT 0,
  approval_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create youtube_verifications table for tracking video watch progress
CREATE TABLE IF NOT EXISTS public.youtube_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.task_submissions(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  watch_duration INTEGER DEFAULT 0,
  required_duration INTEGER DEFAULT 0,
  playback_rate REAL DEFAULT 1.0,
  tab_switches INTEGER DEFAULT 0,
  verification_data JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create telegram_verifications table
CREATE TABLE IF NOT EXISTS public.telegram_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.task_submissions(id) ON DELETE CASCADE,
  telegram_username TEXT,
  chat_id TEXT,
  membership_verified BOOLEAN DEFAULT FALSE,
  verification_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.task_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_analytics (Admin only)
CREATE POLICY "task_analytics_admin_all" ON public.task_analytics 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for user_risk_profiles
CREATE POLICY "user_risk_profiles_select_own" ON public.user_risk_profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_risk_profiles_admin_all" ON public.user_risk_profiles 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for verification tables (Admin only)
CREATE POLICY "youtube_verifications_admin_all" ON public.youtube_verifications 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "telegram_verifications_admin_all" ON public.telegram_verifications 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- Update task_submissions RLS policies
DROP POLICY IF EXISTS "user_tasks_select_own" ON public.task_submissions;
DROP POLICY IF EXISTS "user_tasks_insert_own" ON public.task_submissions;
DROP POLICY IF EXISTS "user_tasks_update_own" ON public.task_submissions;

CREATE POLICY "task_submissions_select_own" ON public.task_submissions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "task_submissions_insert_own" ON public.task_submissions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "task_submissions_update_own_pending" ON public.task_submissions 
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "task_submissions_admin_all" ON public.task_submissions 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- Update tasks RLS policies
DROP POLICY IF EXISTS "tasks_select_active" ON public.tasks;

CREATE POLICY "tasks_select_active" ON public.tasks 
  FOR SELECT USING (is_active = true AND status = 'active');

CREATE POLICY "tasks_admin_all" ON public.tasks 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- Function to update task analytics
CREATE OR REPLACE FUNCTION update_task_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert analytics record if doesn't exist
    INSERT INTO public.task_analytics (task_id)
    VALUES (NEW.task_id)
    ON CONFLICT (task_id) DO NOTHING;
    
    -- Increment starts
    UPDATE public.task_analytics
    SET starts = starts + 1, updated_at = NOW()
    WHERE task_id = NEW.task_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'pending' AND NEW.status = 'verified' THEN
      -- Increment approvals
      UPDATE public.task_analytics
      SET 
        approvals = approvals + 1,
        completions = completions + 1,
        total_cost = total_cost + (SELECT points_reward FROM public.tasks WHERE id = NEW.task_id),
        updated_at = NOW()
      WHERE task_id = NEW.task_id;
      
      -- Update task spent_amount
      UPDATE public.tasks
      SET spent_amount = spent_amount + (SELECT points_reward FROM public.tasks WHERE id = NEW.task_id)
      WHERE id = NEW.task_id;
      
    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
      -- Increment rejections
      UPDATE public.task_analytics
      SET rejections = rejections + 1, updated_at = NOW()
      WHERE task_id = NEW.task_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task analytics
DROP TRIGGER IF EXISTS task_submissions_analytics_trigger ON public.task_submissions;
CREATE TRIGGER task_submissions_analytics_trigger
  AFTER INSERT OR UPDATE ON public.task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_task_analytics();

-- Function to update user risk profile
CREATE OR REPLACE FUNCTION update_user_risk_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_fraud_score INTEGER := 0;
BEGIN
  -- Create or update risk profile
  INSERT INTO public.user_risk_profiles (user_id, submission_count)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    submission_count = user_risk_profiles.submission_count + 1,
    updated_at = NOW();
  
  -- Update approval/rejection counts
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'pending' AND NEW.status = 'verified' THEN
      UPDATE public.user_risk_profiles
      SET approval_count = approval_count + 1
      WHERE user_id = NEW.user_id;
    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
      UPDATE public.user_risk_profiles
      SET rejection_count = rejection_count + 1
      WHERE user_id = NEW.user_id;
      
      -- Calculate fraud score
      SELECT 
        LEAST(100, (rejection_count::FLOAT / NULLIF(submission_count, 0) * 100)::INTEGER)
      INTO v_fraud_score
      FROM public.user_risk_profiles
      WHERE user_id = NEW.user_id;
      
      UPDATE public.user_risk_profiles
      SET fraud_score = v_fraud_score
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user risk profile
DROP TRIGGER IF EXISTS task_submissions_risk_trigger ON public.task_submissions;
CREATE TRIGGER task_submissions_risk_trigger
  AFTER INSERT OR UPDATE ON public.task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_risk_profile();

-- Function to check budget limits
CREATE OR REPLACE FUNCTION check_task_budget()
RETURNS TRIGGER AS $$
DECLARE
  v_task_budget INTEGER;
  v_task_spent INTEGER;
  v_task_reward INTEGER;
BEGIN
  SELECT budget_limit, spent_amount, points_reward
  INTO v_task_budget, v_task_spent, v_task_reward
  FROM public.tasks
  WHERE id = NEW.task_id;
  
  -- Check if budget would be exceeded
  IF v_task_budget > 0 AND (v_task_spent + v_task_reward) > v_task_budget THEN
    -- Auto-pause task
    UPDATE public.tasks
    SET status = 'paused'
    WHERE id = NEW.task_id;
    
    RAISE EXCEPTION 'Task budget exceeded. Task has been paused.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for budget check
DROP TRIGGER IF EXISTS task_submissions_budget_trigger ON public.task_submissions;
CREATE TRIGGER task_submissions_budget_trigger
  BEFORE UPDATE ON public.task_submissions
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status = 'verified')
  EXECUTE FUNCTION check_task_budget();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON public.task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_reviewed ON public.task_submissions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_tasks_platform ON public.tasks(platform);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_flagged ON public.user_risk_profiles(flagged);
CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_fraud_score ON public.user_risk_profiles(fraud_score);
