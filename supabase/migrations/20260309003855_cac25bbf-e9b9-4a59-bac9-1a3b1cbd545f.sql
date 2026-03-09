-- Add subscription check to INSERT policies for main tables

-- VENTES: Block inserts when subscription expired
DROP POLICY IF EXISTS "Users can insert own sales" ON public.ventes;
CREATE POLICY "Users can insert own sales" 
ON public.ventes 
FOR INSERT 
WITH CHECK (
  user_owns_resource(user_id) 
  AND owner_has_active_subscription()
);

-- DETTES: Block inserts when subscription expired
DROP POLICY IF EXISTS "Users can insert own debts" ON public.dettes;
CREATE POLICY "Users can insert own debts" 
ON public.dettes 
FOR INSERT 
WITH CHECK (
  user_owns_resource(user_id) 
  AND owner_has_active_subscription()
);

-- DEPENSES: Block inserts when subscription expired
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.depenses;
CREATE POLICY "Users can insert own expenses" 
ON public.depenses 
FOR INSERT 
WITH CHECK (
  user_owns_resource(user_id) 
  AND owner_has_active_subscription()
);

-- PRODUITS: Block inserts and updates when subscription expired
DROP POLICY IF EXISTS "Users can insert own products" ON public.produits;
CREATE POLICY "Users can insert own products" 
ON public.produits 
FOR INSERT 
WITH CHECK (
  user_owns_resource(user_id) 
  AND owner_has_active_subscription()
);

DROP POLICY IF EXISTS "Users can update own products" ON public.produits;
CREATE POLICY "Users can update own products" 
ON public.produits 
FOR UPDATE 
USING (user_owns_resource(user_id))
WITH CHECK (owner_has_active_subscription());

-- INVENTAIRES: Block inserts when subscription expired
DROP POLICY IF EXISTS "Managers can insert inventaires" ON public.inventaires;
CREATE POLICY "Managers can insert inventaires" 
ON public.inventaires 
FOR INSERT 
WITH CHECK (
  manager_id = auth.uid() 
  AND owner_has_active_subscription()
);

-- INVENTAIRE_ITEMS: Block inserts when subscription expired
DROP POLICY IF EXISTS "Users can insert inventaire_items" ON public.inventaire_items;
CREATE POLICY "Users can insert inventaire_items" 
ON public.inventaire_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM inventaires
    WHERE inventaires.id = inventaire_items.inventaire_id 
    AND inventaires.manager_id = auth.uid()
  )
  AND owner_has_active_subscription()
);

-- STOCK_TRANSFERS: Block updates (confirmations) when subscription expired
DROP POLICY IF EXISTS "Managers can update own transfers" ON public.stock_transfers;
CREATE POLICY "Managers can update own transfers" 
ON public.stock_transfers 
FOR UPDATE 
USING (manager_id = auth.uid())
WITH CHECK (owner_has_active_subscription());