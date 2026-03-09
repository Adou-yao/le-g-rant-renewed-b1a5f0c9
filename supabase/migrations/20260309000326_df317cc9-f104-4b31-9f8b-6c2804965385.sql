-- Drop the existing constraint and recreate with all valid statuses
ALTER TABLE public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_statut_check;

ALTER TABLE public.stock_transfers ADD CONSTRAINT stock_transfers_statut_check 
CHECK (statut IN ('en_attente', 'reçu', 'refusé', 'annulé'));