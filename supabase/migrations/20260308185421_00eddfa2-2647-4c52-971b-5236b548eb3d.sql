
-- Add must_change_password to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Create shop_managers table to link gérants to shops
CREATE TABLE public.shop_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  manager_id uuid NOT NULL,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  manager_name text NOT NULL,
  manager_whatsapp text NOT NULL DEFAULT '',
  manager_email text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS policies for shop_managers
CREATE POLICY "Owners can view own managers" ON public.shop_managers
  FOR SELECT USING (user_owns_resource(owner_id));

CREATE POLICY "Owners can insert own managers" ON public.shop_managers
  FOR INSERT WITH CHECK (user_owns_resource(owner_id));

CREATE POLICY "Owners can update own managers" ON public.shop_managers
  FOR UPDATE USING (user_owns_resource(owner_id));

CREATE POLICY "Owners can delete own managers" ON public.shop_managers
  FOR DELETE USING (user_owns_resource(owner_id));

-- Managers can read their own record
CREATE POLICY "Managers can view own record" ON public.shop_managers
  FOR SELECT USING (user_owns_resource(manager_id));

-- Trigger for updated_at
CREATE TRIGGER update_shop_managers_updated_at
  BEFORE UPDATE ON public.shop_managers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
