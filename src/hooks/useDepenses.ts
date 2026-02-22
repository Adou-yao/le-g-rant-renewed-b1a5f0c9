import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Depense {
  id: string;
  description: string;
  montant: number;
  categorie: string;
  date_depense: string;
  created_at: string;
  user_id: string | null;
}

export type DepenseInsert = Omit<Depense, "id" | "created_at" | "user_id">;

export const CATEGORIES_DEPENSES = [
  "Transport",
  "Loyer",
  "Repas",
  "Électricité",
  "Téléphone",
  "Marchandise",
  "Autre",
] as const;

export function useDepenses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["depenses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("depenses")
        .select("*")
        .order("date_depense", { ascending: false });
      if (error) throw error;
      return data as Depense[];
    },
    enabled: !!user,
  });
}

export function useAddDepense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (depense: DepenseInsert) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("depenses")
        .insert({ ...depense, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
    },
  });
}

export function useDeleteDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("depenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
    },
  });
}
