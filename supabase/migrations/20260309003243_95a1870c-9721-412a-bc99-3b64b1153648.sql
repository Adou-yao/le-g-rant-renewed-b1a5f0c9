-- Function to check owner subscription status for managers (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_owner_subscription_status()
RETURNS TABLE (
  subscription_status text,
  days_left integer,
  is_expired boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner_id uuid;
  _status text;
  _end_date timestamptz;
  _trial_end timestamptz;
  _days integer;
  _expired boolean;
BEGIN
  -- Get the owner_id for this manager
  SELECT sm.owner_id INTO _owner_id
  FROM shop_managers sm
  WHERE sm.manager_id = auth.uid() AND sm.is_active = true
  LIMIT 1;

  -- If not a manager, check own profile (proprietaire case)
  IF _owner_id IS NULL THEN
    _owner_id := auth.uid();
  END IF;

  -- Get owner's subscription info
  SELECT p.subscription_status, p.subscription_end_date, p.date_fin_essai
  INTO _status, _end_date, _trial_end
  FROM profiles p
  WHERE p.user_id = _owner_id;

  -- Calculate days left and expiration status
  IF _status = 'active' AND _end_date IS NOT NULL THEN
    _days := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (_end_date - now())) / 86400));
    _expired := _end_date <= now();
  ELSIF _status = 'trial' AND _trial_end IS NOT NULL THEN
    _days := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (_trial_end - now())) / 86400));
    _expired := _trial_end <= now();
  ELSE
    _days := 0;
    _expired := true;
  END IF;

  RETURN QUERY SELECT _status, _days::integer, _expired;
END;
$$;

-- Function to check if current user's owner has active subscription (for RLS)
CREATE OR REPLACE FUNCTION public.owner_has_active_subscription()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner_id uuid;
  _status text;
  _end_date timestamptz;
  _trial_end timestamptz;
BEGIN
  -- Get the owner_id for this manager
  SELECT sm.owner_id INTO _owner_id
  FROM shop_managers sm
  WHERE sm.manager_id = auth.uid() AND sm.is_active = true
  LIMIT 1;

  -- If not a manager, check own profile
  IF _owner_id IS NULL THEN
    _owner_id := auth.uid();
  END IF;

  -- Get owner's subscription info
  SELECT p.subscription_status, p.subscription_end_date, p.date_fin_essai
  INTO _status, _end_date, _trial_end
  FROM profiles p
  WHERE p.user_id = _owner_id;

  -- Check if subscription is active
  IF _status = 'active' AND _end_date IS NOT NULL THEN
    RETURN _end_date > now();
  ELSIF _status = 'trial' AND _trial_end IS NOT NULL THEN
    RETURN _trial_end > now();
  END IF;

  RETURN false;
END;
$$;