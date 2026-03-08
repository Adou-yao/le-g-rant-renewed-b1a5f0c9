import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface InventaireItem {
  produit_id: string;
  stock_theorique: number;
  stock_physique: number;
}

export function useSubmitInventaire() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      shopId,
      ownerId,
      items,
    }: {
      shopId: string;
      ownerId: string;
      items: InventaireItem[];
    }) => {
      if (!user) throw new Error("Non authentifié");

      // Create inventaire header
      const { data: inv, error: invErr } = await supabase
        .from("inventaires")
        .insert({
          manager_id: user.id,
          shop_id: shopId,
          owner_id: ownerId,
        })
        .select()
        .single();
      if (invErr) throw invErr;

      // Insert all items
      const itemsToInsert = items.map((item) => ({
        inventaire_id: inv.id,
        produit_id: item.produit_id,
        stock_theorique: item.stock_theorique,
        stock_physique: item.stock_physique,
      }));

      const { error: itemsErr } = await supabase
        .from("inventaire_items")
        .insert(itemsToInsert);
      if (itemsErr) throw itemsErr;

      return inv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventaires"] });
    },
  });
}

export function useOwnerInventaires() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["inventaires-owner", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventaires")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useInventaireItems(inventaireId: string | null) {
  return useQuery({
    queryKey: ["inventaire-items", inventaireId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventaire_items")
        .select("*")
        .eq("inventaire_id", inventaireId!);
      if (error) throw error;
      return data;
    },
    enabled: !!inventaireId,
  });
}
