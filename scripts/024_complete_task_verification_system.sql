-- Complete Task Verification System Database Schema
-- This extends the existing tasks tables with platform-specific verification

-- Drop and recreate tasks table with full schema
DROP TABLE IF EXISTS public.user_tasks CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.task_analytics CASCADE;
DROP TABLE IF EXISTS public.user_risk_profiles CASCADE;
DROP TABLE IF EXISTS public.youtube_verifications CASCADE;
DROP TABLE IF EXISTS public.telegram_verifications CASCADE;

-- Tasks table with complete schema
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'facebook', 'telegram', 'whatsapp', 'other')),
  task_type TEXT NOT NULL CHECK (task_type IN ('watch_video', 'comment_keyword', 'join_telegram', 'screenshot_proof', 'visit_link', 'referral', 'complete_profile')),
  verification_method TEXT NOT NULL DEFAULT 'manual' CHECK (verification_method IN ('auto', 'semi_auto', 'manual')),
  reward_amount INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'expired')),
  max_completions INTEGER,
  max_completions_per_user INTEGER DEFAULT 1,
  budget_limit INTEGER,
  spent_amount INTEGER DEFAULT 0,
  action_url TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task submissions (user_tasks)
CREATE TABLE public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_url TEXT,
  proof_data JSONB DEFAULT '{}'::jsonb,
  points_awarded INTEGER DEFAULT 0,
  fraud_score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Task analytics
CREATE TABLE public.task_analytics (
  task_id UUID PRIMARY KEY REFERENCES public.tasks(id) ON DELETE CASCADE,
  impressions INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  approvals INTEGER DEFAULT 0,
  rejections INTEGER DEFAULT 0,
  total_cost INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User risk profiles
CREATE TABLE public.user_risk_profiles (
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

-- YouTube verifications
CREATE TABLE public.youtube_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.user_tasks(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  watch_duration INTEGER NOT NULL,
  required_duration INTEGER NOT NULL,
  playback_rate DECIMAL(3,2) DEFAULT 1.0,
  tab_switches INTEGER DEFAULT 0,
  verification_data JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telegram verifications
CREATE TABLE public.telegram_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.user_tasks(id) ON DELETE CASCADE,
  telegram_username TEXT,
  chat_id TEXT NOT NULL,
  membership_verified BOOLEAN DEFAULT FALSE,
  verification_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_platform ON public.tasks(platform);
CREATE INDEX idx_user_tasks_status ON public.user_tasks(status);
CREATE INDEX idx_user_tasks_user ON public.user_tasks(user_id);
CREATE INDEX idx_user_tasks_task ON public.user_tasks(task_id);
CREATE INDEX idx_user_risk_profiles_flagged ON public.user_risk_profiles(flagged);
CREATE INDEX idx_youtube_verifications_submission ON public.youtube_verifications(submission_id);
CREATE INDEX idx_telegram_verifications_submission ON public.telegram_verifications(submission_id);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "tasks_select_active" ON public.tasks 
  FOR SELECT USING (status = 'active' AND is_active = TRUE);

CREATE POLICY "tasks_admin_all" ON public.tasks 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- RLS Policies for user_tasks
CREATE POLICY "user_tasks_select_own" ON public.user_tasks 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_tasks_insert_own" ON public.user_tasks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_tasks_admin_all" ON public.user_tasks 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- RLS Policies for analytics (admin only)
CREATE POLICY "task_analytics_admin_only" ON public.task_analytics 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- RLS Policies for risk profiles (admin only)
CREATE POLICY "user_risk_profiles_admin_only" ON public.user_risk_profiles 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- RLS Policies for verifications (users can see their own, admins can see all)
CREATE POLICY "youtube_verifications_own" ON public.youtube_verifications 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_tasks WHERE id = submission_id AND user_id = auth.uid())
  );

CREATE POLICY "telegram_verifications_own" ON public.telegram_verifications 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_tasks WHERE id = submission_id AND user_id = auth.uid())
  );

-- Triggers to update analytics
CREATE OR REPLACE FUNCTION update_task_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize analytics if not exists
  INSERT INTO public.task_analytics (task_id)
  VALUES (NEW.task_id)
  ON CONFLICT (task_id) DO NOTHING;

  -- Update counts based on status
  IF TG_OP = 'INSERT' THEN
    UPDATE public.task_analytics 
    SET starts = starts + 1, updated_at = NOW()
    WHERE task_id = NEW.task_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
      UPDATE public.task_analytics 
      SET approvals = approvals + 1, 
          completions = completions + 1,
          total_cost = total_cost + NEW.points_awarded,
          updated_at = NOW()
      WHERE task_id = NEW.task_id;
      
      -- Update task spent amount
      UPDATE public.tasks
      SET spent_amount = spent_amount + NEW.points_awarded
      WHERE id = NEW.task_id;
    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
      UPDATE public.task_analytics 
      SET rejections = rejections + 1, updated_at = NOW()
      WHERE task_id = NEW.task_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_submission_analytics_trigger
AFTER INSERT OR UPDATE ON public.user_tasks
FOR EACH ROW
EXECUTE FUNCTION update_task_analytics();

-- Trigger to update user risk profile
CREATE OR REPLACE FUNCTION update_user_risk_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize risk profile if not exists
  INSERT INTO public.user_risk_profiles (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update counts
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_risk_profiles 
    SET submission_count = submission_count + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
      UPDATE public.user_risk_profiles 
      SET approval_count = approval_count + 1,
          fraud_score = GREATEST(fraud_score - 5, 0),
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
      UPDATE public.user_risk_profiles 
      SET rejection_count = rejection_count + 1,
          fraud_score = LEAST(fraud_score + 15, 100),
          flagged = CASE WHEN rejection_count >= 3 THEN TRUE ELSE flagged END,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_risk_profile_trigger
AFTER INSERT OR UPDATE ON public.user_tasks
FOR EACH ROW
EXECUTE FUNCTION update_user_risk_profile();

-- Function to check budget before approval
CREATE OR REPLACE FUNCTION check_task_budget()
RETURNS TRIGGER AS $$
DECLARE
  task_budget_limit INTEGER;
  task_spent INTEGER;
BEGIN
  -- Only check when approving
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    SELECT budget_limit, spent_amount INTO task_budget_limit, task_spent
    FROM public.tasks WHERE id = NEW.task_id;

    IF task_budget_limit IS NOT NULL AND (task_spent + NEW.points_awarded) > task_budget_limit THEN
      RAISE EXCEPTION 'Task budget exceeded. Cannot approve more submissions.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_budget_trigger
BEFORE UPDATE ON public.user_tasks
FOR EACH ROW
EXECUTE FUNCTION check_task_budget();
