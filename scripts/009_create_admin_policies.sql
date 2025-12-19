-- Part 9: Admin Policies and Views

-- Create a view for leaderboard (public data only)
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  id,
  username,
  points_balance,
  mining_count,
  created_at,
  ROW_NUMBER() OVER (ORDER BY points_balance DESC) as rank
FROM public.users
WHERE status = 'active'
ORDER BY points_balance DESC;

-- Grant access to the view
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;

-- Create admin function to adjust points (must be called with service role)
CREATE OR REPLACE FUNCTION admin_adjust_points(
  target_user_id UUID,
  point_adjustment BIGINT,
  reason TEXT DEFAULT 'Admin adjustment'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user points
  UPDATE public.users
  SET 
    points_balance = points_balance + point_adjustment,
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Log the action
  INSERT INTO public.audit_log (user_id, action, metadata)
  VALUES (
    target_user_id,
    'admin_points_adjustment',
    jsonb_build_object(
      'adjustment', point_adjustment,
      'reason', reason
    )
  );

  RETURN TRUE;
END;
$$;
