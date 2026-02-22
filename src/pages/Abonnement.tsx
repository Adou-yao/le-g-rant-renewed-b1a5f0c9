import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Store, Check, Crown, ArrowLeft, Sparkles, BadgePercent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { initierPaystackPayment } from "@/lib/paystack";
import { supabase } from "@/integrations/supabase/client";

export default function Abonnement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: "Mensuel",
      price: 2500,
      period: "/ mois",
      planCode: "PLN_aose5g4tjg9ftra",
      features: [
        "Gestion illimitée des produits",
        "Suivi des ventes en temps réel",
        "Cahier de dettes",
        "Statistiques détaillées",
        "Support WhatsApp",
      ],
      popular: false,
    },
    {
      name: "Annuel",
      price: 22000,
      period: "/ an",
      planCode: "PLN_e7jojf3weqcxxz",
      features: [
        "Tout le plan Mensuel",
        "Économisez 8 000 FCFA",
        "Rapports avancés",
        "Alertes de stock",
        "Support prioritaire",
      ],
      popular: true,
      savings: "Économie de 8 000 F",
    },
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    console.log("Ouverture Paystack...", { email: user?.email, plan: plan.name });
    if (!user?.email) {
      toast.error("Veuillez vous connecter pour souscrire");
      return;
    }

    initierPaystackPayment({
      amount: plan.price,
      email: user.email,
      planCode: plan.planCode,
      metadata: {
        plan: plan.name,
        vendeur_id: user.id,
      },
      callback: async (response) => {
        // Update subscription in Supabase
        const endDate = new Date();
        if (plan.name === "Annuel") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            subscription_end_date: endDate.toISOString(),
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("Erreur mise à jour abonnement:", error);
          toast.error("Paiement reçu mais erreur de mise à jour. Contactez le support.");
        } else {
          toast.success(`🎉 Abonnement ${plan.name} activé avec succès !`);
          navigate("/");
        }
      },
      onClose: () => {
        toast.info("Paiement annulé");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-8">
      <header className="px-4 pt-8 pb-6 safe-top">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-2xl mb-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-success via-primary to-success opacity-20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-success to-primary shadow-xl flex items-center justify-center">
              <Store className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">Abonnement</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Débloquez toutes les fonctionnalités de Le Gérant
          </p>
        </div>
      </header>

      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/20 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-success" />
            <span className="font-bold text-success">30 jours d'essai gratuit</span>
          </div>
          <p className="text-sm text-muted-foreground">Profitez de toutes les fonctionnalités sans engagement</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-6 card-shadow-lg transition-all duration-300 ${
              plan.popular
                ? "bg-gradient-to-br from-primary/5 to-success/5 border-2 border-primary/30"
                : "bg-card border border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                <Crown className="h-3 w-3" />
                Meilleure offre
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold font-display text-primary">
                  {plan.price.toLocaleString("fr-CI")}
                </span>
                <span className="text-muted-foreground text-sm">FCFA {plan.period}</span>
              </div>
              {"savings" in plan && plan.savings && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-success bg-success/10 px-3 py-1 rounded-full">
                  <BadgePercent className="h-3 w-3" />
                  {plan.savings}
                </span>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-success" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe(plan)}
              className={`w-full h-14 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                plan.popular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Souscrire
            </Button>
          </div>
        ))}
      </div>

      <div className="px-4 mt-8">
        <div className="bg-muted/50 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Paiement sécurisé via <span className="font-semibold text-foreground">Paystack</span> • Wave, Orange Money, MTN MoMo
          </p>
        </div>
      </div>
    </div>
  );
}
