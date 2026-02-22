import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function showReadOnlyAlert() {
  toast.error("Essai terminé. Abonnez-vous pour continuer à enregistrer vos opérations.", {
    duration: 4000,
    action: {
      label: "S'abonner",
      onClick: () => {
        window.location.href = "/abonnement";
      },
    },
  });
}
