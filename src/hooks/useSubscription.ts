import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface SubscriptionState {
  isLoading: boolean;
  isReadOnly: boolean;
  daysLeft: number | null;
  subscriptionStatus: "trial" | "active" | "expired";
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const { isProprietaire, isGerant } = useUserRole();
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    isReadOnly: false,
    daysLeft: null,
    subscriptionStatus: "trial",
  });

  useEffect(() => {
    if (!user) {
      setState({ isLoading: false, isReadOnly: true, daysLeft: null, subscriptionStatus: "expired" });
      return;
    }

    // Owner account is always free — no read-only for owners
    if (isProprietaire) {
      setState({ isLoading: false, isReadOnly: false, daysLeft: null, subscriptionStatus: "active" });
      return;
    }

    // For managers, check their shop's trial status
    if (isGerant) {
      const checkShopTrial = async () => {
        const { data: managerRecord } = await supabase
          .from("shop_managers" as any)
          .select("shop_id")
          .eq("manager_id", user.id)
          .eq("is_active", true)
          .single();

        if (!managerRecord) {
          setState({ isLoading: false, isReadOnly: true, daysLeft: 0, subscriptionStatus: "expired" });
          return;
        }

        const { data: shop } = await supabase
          .from("shops" as any)
          .select("date_fin_essai, subscription_status")
          .eq("id", (managerRecord as any).shop_id)
          .single();

        if (!shop) {
          setState({ isLoading: false, isReadOnly: true, daysLeft: 0, subscriptionStatus: "expired" });
          return;
        }

        const s = shop as any;
        if (s.subscription_status === "active") {
          setState({ isLoading: false, isReadOnly: false, daysLeft: null, subscriptionStatus: "active" });
          return;
        }

        if (s.date_fin_essai) {
          const days = Math.ceil((new Date(s.date_fin_essai).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (days > 0) {
            setState({ isLoading: false, isReadOnly: false, daysLeft: days, subscriptionStatus: "trial" });
          } else {
            setState({ isLoading: false, isReadOnly: true, daysLeft: 0, subscriptionStatus: "expired" });
          }
          return;
        }

        setState({ isLoading: false, isReadOnly: false, daysLeft: 30, subscriptionStatus: "trial" });
      };

      checkShopTrial();
      return;
    }

    // Fallback
    setState({ isLoading: false, isReadOnly: false, daysLeft: null, subscriptionStatus: "trial" });
  }, [user, isProprietaire, isGerant]);

  return state;
}
