
begin
  -- Apply points
  update public.users u
  set
    points_balance = u.points_balance + ms.points_earned,
    total_mined    = u.total_mined + ms.points_earned,
    is_mining      = false
  from public.mining_sessions ms
  where
    ms.user_id = u.id
    and ms.credited = false
    and ms.is_active = true
    and ms.ends_at <= now();

  -- Close & mark sessions
  update public.mining_sessions
  set
    credited = true,
    credited_at = now(),
    is_active = false
  where
    credited = false
    and is_active = true
    and ends_at <= now();
end;
