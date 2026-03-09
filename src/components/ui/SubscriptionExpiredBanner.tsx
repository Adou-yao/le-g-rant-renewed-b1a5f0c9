import { AlertTriangle, Phone } from "lucide-react";

export function SubscriptionExpiredBanner() {
  return (
    <div className="mx-4 mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/30">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-destructive/20 shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-destructive mb-1">
            Mode Consultation Uniquement
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            L'abonnement de votre boutique a expiré. Veuillez contacter le propriétaire pour réactiver les fonctionnalités de vente et d'inventaire.
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>Contactez votre propriétaire</span>
          </div>
        </div>
      </div>
    </div>
  );
}
