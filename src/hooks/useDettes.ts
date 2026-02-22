import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Dette {
  id: string;
  user_id: string;
  nom_client: string;
  telephone_client: string | null;
  montant_du: number;
  description: string | null;
  payee: boolean;
  date_echeance: string | null;
  created_at: string;
  updated_at: string;
}

export interface DetteInsert {
  nom_client: string;
  telephone_client?: string | null;
  montant_du: number;
}

export function useDettes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dettes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dettes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Dette[];
    },
    enabled: !!user,
  });
}

export function useAddDette() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (dette: DetteInsert) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("dettes")
        .insert({ ...dette, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dettes"] });
    },
  });
}

export function useRemoveDette() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dettes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dettes"] });
    },
  });
}
