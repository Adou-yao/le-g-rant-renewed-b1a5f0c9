-- Update reject_stock_transfer to delete product if source is 'initial'
CREATE OR REPLACE FUNCTION public.reject_stock_transfer(transfer_id uuid, reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  t record;
BEGIN
  SELECT * INTO t FROM stock_transfers WHERE id = transfer_id AND statut = 'en_attente';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer not found or already processed';
  END IF;
  
  IF t.manager_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the assigned manager can reject this transfer';
  END IF;

  -- Update transfer status to rejected
  UPDATE stock_transfers 
  SET statut = 'refusé', 
      rejection_reason = reason, 
      updated_at = now() 
  WHERE id = transfer_id;

  -- If this was an initial stock transfer, delete the product entirely
  IF t.source = 'initial' THEN
    DELETE FROM produits WHERE id = t.produit_id;
  END IF;
END;
$function$;