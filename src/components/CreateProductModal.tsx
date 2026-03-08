import { useState } from "react";
import { Package, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Manager {
  id: string;
  manager_id: string;
  manager_name: string;
  shop_id: string;
}

interface Shop {
  id: string;
  nom: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managers: Manager[];
  shops: Shop[];
}

export function CreateProductModal({ open, onOpenChange, managers, shops }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prixAchat: "",
    prixVente: "",
    stockInitial: "",
    managerId: "",
    shopId: "",
  });

  // Auto-fill shopId when manager is selected
  const handleManagerChange = (managerId: string) => {
    const manager = managers.find((m) => m.manager_id === managerId);
    setForm((f) => ({ ...f, managerId, shopId: manager?.shop_id || "" }));
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prixAchat || !form.prixVente || !form.managerId || !form.shopId) {
      toast.error("Remplis tous les champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.rpc("create_product_for_manager", {
        _manager_id: form.managerId,
        _shop_id: form.shopId,
        _nom: form.nom,
        _prix_achat: parseFloat(form.prixAchat),
        _prix_vente: parseFloat(form.prixVente),
        _stock_initial: parseInt(form.stockInitial) || 0,
      });
      if (error) throw error;

      const stockMsg = parseInt(form.stockInitial) > 0
        ? " Stock initial en attente de confirmation du gérant."
        : "";
      toast.success(`Produit "${form.nom}" créé !${stockMsg}`);
      setForm({ nom: "", prixAchat: "", prixVente: "", stockInitial: "", managerId: "", shopId: "" });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["superviseur-produits"] });
      queryClient.invalidateQueries({ queryKey: ["stock-transfers-owner"] });
    } catch {
      toast.error("Erreur lors de la création du produit");
    } finally {
      setLoading(false);
    }
  };

  const getShopName = (shopId: string) => shops.find((s) => s.id === shopId)?.nom || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Nouveau Produit
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Manager / Shop selection */}
          <div>
            <Label>Gérant / Boutique *</Label>
            <Select value={form.managerId} onValueChange={handleManagerChange}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choisir un gérant" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((m) => (
                  <SelectItem key={m.manager_id} value={m.manager_id}>
                    {m.manager_name} — {getShopName(m.shop_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cp-nom">Nom du produit *</Label>
            <Input id="cp-nom" placeholder="Ex: Riz Papillon 5kg" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="mt-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cp-pa">Prix d'achat (F) *</Label>
              <Input id="cp-pa" type="number" placeholder="3800" value={form.prixAchat} onChange={(e) => setForm({ ...form, prixAchat: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cp-pv">Prix de vente (F) *</Label>
              <Input id="cp-pv" type="number" placeholder="4500" value={form.prixVente} onChange={(e) => setForm({ ...form, prixVente: e.target.value })} className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="cp-stock">Stock initial (optionnel)</Label>
            <Input id="cp-stock" type="number" placeholder="0" value={form.stockInitial} onChange={(e) => setForm({ ...form, stockInitial: e.target.value })} className="mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              Si &gt; 0, une livraison sera créée en attente de confirmation par le gérant.
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
            Créer le produit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
