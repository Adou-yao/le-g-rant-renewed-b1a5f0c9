import { Clock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrialBannerProps {
  daysLeft: number | null;
  subscriptionStatus: "trial" | "active" | "expired";
}

export function TrialBanner({ daysLeft, subscriptionStatus }: TrialBannerProps) {
  const navigate = useNavigate();

  if (subscriptionStatus === "active") return null;

  if (subscriptionStatus === "expired") {
    return (
      <div
        onClick={() => navigate("/abonnement")}
        className="mx-4 mb-4 p-3 rounded-2xl bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="p-2 rounded-xl bg-destructive/10">
          <Crown className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive">Essai terminé</p>
          <p className="text-xs text-muted-foreground">Abonnez-vous pour continuer</p>
        </div>
        <span className="text-xs font-bold text-destructive bg-destructive/10 px-3 py-1.5 rounded-full whitespace-nowrap">
          S'abonner
        </span>
      </div>
    );
  }

  if (daysLeft === null) return null;

  return (
    <div
      onClick={() => navigate("/abonnement")}
      className="mx-4 mb-4 p-3 rounded-2xl bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="p-2 rounded-xl bg-warning/10">
        <Clock className="h-4 w-4 text-warning" />
      </div>
      <p className="text-sm text-foreground flex-1">
        <span className="font-semibold text-warning">{daysLeft} jour{daysLeft > 1 ? "s" : ""}</span>{" "}
        d'essai restant{daysLeft > 1 ? "s" : ""}
      </p>
      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full whitespace-nowrap">
        Voir les plans
      </span>
    </div>
  );
}
