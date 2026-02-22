import { useState } from "react";
import { Plus, Package, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProduits, useAddProduit } from "@/hooks/useProduits";
import { useSubscription } from "@/hooks/useSubscription";
import { showReadOnlyAlert } from "@/components/ui/ReadOnlyAlert";
import { toast } from "sonner";

export default function Articles() {
  const { data: produits = [], isLoading } = useProduits();
  const addProduit = useAddProduit();
  const { isReadOnly } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ nom: "", prixAchat: "", prixVente: "", stockActuel: "" });

  const handleAddProduct = async () => {
    if (!newProduct.nom || !newProduct.prixAchat || !newProduct.prixVente) {
      toast.error("Remplis tous les champs obligatoires");
      return;
    }
    try {
      await addProduit.mutateAsync({
        nom: newProduct.nom,
        prix_achat: parseInt(newProduct.prixAchat),
        prix_vente: parseInt(newProduct.prixVente),
        stock_actuel: parseInt(newProduct.stockActuel) || 0,
      });
      toast.success("Produit ajouté !");
      setNewProduct({ nom: "", prixAchat: "", prixVente: "", stockActuel: "" });
      setIsOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'ajout du produit");
    }
  };

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
        action={
          <Dialog open={isOpen} onOpenChange={(open) => {
            if (open && isReadOnly) { showReadOnlyAlert(); return; }
            setIsOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button size="icon" className={`h-10 w-10 rounded-xl ${isReadOnly ? 'bg-muted text-muted-foreground' : 'bg-success hover:bg-success/90'}`}>
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Nouveau Produit
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="nom">Nom du produit *</Label>
                  <Input id="nom" placeholder="Ex: Riz Papillon 5kg" value={newProduct.nom} onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })} className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="prixAchat">Prix d'achat (F) *</Label>
                    <Input id="prixAchat" type="number" placeholder="3800" value={newProduct.prixAchat} onChange={(e) => setNewProduct({ ...newProduct, prixAchat: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="prixVente">Prix de vente (F) *</Label>
                    <Input id="prixVente" type="number" placeholder="4500" value={newProduct.prixVente} onChange={(e) => setNewProduct({ ...newProduct, prixVente: e.target.value })} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stock">Stock initial</Label>
                  <Input id="stock" type="number" placeholder="10" value={newProduct.stockActuel} onChange={(e) => setNewProduct({ ...newProduct, stockActuel: e.target.value })} className="mt-1.5" />
                </div>
                <Button onClick={handleAddProduct} disabled={addProduit.isPending} className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground">
                  {addProduit.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Ajouter le produit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

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

      <div className="px-4 space-y-3">
        {produits.map((produit) => (
          <ProductCard key={produit.id} name={produit.nom} prixAchat={produit.prix_achat} prixVente={produit.prix_vente} stock={produit.stock_actuel} showProfit />
        ))}
      </div>
    </div>
  );
}
