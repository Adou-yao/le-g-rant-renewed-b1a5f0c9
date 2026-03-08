import { Package, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { useProduits } from "@/hooks/useProduits";
import { useUserRole } from "@/hooks/useUserRole";
import { SupervisionBadge } from "@/components/ui/SupervisionBadge";
import { PendingDeliveries } from "@/components/PendingDeliveries";

export default function Articles() {
  const { data: produits = [], isLoading } = useProduits();
  const { isProprietaire } = useUserRole();

  const totalStock = produits.reduce((sum, p) => sum + p.stock_actuel, 0);
  const totalValue = produits.reduce((sum, p) => sum + p.prix_vente * p.stock_actuel, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader
        title="Mes Articles"
        subtitle={`${produits.length} produits • ${totalStock} en stock`}
      />

      {isProprietaire && <SupervisionBadge />}

      {!isProprietaire && <PendingDeliveries />}

      <div className="px-4 mb-5">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">💰 Valeur totale du stock</p>
              <p className="text-3xl font-bold font-display text-primary">
                {new Intl.NumberFormat("fr-CI").format(totalValue)} <span className="text-lg">FCFA</span>
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl"><Package className="h-7 w-7 text-primary" /></div>
          </div>
        </div>
      </div>

      {produits.length === 0 ? (
        <div className="px-4 text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun produit. Le propriétaire doit créer les produits depuis son tableau de bord.</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {produits.map((produit) => (
            <ProductCard key={produit.id} name={produit.nom} prixAchat={produit.prix_achat} prixVente={produit.prix_vente} stock={produit.stock_actuel} showProfit />
          ))}
        </div>
      )}
    </div>
  );
}
