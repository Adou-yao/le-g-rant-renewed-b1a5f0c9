
-- Add source column to stock_transfers to differentiate initial stock from reapprovisionnement
ALTER TABLE public.stock_transfers 
ADD COLUMN source text NOT NULL DEFAULT 'reapprovisionnement';

-- Update confirm_stock_transfer to include source in stock_movements
CREATE OR REPLACE FUNCTION public.confirm_stock_transfer(transfer_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

  -- Log audit trail with source type
  INSERT INTO stock_movements (produit_id, transfer_id, type, quantite, owner_id, manager_id, shop_id)
  VALUES (t.produit_id, transfer_id, t.source, t.quantite, t.owner_id, t.manager_id, t.shop_id);
END;
$$;
