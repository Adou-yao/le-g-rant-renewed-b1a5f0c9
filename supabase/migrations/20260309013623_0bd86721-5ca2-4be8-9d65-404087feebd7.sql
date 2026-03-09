-- Add trial columns to shops table
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS date_fin_essai timestamp with time zone DEFAULT (now() + interval '30 days'),
ADD COLUMN IF NOT EXISTS est_en_essai boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial';

-- Create function to auto-set trial end date on insert
CREATE OR REPLACE FUNCTION public.set_shop_trial_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.date_fin_essai := now() + interval '30 days';
  NEW.est_en_essai := true;
  NEW.subscription_status := 'trial';
  RETURN NEW;
END;
$$;

-- Create trigger for new shops
DROP TRIGGER IF EXISTS on_shop_created_set_trial ON public.shops;
CREATE TRIGGER on_shop_created_set_trial
  BEFORE INSERT ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.set_shop_trial_date();

-- Create table to track deleted shop names (anti-abuse)
CREATE TABLE IF NOT EXISTS public.deleted_shop_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shop_name text NOT NULL,
  deleted_at timestamp with time zone DEFAULT now(),
  cooldown_until timestamp with time zone DEFAULT (now() + interval '30 days')
);

ALTER TABLE public.deleted_shop_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deleted names" ON public.deleted_shop_names
  FOR SELECT USING (user_id = auth.uid());

-- Function to track deleted shop names
CREATE OR REPLACE FUNCTION public.track_deleted_shop()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.deleted_shop_names (user_id, shop_name)
  VALUES (OLD.user_id, LOWER(TRIM(OLD.nom)));
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_shop_deleted_track ON public.shops;
CREATE TRIGGER on_shop_deleted_track
  BEFORE DELETE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.track_deleted_shop();

-- Function to prevent abuse on shop creation
CREATE OR REPLACE FUNCTION public.check_shop_name_abuse()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.deleted_shop_names
    WHERE user_id = NEW.user_id 
    AND shop_name = LOWER(TRIM(NEW.nom))
    AND cooldown_until > now()
  ) THEN
    RAISE EXCEPTION 'Ce nom de boutique ne peut pas être réutilisé avant 30 jours';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_shop_check_abuse ON public.shops;
CREATE TRIGGER on_shop_check_abuse
  BEFORE INSERT ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.check_shop_name_abuse();

-- Function to check if shop has active subscription
CREATE OR REPLACE FUNCTION public.shop_has_active_subscription(_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shops
    WHERE id = _shop_id
    AND (
      subscription_status = 'active'
      OR (est_en_essai = true AND date_fin_essai > now())
    )
  );
$$;