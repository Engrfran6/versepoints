-- Part 6: Security & Anti-Bot Tables

CREATE TABLE IF NOT EXISTS public.device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,
  browser_info JSONB,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_trusted BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, fingerprint_hash)
);

-- Enable RLS
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;

-- Users can view their own fingerprints
CREATE POLICY "fingerprints_select_own" ON public.device_fingerprints 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own fingerprints
CREATE POLICY "fingerprints_insert_own" ON public.device_fingerprints 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own fingerprints
CREATE POLICY "fingerprints_update_own" ON public.device_fingerprints 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  first_attempt TIMESTAMPTZ DEFAULT NOW(),
  last_attempt TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  UNIQUE(identifier, action_type)
);

-- Enable RLS (this is system-level, accessed via service role)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow select for rate limit checks
CREATE POLICY "rate_limits_select" ON public.rate_limits 
  FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "audit_log_select_own" ON public.audit_log 
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert audit logs
CREATE POLICY "audit_log_insert" ON public.audit_log 
  FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_fingerprints_user ON public.device_fingerprints(user_id);
CREATE INDEX idx_fingerprints_hash ON public.device_fingerprints(fingerprint_hash);
CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier, action_type);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
