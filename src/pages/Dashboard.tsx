import { useMemo } from "react";
import { TrendingUp, Wallet, AlertTriangle, Package, Loader2, Sparkles, LogOut, ArrowDownCircle, Banknote, Smartphone } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { useProduits } from "@/hooks/useProduits";
import { useVentes } from "@/hooks/useVentes";
import { useDepenses } from "@/hooks/useDepenses";
import { useAuth } from "@/hooks/useAuth";
import { calculateDailyStats, getWeeklySalesData, getLowStockProduits } from "@/lib/statsHelpers";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const { data: produits = [], isLoading: loadingProduits } = useProduits();
  const { data: ventes = [], isLoading: loadingVentes } = useVentes();
  const { data: depenses = [], isLoading: loadingDepenses } = useDepenses();

  const today = new Date().toISOString().split("T")[0];
  const stats = useMemo(() => calculateDailyStats(ventes, produits), [ventes, produits]);
  const depensesJour = useMemo(() => depenses.filter((d) => d.date_depense.startsWith(today)).reduce((sum, d) => sum + d.montant, 0), [depenses, today]);
  const beneficeReel = stats.beneficeNet - depensesJour;
  const cashBalance = useMemo(() => ventes.filter((v) => v.date_vente.startsWith(today) && v.mode_paiement === "Espèce").reduce((sum, v) => sum + v.montant_total, 0) - depensesJour, [ventes, depensesJour, today]);
  const mobileBalance = useMemo(() => ventes.filter((v) => v.date_vente.startsWith(today) && v.mode_paiement !== "Espèce").reduce((sum, v) => sum + v.montant_total, 0), [ventes, today]);
  const weeklyData = useMemo(() => getWeeklySalesData(ventes), [ventes]);
  const lowStockProduits = useMemo(() => getLowStockProduits(produits), [produits]);
  const isLoading = loadingProduits || loadingVentes || loadingDepenses;

  if (isLoading) {
    return (<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><Loader2 className="h-10 w-10 animate-spin text-success" /><p className="text-muted-foreground font-medium animate-pulse">Chargement...</p></div>);
  }

  const handleSignOut = async () => { const { error } = await signOut(); if (error) toast.error("Erreur lors de la déconnexion"); else toast.success("Déconnexion réussie"); };
  const storeName = user?.user_metadata?.nom_boutique || "Ma Boutique";

  return (
    <div className="pb-24">
      <header className="px-4 pt-8 pb-6 safe-top">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 mb-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold text-success">Le Gérant</span>
            </div>
            <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent tracking-tight">{storeName}</h1>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2"><Sparkles className="h-4 w-4 text-warning" />Tableau de bord en temps réel</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-2 h-11 w-11"><LogOut className="h-5 w-5" /></Button>
        </div>
      </header>
      <div className="px-4 grid grid-cols-2 gap-4 mb-4">
        <StatCard label="Chiffre d'affaires" value={`${new Intl.NumberFormat("fr-CI").format(stats.ventesJour)} F`} icon={TrendingUp} variant="success" delay={0} />
        <StatCard label="Dépenses" value={`${new Intl.NumberFormat("fr-CI").format(depensesJour)} F`} icon={ArrowDownCircle} variant="destructive" delay={100} />
      </div>
      <div className="px-4 mb-4">
        <div className={`rounded-2xl p-5 card-shadow-lg ${beneficeReel >= 0 ? 'bg-gradient-to-r from-success/10 to-success/5 border border-success/20' : 'bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bénéfice Net du jour</p>
              <p className={`text-3xl font-bold font-display ${beneficeReel >= 0 ? 'text-success' : 'text-destructive'}`}>{new Intl.NumberFormat("fr-CI").format(beneficeReel)} F</p>
              <p className="text-xs text-muted-foreground mt-1">Ventes - Coût d'achat - Dépenses</p>
            </div>
            <div className={`p-3 rounded-2xl ${beneficeReel >= 0 ? 'bg-success/20' : 'bg-destructive/20'}`}><Wallet className={`h-8 w-8 ${beneficeReel >= 0 ? 'text-success' : 'text-destructive'}`} /></div>
          </div>
        </div>
      </div>
      <div className="px-4 grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-2xl p-4 card-shadow"><div className="flex items-center gap-2 mb-2"><Banknote className="h-5 w-5 text-success" /><span className="text-xs font-medium text-muted-foreground">En caisse</span></div><p className="text-xl font-bold font-display text-foreground">{new Intl.NumberFormat("fr-CI").format(cashBalance)} F</p></div>
        <div className="bg-card rounded-2xl p-4 card-shadow"><div className="flex items-center gap-2 mb-2"><Smartphone className="h-5 w-5 text-primary" /><span className="text-xs font-medium text-muted-foreground">Sur puces</span></div><p className="text-xl font-bold font-display text-foreground">{new Intl.NumberFormat("fr-CI").format(mobileBalance)} F</p></div>
      </div>
      <div className="px-4 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="bg-card rounded-2xl p-5 card-shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-success/10 to-transparent rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-success" />Performance 7 jours</h3><span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{ventes.length} ventes</span></div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs><linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} dy={10} />
                <YAxis hide />
                <Tooltip formatter={(value: number) => [`${new Intl.NumberFormat("fr-CI").format(value)} F`, "Ventes"]} contentStyle={{ background: "hsl(0, 0%, 100%)", border: "none", borderRadius: "12px", boxShadow: "0 8px 32px -8px rgba(0,0,0,0.15)" }} />
                <Area type="monotone" dataKey="ventes" stroke="hsl(142, 76%, 36%)" strokeWidth={3} fill="url(#colorVentes)" dot={{ r: 0 }} activeDot={{ r: 6, fill: "hsl(142, 76%, 36%)", stroke: "white", strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {lowStockProduits.length > 0 && (
        <div className="px-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-4"><div className="p-2 rounded-xl bg-warning/10"><AlertTriangle className="h-5 w-5 text-warning" /></div><div><h3 className="text-sm font-bold text-foreground">Alertes Stock</h3><p className="text-xs text-muted-foreground">{lowStockProduits.length} article(s) à réapprovisionner</p></div></div>
          <div className="space-y-3">{lowStockProduits.map((produit, index) => (<div key={produit.id} className="flex items-center gap-3 bg-card border border-warning/20 rounded-2xl p-4 card-shadow" style={{ animationDelay: `${400 + index * 100}ms` }}><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center"><Package className="h-6 w-6 text-warning" /></div><div><p className="font-semibold text-foreground">{produit.nom}</p><span className="text-sm text-destructive font-bold">{produit.stock_actuel} restant{produit.stock_actuel > 1 ? 's' : ''}</span></div></div>))}</div>
        </div>
      )}
      {lowStockProduits.length === 0 && (
        <div className="px-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}><div className="bg-card rounded-2xl p-6 card-shadow-lg text-center"><div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center"><Package className="h-8 w-8 text-success" /></div><h3 className="font-bold text-foreground mb-1">Stocks en bon état</h3><p className="text-sm text-muted-foreground">Tous vos articles sont bien approvisionnés !</p></div></div>
      )}
    </div>
  );
}
