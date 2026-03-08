import { Package, CheckCircle, Loader2, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useManagerPendingTransfers, useConfirmTransfer } from "@/hooks/useStockTransfers";
import { useProduits } from "@/hooks/useProduits";
import { toast } from "sonner";

export function PendingDeliveries() {
  const { data: transfers = [], isLoading } = useManagerPendingTransfers();
  const { data: produits = [] } = useProduits();
  const confirmTransfer = useConfirmTransfer();

  const handleConfirm = async (id: string) => {
    try {
      await confirmTransfer.mutateAsync(id);
      toast.success("Réception confirmée ! Stock mis à jour.");
    } catch {
      toast.error("Erreur lors de la confirmation");
    }
  };

  const getProduitName = (id: string) => produits.find((p) => p.id === id)?.nom || "Produit inconnu";

  if (isLoading) return null;
  if (transfers.length === 0) return null;

  return (
    <Card className="border-primary/30 shadow-sm bg-primary/5 mx-4 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-4 w-4 text-primary" />
          Livraisons à Valider
          <Badge variant="default" className="ml-auto text-xs">
            {transfers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transfers.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between p-3 rounded-xl bg-background border border-border"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{getProduitName(t.produit_id)}</p>
              <p className="text-xs text-muted-foreground">
                +{t.quantite} unités • {new Date(t.created_at).toLocaleDateString("fr-CI")}
              </p>
              {t.nouveau_prix_achat && (
                <p className="text-xs text-primary mt-0.5">
                  Nouveau prix d'achat : {new Intl.NumberFormat("fr-CI").format(t.nouveau_prix_achat)} F
                </p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => handleConfirm(t.id)}
              disabled={confirmTransfer.isPending}
              className="shrink-0 ml-2 bg-accent hover:bg-accent/90"
            >
              {confirmTransfer.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Confirmer
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
