
-- Table des bilans d'inventaire
CREATE TABLE public.inventaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  statut text NOT NULL DEFAULT 'soumis' CHECK (statut IN ('soumis', 'validé')),
  created_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.inventaires ENABLE ROW LEVEL SECURITY;

-- Lignes d'inventaire
CREATE TABLE public.inventaire_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventaire_id uuid NOT NULL REFERENCES public.inventaires(id) ON DELETE CASCADE,
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  stock_theorique integer NOT NULL,
  stock_physique integer NOT NULL,
  ecart integer GENERATED ALWAYS AS (stock_physique - stock_theorique) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventaire_items ENABLE ROW LEVEL SECURITY;

-- RLS inventaires
CREATE POLICY "Managers can insert inventaires" ON public.inventaires
  FOR INSERT WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Managers can view own inventaires" ON public.inventaires
  FOR SELECT USING (manager_id = auth.uid());

CREATE POLICY "Owners can view their inventaires" ON public.inventaires
  FOR SELECT USING (owner_id = auth.uid());

-- RLS inventaire_items
CREATE POLICY "Users can insert inventaire_items" ON public.inventaire_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.inventaires WHERE id = inventaire_id AND manager_id = auth.uid())
  );

CREATE POLICY "Managers can view own inventaire_items" ON public.inventaire_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.inventaires WHERE id = inventaire_id AND manager_id = auth.uid())
  );

CREATE POLICY "Owners can view their inventaire_items" ON public.inventaire_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.inventaires WHERE id = inventaire_id AND owner_id = auth.uid())
  );
