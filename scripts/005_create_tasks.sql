-- Part 5: Tasks System Tables

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER NOT NULL DEFAULT 5,
  task_type TEXT NOT NULL CHECK (task_type IN ('social', 'daily', 'special', 'referral')),
  action_url TEXT,
  verification_type TEXT DEFAULT 'manual' CHECK (verification_type IN ('manual', 'auto', 'admin')),
  max_completions INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Anyone can view active tasks
CREATE POLICY "tasks_select_active" ON public.tasks 
  FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified', 'rejected')),
  proof_url TEXT,
  points_awarded INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own task completions
CREATE POLICY "user_tasks_select_own" ON public.user_tasks 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own task completions
CREATE POLICY "user_tasks_insert_own" ON public.user_tasks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending tasks
CREATE POLICY "user_tasks_update_own" ON public.user_tasks 
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Create indexes
CREATE INDEX idx_tasks_active ON public.tasks(is_active);
CREATE INDEX idx_user_tasks_user ON public.user_tasks(user_id);
CREATE INDEX idx_user_tasks_task ON public.user_tasks(task_id);
