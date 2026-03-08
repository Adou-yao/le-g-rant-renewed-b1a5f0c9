
-- Table des transferts de stock (double validation)
CREATE TABLE public.stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  manager_id uuid NOT NULL,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  quantite integer NOT NULL CHECK (quantite > 0),
  nouveau_prix_achat numeric,
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'reçu', 'annulé')),
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

-- Table d'audit des mouvements de stock
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  transfer_id uuid REFERENCES public.stock_transfers(id),
  type text NOT NULL DEFAULT 'reapprovisionnement',
  quantite integer NOT NULL,
  owner_id uuid NOT NULL,
  manager_id uuid NOT NULL,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS: Owners can see their transfers
CREATE POLICY "Owners can view own transfers" ON public.stock_transfers
  FOR SELECT USING (owner_id = auth.uid());

-- RLS: Managers can see transfers addressed to them
CREATE POLICY "Managers can view own transfers" ON public.stock_transfers
  FOR SELECT USING (manager_id = auth.uid());

-- RLS: Owners can insert transfers
CREATE POLICY "Owners can insert transfers" ON public.stock_transfers
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- RLS: Managers can update transfers (to confirm)
CREATE POLICY "Managers can update own transfers" ON public.stock_transfers
  FOR UPDATE USING (manager_id = auth.uid());

-- RLS: stock_movements - owners can view
CREATE POLICY "Owners can view own movements" ON public.stock_movements
  FOR SELECT USING (owner_id = auth.uid());

-- RLS: stock_movements - managers can view
CREATE POLICY "Managers can view own movements" ON public.stock_movements
  FOR SELECT USING (manager_id = auth.uid());

-- RLS: stock_movements - only inserted via function/trigger
CREATE POLICY "System can insert movements" ON public.stock_movements
  FOR INSERT WITH CHECK (manager_id = auth.uid());

-- Function: confirm transfer, update stock, log movement
CREATE OR REPLACE FUNCTION public.confirm_stock_transfer(transfer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t record;
BEGIN
  SELECT * INTO t FROM stock_transfers WHERE id = transfer_id AND statut = 'en_attente';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer not found or already processed';
  END IF;
  
  IF t.manager_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the assigned manager can confirm this transfer';
  END IF;

  -- Update transfer status
  UPDATE stock_transfers SET statut = 'reçu', confirmed_at = now(), updated_at = now() WHERE id = transfer_id;

  -- Update product stock
  UPDATE produits SET stock_actuel = stock_actuel + t.quantite, updated_at = now() WHERE id = t.produit_id;

  -- Update prix_achat if provided
  IF t.nouveau_prix_achat IS NOT NULL THEN
    UPDATE produits SET prix_achat = t.nouveau_prix_achat WHERE id = t.produit_id;
  END IF;

  -- Log audit trail
  INSERT INTO stock_movements (produit_id, transfer_id, type, quantite, owner_id, manager_id, shop_id)
  VALUES (t.produit_id, transfer_id, 'reapprovisionnement', t.quantite, t.owner_id, t.manager_id, t.shop_id);
END;
$$;
