import { useMemo } from "react";
import { TrendingUp, AlertTriangle, Package, Loader2, LogOut, ArrowDownCircle, Banknote, Smartphone, ChevronRight, Zap } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { useProduits } from "@/hooks/useProduits";
import { useVentes } from "@/hooks/useVentes";
import { useDepenses } from "@/hooks/useDepenses";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { getWeeklySalesData, getLowStockProduits } from "@/lib/statsHelpers";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { SubscriptionExpiredBanner } from "@/components/ui/SubscriptionExpiredBanner";
import { ShopTrialWarning } from "@/components/ui/ShopTrialWarning";

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const { data: produits = [], isLoading: loadingProduits } = useProduits();
  const { data: ventes = [], isLoading: loadingVentes } = useVentes();
  const { data: depenses = [], isLoading: loadingDepenses } = useDepenses();
  const { isReadOnly: shopExpired } = useSubscription();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  // Only calculate revenue for managers (no profit)
  const ventesJour = useMemo(() => 
    ventes.filter((v) => v.date_vente.startsWith(today)).reduce((sum, v) => sum + v.montant_total, 0), 
    [ventes, today]
  );
  const depensesJour = useMemo(() => depenses.filter((d) => d.date_depense.startsWith(today)).reduce((sum, d) => sum + d.montant, 0), [depenses, today]);
  const cashBalance = useMemo(() => ventes.filter((v) => v.date_vente.startsWith(today) && v.mode_paiement === "Espèce").reduce((sum, v) => sum + v.montant_total, 0) - depensesJour, [ventes, depensesJour, today]);
  const mobileBalance = useMemo(() => ventes.filter((v) => v.date_vente.startsWith(today) && v.mode_paiement !== "Espèce").reduce((sum, v) => sum + v.montant_total, 0), [ventes, today]);
  const weeklyData = useMemo(() => getWeeklySalesData(ventes), [ventes]);
  const lowStockProduits = useMemo(() => getLowStockProduits(produits), [produits]);
  const isLoading = loadingProduits || loadingVentes || loadingDepenses;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full gradient-primary opacity-20 blur-xl animate-pulse" />
          <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Chargement...</p>
      </div>
    );
  }

  
  const storeName = user?.user_metadata?.nom_boutique || "Ma Boutique";

  return (
    <div className="pb-24 gradient-mesh min-h-screen">
      <ShopTrialWarning />
      {/* Header */}
      <header className="px-5 pt-8 pb-2 safe-top">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong">
              <div className="w-2 h-2 rounded-full gradient-primary animate-pulse" />
              <span className="text-xs font-bold text-primary tracking-wide">Le Gérant</span>
            </div>
            <h1 className="text-3xl font-display text-foreground tracking-tight">
              {storeName}
            </h1>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-warning" />
              Tableau de bord en temps réel
            </p>
          </div>
        </div>
      </header>

      {/* Subscription Expired Banner for Gerant */}
      {ownerExpired && <SubscriptionExpiredBanner />}

      {/* Hero Revenue Card - Only show revenue, hide profit for managers */}
      <div className="px-5 mb-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="relative overflow-hidden rounded-3xl p-6 gradient-primary text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-80 mb-1 font-medium">Ventes du jour</p>
                <p className="text-4xl font-display currency-display">
                  {new Intl.NumberFormat("fr-CI").format(ventesJour)} F
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm">
                <TrendingUp className="h-7 w-7" />
              </div>
            </div>
            <p className="text-xs opacity-60">Chiffre d'affaires du jour</p>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid - Only show depenses for manager */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-3">
        <StatCard label="Nb. de ventes" value={ventes.filter((v) => v.date_vente.startsWith(today)).length.toString()} icon={Package} variant="primary" delay={150} />
        <StatCard label="Dépenses" value={`${new Intl.NumberFormat("fr-CI").format(depensesJour)} F`} icon={ArrowDownCircle} variant="destructive" delay={200} />
      </div>

      {/* Cash & Mobile Balance */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-5">
        <div className="glass-strong rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Banknote className="h-4 w-4 text-accent" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">En caisse</span>
          </div>
          <p className="text-xl font-display text-foreground currency-display">{new Intl.NumberFormat("fr-CI").format(cashBalance)} F</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sur compte</span>
          </div>
          <p className="text-xl font-display text-foreground currency-display">{new Intl.NumberFormat("fr-CI").format(mobileBalance)} F</p>
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 mb-5 animate-slide-up" style={{ animationDelay: '350ms' }}>
        <div className="glass-strong rounded-3xl p-5 overflow-hidden relative premium-border">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/8 to-transparent rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">Performance 7 jours</h3>
              <p className="text-xs text-muted-foreground">{ventes.length} ventes au total</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/stats')} className="text-xs text-primary hover:text-primary font-semibold gap-1 h-8 rounded-xl">
              Voir plus <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(250, 85%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(250, 85%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }} dy={10} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`${new Intl.NumberFormat("fr-CI").format(value)} F`, "Ventes"]}
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "none",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px -8px rgba(0,0,0,0.12)",
                    padding: "12px 16px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  stroke="hsl(250, 85%, 60%)"
                  strokeWidth={3}
                  fill="url(#colorVentes)"
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: "hsl(250, 85%, 60%)", stroke: "white", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProduits.length > 0 && (
        <div className="px-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl gradient-warm glow-warm">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Alertes Stock</h3>
              <p className="text-xs text-muted-foreground">{lowStockProduits.length} article(s) bas</p>
            </div>
          </div>
          <div className="space-y-3">
            {lowStockProduits.map((produit, index) => (
              <div
                key={produit.id}
                className="flex items-center gap-3 glass-strong rounded-2xl p-4 animate-slide-up"
                style={{ animationDelay: `${500 + index * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center">
                  <Package className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{produit.nom}</p>
                  <span className="text-sm text-destructive font-bold">{produit.stock_actuel} restant{produit.stock_actuel > 1 ? 's' : ''}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      )}
      {lowStockProduits.length === 0 && (
        <div className="px-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="glass-strong rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-success glow-success flex items-center justify-center animate-float">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Stocks en bon état</h3>
            <p className="text-sm text-muted-foreground">Tous vos articles sont bien approvisionnés !</p>
          </div>
        </div>
      )}
    </div>
  );
}
