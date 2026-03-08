import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Manager {
  id: string;
  owner_id: string;
  manager_id: string;
  shop_id: string;
  manager_name: string;
  manager_whatsapp: string;
  manager_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useManagers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const managersQuery = useQuery({
    queryKey: ["managers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_managers" as any)
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Manager[];
    },
    enabled: !!user,
  });

  const createManager = useMutation({
    mutationFn: async (payload: {
      full_name: string;
      whatsapp: string;
      email: string;
      password: string;
      shop_id: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("create-manager", {
        body: payload,
      });
      if (error) {
        let msg = "Erreur lors de la création du gérant";
        try {
          if (error.context && typeof error.context === "object" && "json" in error.context) {
            const body = await (error.context as Response).json();
            msg = body?.error || msg;
          } else {
            msg = error.message || msg;
          }
        } catch {
          /* use default msg */
        }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["managers"] }),
  });

  const toggleManagerActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("shop_managers" as any)
        .update({ is_active } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["managers"] }),
  });

  const deleteManager = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("shop_managers" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["managers"] }),
  });

  return {
    managers: managersQuery.data ?? [],
    isLoading: managersQuery.isLoading,
    createManager,
    toggleManagerActive,
    deleteManager,
  };
}
