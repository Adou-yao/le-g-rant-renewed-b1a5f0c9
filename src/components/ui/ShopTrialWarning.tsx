import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle } from "lucide-react";

export function ShopTrialWarning() {
  const { user } = useAuth();

  const { data: shopTrialDays } = useQuery({
    queryKey: ["manager-shop-trial", user?.id],
    queryFn: async () => {
      // Get the manager's shop
      const { data: managerRecord } = await supabase
        .from("shop_managers" as any)
        .select("shop_id")
        .eq("manager_id", user!.id)
        .eq("is_active", true)
        .single();

      if (!managerRecord) return null;

      const { data: shop } = await supabase
        .from("shops" as any)
        .select("date_fin_essai, subscription_status")
        .eq("id", (managerRecord as any).shop_id)
        .single();

      if (!shop) return null;
      const s = shop as any;
      if (s.subscription_status === "active") return null;
      if (!s.date_fin_essai) return null;

      const days = Math.ceil((new Date(s.date_fin_essai).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days;
    },
    enabled: !!user,
    staleTime: 60000,
  });

  if (shopTrialDays === null || shopTrialDays === undefined || shopTrialDays > 5) return null;

  if (shopTrialDays <= 0) {
    return (
      <div className="mx-4 mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
        <p className="text-xs text-destructive font-medium">
          La période d'essai de cette boutique est terminée. Contactez votre administrateur pour maintenir l'accès.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 p-3 rounded-xl bg-accent border border-border/50 flex items-center gap-3">
      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
      <p className="text-xs text-muted-foreground">
        Fin de la période de test dans <span className="font-bold text-foreground">{shopTrialDays} jour{shopTrialDays > 1 ? "s" : ""}</span>. Contactez votre administrateur pour maintenir l'accès.
      </p>
    </div>
  );
}
