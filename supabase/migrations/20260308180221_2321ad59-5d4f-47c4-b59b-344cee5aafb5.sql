
CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nom text NOT NULL,
  localisation text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  type_commerce text NOT NULL DEFAULT 'Autre',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shops" ON public.shops
  FOR SELECT USING (user_owns_resource(user_id));

CREATE POLICY "Users can insert own shops" ON public.shops
  FOR INSERT WITH CHECK (user_owns_resource(user_id));

CREATE POLICY "Users can update own shops" ON public.shops
  FOR UPDATE USING (user_owns_resource(user_id));

CREATE POLICY "Users can delete own shops" ON public.shops
  FOR DELETE USING (user_owns_resource(user_id));

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
