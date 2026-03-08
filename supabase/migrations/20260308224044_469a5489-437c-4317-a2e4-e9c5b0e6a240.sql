
-- Allow owners to view their managers' sales
CREATE POLICY "Owners can view manager sales"
ON public.ventes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shop_managers
    WHERE shop_managers.owner_id = auth.uid()
    AND shop_managers.manager_id = ventes.user_id
    AND shop_managers.is_active = true
  )
);

-- Allow owners to view their managers' products
CREATE POLICY "Owners can view manager products"
ON public.produits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shop_managers
    WHERE shop_managers.owner_id = auth.uid()
    AND shop_managers.manager_id = produits.user_id
    AND shop_managers.is_active = true
  )
);

-- Allow owners to view their managers' debts
CREATE POLICY "Owners can view manager debts"
ON public.dettes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shop_managers
    WHERE shop_managers.owner_id = auth.uid()
    AND shop_managers.manager_id = dettes.user_id
    AND shop_managers.is_active = true
  )
);

-- Allow owners to view their managers' expenses
CREATE POLICY "Owners can view manager expenses"
ON public.depenses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shop_managers
    WHERE shop_managers.owner_id = auth.uid()
    AND shop_managers.manager_id = depenses.user_id
    AND shop_managers.is_active = true
  )
);
