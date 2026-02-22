import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Store, Check, Crown, ArrowLeft, Sparkles, BadgePercent, Shield } from "lucide-react";
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
    <div className="min-h-screen gradient-mesh pb-8 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-accent/8 blur-3xl translate-y-1/3 -translate-x-1/4" />

      <header className="relative px-5 pt-8 pb-6 safe-top">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-2xl mb-4 glass">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-3xl gradient-hero opacity-30 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl gradient-hero shadow-2xl flex items-center justify-center animate-float">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-display text-gradient mb-2">Abonnement</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Débloquez toutes les fonctionnalités de Le Gérant
          </p>
        </div>
      </header>

      <div className="relative px-5 mb-6">
        <div className="glass-strong rounded-2xl p-4 text-center premium-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-bold text-accent">30 jours d'essai gratuit</span>
          </div>
          <p className="text-sm text-muted-foreground">Profitez de toutes les fonctionnalités sans engagement</p>
        </div>
      </div>

      <div className="relative px-5 space-y-4">
        {plans.map((plan, idx) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-6 transition-all duration-500 animate-slide-up ${
              plan.popular
                ? "gradient-primary text-white glow-primary"
                : "glass-strong card-shadow-xl"
            }`}
            style={{ animationDelay: `${idx * 100 + 200}ms` }}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-warning text-warning-foreground text-xs font-bold shadow-lg">
                <Crown className="h-3 w-3" />
                Meilleure offre
              </div>
            )}

            {plan.popular && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
            )}

            <div className="relative text-center mb-6">
              <h3 className={`text-lg font-bold mb-2 ${plan.popular ? 'text-white' : 'text-foreground'}`}>{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-4xl font-display ${plan.popular ? 'text-white' : 'text-gradient'}`}>
                  {plan.price.toLocaleString("fr-CI")}
                </span>
                <span className={`text-sm ${plan.popular ? 'text-white/70' : 'text-muted-foreground'}`}>FCFA {plan.period}</span>
              </div>
              {"savings" in plan && plan.savings && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-warning bg-warning/15 px-3 py-1 rounded-full">
                  <BadgePercent className="h-3 w-3" />
                  {plan.savings}
                </span>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-white/20' : 'bg-accent/10'}`}>
                    <Check className={`h-3 w-3 ${plan.popular ? 'text-white' : 'text-accent'}`} />
                  </div>
                  <span className={plan.popular ? 'text-white/90' : 'text-foreground'}>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe(plan)}
              className={`w-full h-14 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                plan.popular
                  ? "bg-white text-primary hover:bg-white/90 shadow-xl"
                  : "gradient-primary text-white glow-primary"
              }`}
            >
              Souscrire
            </Button>
          </div>
        ))}
      </div>

      <div className="relative px-5 mt-8">
        <div className="glass-strong rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-foreground">Paiement 100% sécurisé</span>
          </div>
          <p className="text-xs text-muted-foreground">
            via <span className="font-semibold text-foreground">Paystack</span> • Wave, Orange Money, MTN MoMo
          </p>
        </div>
      </div>
    </div>
  );
}
