import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionState {
  isLoading: boolean;
  isReadOnly: boolean;
  daysLeft: number | null;
  subscriptionStatus: "trial" | "active" | "expired";
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
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

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("date_fin_essai, subscription_status, subscription_end_date")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setState({ isLoading: false, isReadOnly: false, daysLeft: 30, subscriptionStatus: "trial" });
        return;
      }

      const now = new Date();
      const status = data.subscription_status as "trial" | "active" | "expired";

      if (status === "active" && data.subscription_end_date) {
        const subEnd = new Date(data.subscription_end_date);
        if (subEnd > now) {
          const days = Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setState({ isLoading: false, isReadOnly: false, daysLeft: days, subscriptionStatus: "active" });
          return;
        }
        // Subscription expired
        setState({ isLoading: false, isReadOnly: true, daysLeft: 0, subscriptionStatus: "expired" });
        return;
      }

      if (status === "trial" && data.date_fin_essai) {
        const trialEnd = new Date(data.date_fin_essai);
        const days = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          setState({ isLoading: false, isReadOnly: false, daysLeft: days, subscriptionStatus: "trial" });
        } else {
          setState({ isLoading: false, isReadOnly: true, daysLeft: 0, subscriptionStatus: "expired" });
        }
        return;
      }

      // Fallback: no trial date set, grant access
      setState({ isLoading: false, isReadOnly: false, daysLeft: null, subscriptionStatus: "trial" });
    };

    fetchProfile();
  }, [user]);

  return state;
}
