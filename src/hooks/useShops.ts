import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Shop {
  id: string;
  user_id: string;
  nom: string;
  localisation: string;
  whatsapp: string;
  type_commerce: string;
  created_at: string;
  updated_at: string;
}

export type ShopInsert = Omit<Shop, "id" | "created_at" | "updated_at">;
export type ShopUpdate = Partial<Omit<Shop, "id" | "user_id" | "created_at" | "updated_at">>;

export function useShops() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const shopsQuery = useQuery({
    queryKey: ["shops", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Shop[];
    },
    enabled: !!user,
  });

  const addShop = useMutation({
    mutationFn: async (shop: Omit<ShopInsert, "user_id">) => {
      const { data, error } = await supabase
        .from("shops" as any)
        .insert({ ...shop, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Shop;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shops"] }),
  });

  const updateShop = useMutation({
    mutationFn: async ({ id, ...updates }: ShopUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("shops" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Shop;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shops"] }),
  });

  const deleteShop = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("shops" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shops"] }),
  });

  return {
    shops: shopsQuery.data ?? [],
    isLoading: shopsQuery.isLoading,
    addShop,
    updateShop,
    deleteShop,
  };
}
