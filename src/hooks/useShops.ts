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
  logo_url: string | null;
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

  const uploadLogo = async (file: File, shopId: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${shopId}.${ext}`;
    const { error } = await supabase.storage
      .from("shop-logos")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("shop-logos").getPublicUrl(path);
    return data.publicUrl;
  };

  const addShop = useMutation({
    mutationFn: async ({ logoFile, ...shop }: Omit<ShopInsert, "user_id"> & { logoFile?: File | null }) => {
      const { data, error } = await supabase
        .from("shops" as any)
        .insert({ ...shop, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      const created = data as unknown as Shop;

      if (logoFile) {
        const logoUrl = await uploadLogo(logoFile, created.id);
        const { error: updateError } = await supabase
          .from("shops" as any)
          .update({ logo_url: logoUrl } as any)
          .eq("id", created.id);
        if (updateError) throw updateError;
        created.logo_url = logoUrl;
      }

      return created;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shops"] }),
  });

  const updateShop = useMutation({
    mutationFn: async ({ id, logoFile, ...updates }: ShopUpdate & { id: string; logoFile?: File | null }) => {
      if (logoFile) {
        const logoUrl = await uploadLogo(logoFile, id);
        (updates as any).logo_url = logoUrl;
      }
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
