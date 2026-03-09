import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface OwnerSubscriptionStatus {
  subscriptionStatus: string;
  daysLeft: number;
  isExpired: boolean;
  isLoading: boolean;
}

export function useOwnerSubscription(): OwnerSubscriptionStatus {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["owner-subscription-status", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_owner_subscription_status");
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: true,
  });

  return {
    subscriptionStatus: data?.subscription_status || "trial",
    daysLeft: data?.days_left ?? 30,
    isExpired: data?.is_expired ?? false,
    isLoading,
  };
}
