
-- Add has_used_trial to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_used_trial boolean NOT NULL DEFAULT false;

-- Mark existing users who already have shops as having used their trial
UPDATE public.profiles SET has_used_trial = true
WHERE user_id IN (SELECT DISTINCT user_id FROM public.shops);

-- Replace the trigger function to only grant trial for first shop
CREATE OR REPLACE FUNCTION public.set_shop_trial_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _has_used boolean;
BEGIN
  -- Check if owner already used their trial
  SELECT has_used_trial INTO _has_used FROM public.profiles WHERE user_id = NEW.user_id;
  
  IF _has_used IS TRUE THEN
    -- No trial: pending payment
    NEW.date_fin_essai := NULL;
    NEW.est_en_essai := false;
    NEW.subscription_status := 'pending_payment';
  ELSE
    -- First shop: grant 30-day trial
    NEW.date_fin_essai := now() + interval '30 days';
    NEW.est_en_essai := true;
    NEW.subscription_status := 'trial';
    -- Mark trial as used
    UPDATE public.profiles SET has_used_trial = true WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;
