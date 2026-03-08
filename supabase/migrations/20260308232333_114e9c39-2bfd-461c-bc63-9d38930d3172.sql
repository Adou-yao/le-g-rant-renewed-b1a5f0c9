
-- Function for owner to create a product assigned to a manager, with optional initial stock transfer
CREATE OR REPLACE FUNCTION public.create_product_for_manager(
  _manager_id uuid,
  _shop_id uuid,
  _nom text,
  _prix_achat numeric,
  _prix_vente numeric,
  _stock_initial integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _owner_id uuid;
  _product_id uuid;
BEGIN
  _owner_id := auth.uid();
  
  -- Verify the caller owns this manager
  IF NOT EXISTS (
    SELECT 1 FROM shop_managers 
    WHERE owner_id = _owner_id AND manager_id = _manager_id AND shop_id = _shop_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this manager/shop';
  END IF;

  -- Create the product with stock=0 (assigned to manager)
  INSERT INTO produits (user_id, nom, prix_achat, prix_vente, stock_actuel)
  VALUES (_manager_id, _nom, _prix_achat, _prix_vente, 0)
  RETURNING id INTO _product_id;

  -- If initial stock > 0, create a pending transfer
  IF _stock_initial > 0 THEN
    INSERT INTO stock_transfers (produit_id, owner_id, manager_id, shop_id, quantite, source)
    VALUES (_product_id, _owner_id, _manager_id, _shop_id, _stock_initial, 'initial');
  END IF;

  RETURN _product_id;
END;
$$;
