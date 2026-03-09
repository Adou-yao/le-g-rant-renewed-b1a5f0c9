import { useState } from "react";
import { CheckCircle, Loader2, Truck, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useManagerPendingTransfers, useConfirmTransfer, useRejectTransfer } from "@/hooks/useStockTransfers";
import { useProduits } from "@/hooks/useProduits";
import { useOwnerSubscription } from "@/hooks/useOwnerSubscription";
import { toast } from "sonner";

const REJECTION_REASONS = [
  "Quantité reçue différente",
  "Erreur de modèle/produit",
  "Produit abîmé ou défectueux",
  "Autre",
];

export function PendingDeliveries() {
  const { data: transfers = [], isLoading } = useManagerPendingTransfers();
  const { data: produits = [] } = useProduits();
  const { isExpired: ownerExpired } = useOwnerSubscription();
  const confirmTransfer = useConfirmTransfer();
  const rejectTransfer = useRejectTransfer();
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = async (id: string) => {
    if (ownerExpired) {
      toast.error("Abonnement expiré. Contactez le propriétaire pour réactiver.");
      return;
    }
    try {
      await confirmTransfer.mutateAsync(id);
      toast.success("Réception confirmée ! Stock mis à jour.");
    } catch {
      toast.error("Erreur lors de la confirmation");
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedTransferId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedTransferId || !rejectionReason.trim()) {
      toast.error("Veuillez indiquer un motif de refus");
      return;
    }
    try {
      await rejectTransfer.mutateAsync({
        transferId: selectedTransferId,
        reason: rejectionReason.trim(),
      });
      toast.success("Livraison refusée. Le propriétaire a été notifié.");
      setRejectModalOpen(false);
      setSelectedTransferId(null);
      setRejectionReason("");
    } catch {
      toast.error("Erreur lors du refus");
    }
  };

  const getProduitName = (id: string) => produits.find((p) => p.id === id)?.nom || "Produit inconnu";

  if (isLoading) return null;
  if (transfers.length === 0) return null;

  return (
    <>
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
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-background border border-border gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{getProduitName(t.produit_id)}</p>
                <p className="text-xs text-muted-foreground">
                  +{t.quantite} unités • {t.source === 'initial' ? 'Stock initial' : 'Réappro.'} • {new Date(t.created_at).toLocaleDateString("fr-CI")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openRejectModal(t.id)}
                  disabled={rejectTransfer.isPending || ownerExpired}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Refuser
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleConfirm(t.id)}
                  disabled={confirmTransfer.isPending || ownerExpired}
                  className={ownerExpired ? "bg-muted text-muted-foreground" : "bg-accent hover:bg-accent/90"}
                >
                  {confirmTransfer.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : ownerExpired ? (
                    <AlertTriangle className="h-4 w-4 mr-1" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  {ownerExpired ? "Expiré" : "Confirmer"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler une Erreur</DialogTitle>
            <DialogDescription>
              Indiquez le motif du refus. Le propriétaire sera notifié et devra créer un nouveau bon de livraison.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2">
              {REJECTION_REASONS.map((reason) => (
                <Button
                  key={reason}
                  type="button"
                  size="sm"
                  variant={rejectionReason === reason ? "default" : "outline"}
                  onClick={() => setRejectionReason(reason)}
                  className="text-xs"
                >
                  {reason}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Détails supplémentaires (optionnel)</Label>
              <Textarea
                id="reason"
                placeholder="Ex: J'ai reçu 5 unités au lieu de 10..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectTransfer.isPending}
            >
              {rejectTransfer.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Confirmer le Refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
