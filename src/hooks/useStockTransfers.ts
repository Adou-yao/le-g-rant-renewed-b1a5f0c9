import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface StockTransfer {
  id: string;
  produit_id: string;
  owner_id: string;
  manager_id: string;
  shop_id: string;
  quantite: number;
  nouveau_prix_achat: number | null;
  statut: string;
  source: string;
  created_at: string;
  confirmed_at: string | null;
  updated_at: string;
}

export function useOwnerTransfers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stock-transfers-owner", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_transfers")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StockTransfer[];
    },
    enabled: !!user,
  });
}

export function useManagerPendingTransfers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stock-transfers-manager-pending", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_transfers")
        .select("*")
        .eq("manager_id", user!.id)
        .eq("statut", "en_attente")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StockTransfer[];
    },
    enabled: !!user,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transfer: {
      produit_id: string;
      owner_id: string;
      manager_id: string;
      shop_id: string;
      quantite: number;
      nouveau_prix_achat?: number | null;
      source?: string;
    }) => {
      const { data, error } = await supabase
        .from("stock_transfers")
        .insert(transfer)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers-owner"] });
    },
  });
}

export function useConfirmTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transferId: string) => {
      const { error } = await supabase.rpc("confirm_stock_transfer", {
        transfer_id: transferId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers-manager-pending"] });
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      queryClient.invalidateQueries({ queryKey: ["stock-transfers-owner"] });
    },
  });
}
