import { Clock, Crown, Sparkles } from "lucide-react";
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
        className="mx-5 mb-4 p-4 rounded-2xl glass-strong border-destructive/20 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg"
      >
        <div className="p-2.5 rounded-xl bg-destructive/10">
          <Crown className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-destructive">Essai terminé</p>
          <p className="text-xs text-muted-foreground">Abonnez-vous pour continuer</p>
        </div>
        <span className="text-xs font-bold text-white gradient-primary px-4 py-2 rounded-full whitespace-nowrap shadow-md">
          S'abonner
        </span>
      </div>
    );
  }

  if (daysLeft === null) return null;

  return (
    <div
      onClick={() => navigate("/abonnement")}
      className="mx-5 mb-4 p-4 rounded-2xl glass-strong flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg premium-border"
    >
      <div className="p-2.5 rounded-xl gradient-warm glow-warm">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <p className="text-sm text-foreground flex-1">
        <span className="font-bold text-warning">{daysLeft} jour{daysLeft > 1 ? "s" : ""}</span>{" "}
        d'essai restant{daysLeft > 1 ? "s" : ""}
      </p>
      <span className="text-xs font-bold text-white gradient-primary px-4 py-2 rounded-full whitespace-nowrap shadow-md">
        Voir les plans
      </span>
    </div>
  );
}
