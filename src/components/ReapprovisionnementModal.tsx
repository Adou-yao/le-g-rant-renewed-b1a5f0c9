import { useState } from "react";
import { Package, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateTransfer } from "@/hooks/useStockTransfers";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produit: { id: string; nom: string; prix_achat: number; prix_vente: number; user_id: string };
  ownerId: string;
  managerId: string;
  shopId: string;
}

export function ReapprovisionnementModal({ open, onOpenChange, produit, ownerId, managerId, shopId }: Props) {
  const [quantite, setQuantite] = useState("");
  const [nouveauPrix, setNouveauPrix] = useState(String(produit.prix_achat));
  const createTransfer = useCreateTransfer();

  const nouveauPrixNum = parseFloat(nouveauPrix) || 0;
  const hasPrix = nouveauPrix !== "";
  const marge = produit.prix_vente - nouveauPrixNum;
  const margeInvalide = hasPrix && produit.prix_vente <= nouveauPrixNum;

  const handleSubmit = async () => {
    const qty = parseInt(quantite);
    if (!qty || qty <= 0) {
      toast.error("Quantité invalide");
      return;
    }
    if (margeInvalide) {
      toast.error("Le nouveau prix d'achat rend la marge négative ou nulle");
      return;
    }
    try {
      await createTransfer.mutateAsync({
        produit_id: produit.id,
        owner_id: ownerId,
        manager_id: managerId,
        shop_id: shopId,
        quantite: qty,
        nouveau_prix_achat: nouveauPrix ? parseFloat(nouveauPrix) : null,
        source: "reapprovisionnement",
      });
      toast.success("Réapprovisionnement envoyé ! En attente de confirmation du gérant.");
      setQuantite("");
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Réapprovisionner : {produit.nom}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Quantité envoyée *</Label>
            <Input
              type="number"
              placeholder="Ex: 50"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="mt-1.5"
              min="1"
            />
          </div>
          <div>
            <Label>Nouveau prix d'achat (F)</Label>
            <Input
              type="number"
              placeholder="Laisser vide = inchangé"
              value={nouveauPrix}
              onChange={(e) => setNouveauPrix(e.target.value)}
              className={`mt-1.5 ${margeInvalide ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Prix de vente actuel : {produit.prix_vente.toLocaleString()} F
            </p>
          </div>

          {/* Erreur marge */}
          {margeInvalide && (
            <p className="text-sm font-medium text-destructive">
              Erreur : Le prix de vente doit être supérieur au prix d'achat pour garantir votre marge.
            </p>
          )}

          {/* Calcul de marge en direct */}
          {hasPrix && !margeInvalide && (
            <div className="p-3 rounded-xl bg-accent/50 border border-accent">
              <p className="text-sm font-medium text-accent-foreground">
                💰 Bénéfice prévu : <span className="font-bold">{marge.toLocaleString()} FCFA</span>
              </p>
            </div>
          )}
          {hasPrix && margeInvalide && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
              <p className="text-sm font-medium text-destructive">
                💰 Bénéfice prévu : <span className="font-bold">{marge.toLocaleString()} FCFA</span>
              </p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary font-medium">
              📦 Le stock ne sera mis à jour qu'après confirmation du gérant.
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createTransfer.isPending || margeInvalide}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            {createTransfer.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
            Envoyer le réapprovisionnement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
