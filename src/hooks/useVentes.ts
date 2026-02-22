import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Vente {
  id: string;
  user_id: string;
  produit_id: string | null;
  nom_produit: string | null;
  nom_client: string | null;
  quantite: number;
  montant_total: number;
  mode_paiement: string;
  est_credit: boolean;
  date_vente: string;
  created_at: string;
}

export interface VenteInsert {
  produit_id: string;
  nom_produit: string;
  quantite: number;
  montant_total: number;
  mode_paiement: string;
  est_credit?: boolean;
  nom_client?: string | null;
}

export function useVentes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ventes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ventes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Vente[];
    },
    enabled: !!user,
  });
}

export function useAddVente() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (vente: VenteInsert) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("ventes")
        .insert({ ...vente, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
    },
  });
}
