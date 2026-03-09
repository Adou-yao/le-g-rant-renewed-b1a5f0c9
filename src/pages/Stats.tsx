import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useProduits } from "@/hooks/useProduits";
import { useVentes } from "@/hooks/useVentes";
import { useDettes } from "@/hooks/useDettes";
import { useUserRole } from "@/hooks/useUserRole";
import { useShops } from "@/hooks/useShops";
import { useManagers } from "@/hooks/useManagers";
import { SupervisionBadge } from "@/components/ui/SupervisionBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, TrendingUp, Wallet, Package, Target, Loader2, Store } from "lucide-react";

export default function Stats() {
  const { data: produits = [], isLoading: loadingProduits } = useProduits();
  const { data: ventes = [], isLoading: loadingVentes } = useVentes();
  const { data: dettes = [], isLoading: loadingDettes } = useDettes();
  const { isProprietaire, loading: loadingRole } = useUserRole();
  const { shops, isLoading: loadingShops } = useShops();
  const { managers, isLoading: loadingManagers } = useManagers();
  const [selectedShopId, setSelectedShopId] = useState<string>("all");

  const isLoading = loadingProduits || loadingVentes || loadingDettes || loadingRole || loadingShops || loadingManagers;

  // Get manager IDs for the selected shop
  const getManagerIdsForShop = (shopId: string): string[] => {
    if (shopId === "all") return managers.map((m) => m.manager_id);
    return managers.filter((m) => m.shop_id === shopId).map((m) => m.manager_id);
  };

  const filteredData = useMemo(() => {
    const managerIds = getManagerIdsForShop(selectedShopId);
    return {
      ventes: ventes.filter((v) => managerIds.includes(v.user_id)),
      produits: produits.filter((p) => managerIds.includes(p.user_id)),
      dettes: dettes.filter((d) => managerIds.includes(d.user_id)),
    };
  }, [ventes, produits, dettes, managers, selectedShopId]);

  const stats = useMemo(() => {
    const { ventes: fVentes, produits: fProduits, dettes: fDettes } = filteredData;
    const totalVentes = fVentes.length;
    const chiffreAffaires = fVentes.reduce((sum, v) => sum + v.montant_total, 0);

    const beneficeTotal = fVentes.reduce((sum, vente) => {
      const produit = fProduits.find((p) => p.id === vente.produit_id);
      if (produit) return sum + (produit.prix_vente - produit.prix_achat) * vente.quantite;
      return sum;
    }, 0);

    const valeurStock = fProduits.reduce((sum, p) => sum + p.prix_vente * p.stock_actuel, 0);
    const valeurStockAchat = fProduits.reduce((sum, p) => sum + p.prix_achat * p.stock_actuel, 0);
    const totalDettes = fDettes.reduce((sum, d) => sum + d.montant_du, 0);

    const paiementStats = {
      cash: fVentes.filter((v) => v.mode_paiement === "Espèce").length,
      wave: fVentes.filter((v) => v.mode_paiement === "Wave").length,
      orange: fVentes.filter((v) => v.mode_paiement === "Orange Money").length,
    };

    return { totalVentes, chiffreAffaires, beneficeTotal, valeurStock, valeurStockAchat, totalDettes, paiementStats };
  }, [filteredData]);

  // Comparison table: per-shop stats
  const shopComparison = useMemo(() => {
    return shops.map((shop) => {
      const managerIds = managers.filter((m) => m.shop_id === shop.id).map((m) => m.manager_id);
      const shopVentes = ventes.filter((v) => managerIds.includes(v.user_id));
      const shopProduits = produits.filter((p) => managerIds.includes(p.user_id));
      const ca = shopVentes.reduce((sum, v) => sum + v.montant_total, 0);
      const benefice = shopVentes.reduce((sum, vente) => {
        const produit = shopProduits.find((p) => p.id === vente.produit_id);
        if (produit) return sum + (produit.prix_vente - produit.prix_achat) * vente.quantite;
        return sum;
      }, 0);
      return { id: shop.id, nom: shop.nom, ca, benefice, nbVentes: shopVentes.length };
    });
  }, [shops, managers, ventes, produits]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const financialItems = [
    { icon: TrendingUp, label: "Chiffre d'affaires", value: stats.chiffreAffaires, color: "success" },
    { icon: Wallet, label: "Bénéfice total", value: stats.beneficeTotal, color: "success", prefix: "+" },
    { icon: Package, label: "Valeur du stock (vente)", value: stats.valeurStock, color: "info" },
    { icon: Package, label: "Capital immobilisé", value: stats.valeurStockAchat, color: "warning" },
    { icon: Target, label: "Crédits en cours", value: stats.totalDettes, color: "destructive" },
  ];

  const selectedLabel = selectedShopId === "all" ? "Toutes les boutiques" : shops.find((s) => s.id === selectedShopId)?.nom || "";

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader title="Statistiques" subtitle={selectedLabel} />
      {isProprietaire && <SupervisionBadge />}

      {/* Shop selector */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filtrer par boutique</span>
        </div>
        <Select value={selectedShopId} onValueChange={setSelectedShopId}>
          <SelectTrigger className="w-full bg-card rounded-xl border-border">
            <SelectValue placeholder="Sélectionner une boutique" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les boutiques</SelectItem>
            {shops.map((shop) => (
              <SelectItem key={shop.id} value={shop.id}>{shop.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sales count */}
      <div className="px-4 grid grid-cols-1 gap-3 mb-6">
        <StatCard label="Ventes totales" value={stats.totalVentes} icon={ShoppingBag} variant="success" delay={0} />
      </div>

      {/* Financial overview */}
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

      {/* Payment methods */}
      <div className="px-4 mb-6">
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

      {/* Shop comparison table */}
      {shops.length > 1 && (
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-primary to-info" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Comparaison des Boutiques</h3>
          </div>
          <div className="bg-card rounded-2xl card-shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted-foreground font-semibold">Boutique</th>
                    <th className="text-right p-4 text-muted-foreground font-semibold">Ventes</th>
                    <th className="text-right p-4 text-muted-foreground font-semibold">CA</th>
                    <th className="text-right p-4 text-muted-foreground font-semibold">Bénéfice</th>
                  </tr>
                </thead>
                <tbody>
                  {shopComparison
                    .sort((a, b) => b.ca - a.ca)
                    .map((shop, i) => (
                      <tr key={shop.id} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                        <td className="p-4 font-medium text-foreground">{shop.nom}</td>
                        <td className="p-4 text-right text-foreground">{shop.nbVentes}</td>
                        <td className="p-4 text-right font-semibold text-foreground">{new Intl.NumberFormat("fr-CI").format(shop.ca)} F</td>
                        <td className="p-4 text-right font-semibold text-success">+{new Intl.NumberFormat("fr-CI").format(shop.benefice)} F</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
