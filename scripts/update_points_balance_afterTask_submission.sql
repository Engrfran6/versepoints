CREATE OR REPLACE FUNCTION public.award_points_on_task_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award only once, only when verified
  IF NEW.status = 'verified'
     AND COALESCE(NEW.awarded, false) = false THEN

    -- Add points
    UPDATE users
    SET points_balance = COALESCE(points_balance, 0) + COALESCE(NEW.points_reward, 0)
    WHERE id = NEW.user_id;

    -- Mark awarded WITHOUT re-triggering
    UPDATE task_submissions
    SET awarded = true
    WHERE id = NEW.id
      AND awarded = false;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_points_on_verification
ON task_submissions;

CREATE TRIGGER trg_award_points_on_verification
AFTER UPDATE OF status
ON task_submissions
FOR EACH ROW
WHEN (NEW.status = 'verified')
EXECUTE FUNCTION public.award_points_on_task_verification();


CREATE OR REPLACE FUNCTION prevent_verified_status_revert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'verified' AND NEW.status <> 'verified' THEN
    RAISE EXCEPTION 'Verified submissions cannot be reverted';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_verified_revert
ON task_submissions;

CREATE TRIGGER trg_prevent_verified_revert
BEFORE UPDATE OF status
ON task_submissions
FOR EACH ROW
EXECUTE FUNCTION prevent_verified_status_revert();


ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow internal trigger point updates" ON users;

CREATE POLICY "allow service role to update points"
ON users
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
