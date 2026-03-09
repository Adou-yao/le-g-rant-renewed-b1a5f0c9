import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShops, type Shop } from "@/hooks/useShops";
import { Button } from "@/components/ui/button";
import { Store, Check, Crown, ArrowLeft, Sparkles, BadgePercent, Shield, Clock, CreditCard } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { initierPaystackPayment } from "@/lib/paystack";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Abonnement() {
  const { user } = useAuth();
  const { shops, isLoading } = useShops();
  const navigate = useNavigate();
  const [selectedShopId, setSelectedShopId] = useState<string>("");

  const selectedShop = shops.find(s => s.id === selectedShopId);

  const getShopTrialDays = (shop: Shop): number | null => {
    if (!shop.date_fin_essai) return null;
    return Math.ceil((new Date(shop.date_fin_essai).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getShopStatus = (shop: Shop): "trial" | "active" | "expired" => {
    if (shop.subscription_status === "active") return "active";
    const days = getShopTrialDays(shop);
    if (days !== null && days <= 0) return "expired";
    return "trial";
  };

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
    if (!user?.email) {
      toast.error("Veuillez vous connecter pour souscrire");
      return;
    }
    if (!selectedShopId) {
      toast.error("Veuillez sélectionner une boutique");
      return;
    }

    initierPaystackPayment({
      amount: plan.price,
      email: user.email,
      planCode: plan.planCode,
      metadata: {
        plan: plan.name,
        vendeur_id: user.id,
        boutique: selectedShop?.nom,
        shop_id: selectedShopId,
      },
      callback: async (response) => {
        const endDate = new Date();
        if (plan.name === "Annuel") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        const { error } = await supabase
          .from("shops" as any)
          .update({
            subscription_status: "active",
            est_en_essai: false,
            date_fin_essai: endDate.toISOString(),
          } as any)
          .eq("id", selectedShopId);

        if (error) {
          console.error("Erreur mise à jour abonnement:", error);
          toast.error("Paiement reçu mais erreur de mise à jour. Contactez le support.");
        } else {
          toast.success(`🎉 Abonnement ${plan.name} activé pour ${selectedShop?.nom} !`);
          navigate("/proprietaire");
        }
      },
      onClose: () => {
        toast.info("Paiement annulé");
      },
    });
  };

  // Shops that need subscription (expired or near expiry)
  const shopsNeedingSub = shops.filter(s => {
    const status = getShopStatus(s);
    return status === "expired" || status === "trial";
  });

  return (
    <div className="min-h-screen gradient-mesh pb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-accent/8 blur-3xl translate-y-1/3 -translate-x-1/4" />

      <header className="relative px-5 pt-8 pb-6 safe-top">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl mb-4 glass">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-3xl gradient-hero opacity-30 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl gradient-hero shadow-2xl flex items-center justify-center animate-float">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-display text-gradient mb-2">Abonnement Boutique</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Chaque boutique a son propre abonnement
          </p>
        </div>
      </header>

      {/* Shop selector */}
      <div className="relative px-5 mb-6">
        <div className="glass-strong rounded-2xl p-4 premium-border">
          <label className="text-sm font-semibold text-foreground mb-3 block">Sélectionnez une boutique</label>
          {isLoading ? (
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          ) : (
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choisir une boutique..." />
              </SelectTrigger>
              <SelectContent>
                {shopsNeedingSub.map(shop => {
                  const days = getShopTrialDays(shop);
                  const status = getShopStatus(shop);
                  return (
                    <SelectItem key={shop.id} value={shop.id}>
                      <div className="flex items-center gap-2">
                        <span>{shop.nom}</span>
                        {status === "expired" ? (
                          <span className="text-xs text-destructive font-medium">— Expiré</span>
                        ) : days !== null ? (
                          <span className="text-xs text-muted-foreground">— {days}j restants</span>
                        ) : null}
                      </div>
                    </SelectItem>
                  );
                })}
                {shopsNeedingSub.length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    Toutes vos boutiques ont un abonnement actif ✓
                  </div>
                )}
              </SelectContent>
            </Select>
          )}

          {/* Selected shop status */}
          {selectedShop && (() => {
            const days = getShopTrialDays(selectedShop);
            const status = getShopStatus(selectedShop);
            return (
              <div className={`mt-3 flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                status === "expired" ? "bg-destructive/10 text-destructive" : 
                status === "active" ? "bg-primary/10 text-primary" :
                "bg-accent text-accent-foreground"
              }`}>
                {status === "expired" ? <Clock className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                <span>
                  {status === "expired" ? "Essai expiré — Abonnement requis" :
                   status === "active" ? "Abonnement actif" :
                   `Essai : ${days} jour${(days ?? 0) > 1 ? "s" : ""} restant${(days ?? 0) > 1 ? "s" : ""}`}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Plans */}
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
              disabled={!selectedShopId}
              className={`w-full h-14 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                plan.popular
                  ? "bg-white text-primary hover:bg-white/90 shadow-xl"
                  : "gradient-primary text-white glow-primary"
              }`}
            >
              {selectedShopId ? "Souscrire" : "Sélectionnez une boutique"}
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
