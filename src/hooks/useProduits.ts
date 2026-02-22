import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Produit {
  id: string;
  user_id: string;
  nom: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  description: string | null;
  categorie: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProduitInsert {
  nom: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel?: number;
  description?: string | null;
  categorie?: string | null;
  image_url?: string | null;
}

export function useProduits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["produits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produits")
        .select("*")
        .order("nom");
      if (error) throw error;
      return data as Produit[];
    },
    enabled: !!user,
  });
}

export function useAddProduit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (produit: ProduitInsert) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("produits")
        .insert({ ...produit, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });
}

export function useUpdateProduitStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stock_actuel }: { id: string; stock_actuel: number }) => {
      const { data, error } = await supabase
        .from("produits")
        .update({ stock_actuel })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });
}
