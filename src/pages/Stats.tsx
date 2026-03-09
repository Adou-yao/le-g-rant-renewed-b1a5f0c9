import { useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useProduits } from "@/hooks/useProduits";
import { useVentes } from "@/hooks/useVentes";
import { useDettes } from "@/hooks/useDettes";
import { useUserRole } from "@/hooks/useUserRole";
import { SupervisionBadge } from "@/components/ui/SupervisionBadge";
import { ShoppingBag, Users, TrendingUp, Wallet, Package, Target, Loader2 } from "lucide-react";

export default function Stats() {
  const { data: produits = [], isLoading: loadingProduits } = useProduits();
  const { data: ventes = [], isLoading: loadingVentes } = useVentes();
  const { data: dettes = [], isLoading: loadingDettes } = useDettes();
  const { isProprietaire } = useUserRole();
  const isLoading = loadingProduits || loadingVentes || loadingDettes;

  const stats = useMemo(() => {
    const totalVentes = ventes.length;
    const clients = new Set(ventes.filter((v) => v.nom_client).map((v) => v.nom_client));
    const clientsFideles = clients.size;
    const chiffreAffaires = ventes.reduce((sum, v) => sum + v.montant_total, 0);
    
    // Only calculate profit for owners
    const beneficeTotal = isProprietaire 
      ? ventes.reduce((sum, vente) => {
          const produit = produits.find((p) => p.id === vente.produit_id);
          if (produit) return sum + (produit.prix_vente - produit.prix_achat) * vente.quantite;
          return sum;
        }, 0)
      : 0;
    
    // Value at sale price for managers, purchase price for owners
    const valeurStock = produits.reduce((sum, p) => sum + p.prix_vente * p.stock_actuel, 0);
    const valeurStockAchat = isProprietaire 
      ? produits.reduce((sum, p) => sum + p.prix_achat * p.stock_actuel, 0)
      : 0;
    
    const totalDettes = dettes.reduce((sum, d) => sum + d.montant_du, 0);
    const paiementStats = {
      cash: ventes.filter((v) => v.mode_paiement === "Espèce").length,
      wave: ventes.filter((v) => v.mode_paiement === "Wave").length,
      orange: ventes.filter((v) => v.mode_paiement === "Orange Money").length,
    };
    return { totalVentes, clientsFideles, chiffreAffaires, beneficeTotal, valeurStock, valeurStockAchat, totalDettes, paiementStats };
  }, [produits, ventes, dettes, isProprietaire]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Build financial items based on role
  const financialItems = [
    { icon: TrendingUp, label: "Chiffre d'affaires", value: stats.chiffreAffaires, color: "success" },
    ...(isProprietaire ? [{ icon: Wallet, label: "Bénéfice total", value: stats.beneficeTotal, color: "success", prefix: "+" }] : []),
    { icon: Package, label: "Valeur du stock", value: stats.valeurStock, color: "info" },
    ...(isProprietaire ? [{ icon: Package, label: "Capital immobilisé", value: stats.valeurStockAchat, color: "warning" }] : []),
    { icon: Target, label: "Crédits en cours", value: stats.totalDettes, color: "destructive" },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader title="Statistiques" subtitle="Votre rapport de performance complet" />
      {isProprietaire && <SupervisionBadge />}

      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Ventes totales" value={stats.totalVentes} icon={ShoppingBag} variant="success" delay={0} />
        <StatCard label="Clients fidèles" value={stats.clientsFideles} icon={Users} variant="primary" delay={100} />
      </div>

      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-1 rounded-full bg-gradient-to-r from-primary to-success" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Vue Financière</h3>
        </div>
        <div className="space-y-3">
          {financialItems.map((item) => (
            <div key={item.label} className="group bg-card rounded-2xl p-4 card-shadow-lg transition-all duration-300 hover:translate-x-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 bg-${item.color}/10 rounded-xl`}><item.icon className={`h-5 w-5 text-${item.color}`} /></div>
                  <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
                </div>
                <span className={`text-xl font-bold font-display ${item.color === "destructive" ? "text-destructive" : item.color === "success" ? "text-success" : "text-foreground"}`}>
                  {item.prefix || ""}{new Intl.NumberFormat("fr-CI").format(item.value)} <span className="text-sm text-muted-foreground">F</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-1 rounded-full bg-gradient-to-r from-info to-warning" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Modes de Paiement</h3>
        </div>
        <div className="bg-card rounded-2xl p-5 card-shadow-lg space-y-5">
          {[
            { label: "Cash", count: stats.paiementStats.cash, gradient: "from-success to-emerald-400" },
            { label: "Wave", count: stats.paiementStats.wave, gradient: "from-info to-sky-400" },
            { label: "Orange Money", count: stats.paiementStats.orange, gradient: "from-warning to-orange-400" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-sm font-bold text-foreground">{item.count} <span className="text-muted-foreground font-normal">ventes</span></span>
              </div>
              <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-500`} style={{ width: stats.totalVentes > 0 ? `${(item.count / stats.totalVentes) * 100}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
