import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface OwnerSubscriptionStatus {
  subscriptionStatus: string;
  daysLeft: number;
  isExpired: boolean;
  isLoading: boolean;
}

/**
 * For managers: checks the shop's trial/subscription status (not global user).
 */
export function useOwnerSubscription(): OwnerSubscriptionStatus {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["shop-subscription-status", user?.id],
    queryFn: async () => {
      // Get manager's shop
      const { data: managerRecord } = await supabase
        .from("shop_managers" as any)
        .select("shop_id")
        .eq("manager_id", user!.id)
        .eq("is_active", true)
        .single();

      if (!managerRecord) return { subscription_status: "expired", days_left: 0, is_expired: true };

      const { data: shop } = await supabase
        .from("shops" as any)
        .select("date_fin_essai, subscription_status")
        .eq("id", (managerRecord as any).shop_id)
        .single();

      if (!shop) return { subscription_status: "expired", days_left: 0, is_expired: true };

      const s = shop as any;
      if (s.subscription_status === "active") {
        return { subscription_status: "active", days_left: 999, is_expired: false };
      }

      if (s.date_fin_essai) {
        const days = Math.ceil((new Date(s.date_fin_essai).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return {
          subscription_status: days > 0 ? "trial" : "expired",
          days_left: Math.max(0, days),
          is_expired: days <= 0,
        };
      }

      return { subscription_status: "trial", days_left: 30, is_expired: false };
    },
    enabled: !!user,
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  return {
    subscriptionStatus: data?.subscription_status || "trial",
    daysLeft: data?.days_left ?? 30,
    isExpired: data?.is_expired ?? false,
    isLoading,
  };
}
