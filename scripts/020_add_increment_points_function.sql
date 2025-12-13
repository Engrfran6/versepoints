-- Create function to increment user points
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET 
    points_balance = points_balance + points,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;
