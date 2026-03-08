import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Shop } from "@/hooks/useShops";

const COMMERCE_TYPES = [
  "Alimentation",
  "Chaussures",
  "Vêtements",
  "Cosmétiques",
  "Électronique",
  "Quincaillerie",
  "Pharmacie",
  "Restauration",
  "Autre",
];

interface ShopFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nom: string; localisation: string; whatsapp: string; type_commerce: string }) => Promise<void>;
  isSubmitting: boolean;
  editShop?: Shop | null;
}

export function ShopFormModal({ open, onOpenChange, onSubmit, isSubmitting, editShop }: ShopFormModalProps) {
  const [nom, setNom] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [typeCommerce, setTypeCommerce] = useState("Autre");

  useEffect(() => {
    if (editShop) {
      setNom(editShop.nom);
      setLocalisation(editShop.localisation);
      setWhatsapp(editShop.whatsapp);
      setTypeCommerce(editShop.type_commerce);
    } else {
      setNom("");
      setLocalisation("");
      setWhatsapp("");
      setTypeCommerce("Autre");
    }
  }, [editShop, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ nom: nom.trim(), localisation: localisation.trim(), whatsapp: whatsapp.trim(), type_commerce: typeCommerce });
  };

  const isEdit = !!editShop;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">
            {isEdit ? "Modifier la boutique" : "Ajouter une Boutique"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="shop-nom">Nom de la Boutique</Label>
            <Input
              id="shop-nom"
              placeholder="Ex: Le Gérant - Plateau"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-loc">Localisation / Quartier</Label>
            <Input
              id="shop-loc"
              placeholder="Ex: Adjamé, Boulevard 1"
              value={localisation}
              onChange={(e) => setLocalisation(e.target.value)}
              required
              maxLength={150}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-wa">Numéro WhatsApp</Label>
            <Input
              id="shop-wa"
              type="tel"
              placeholder="Ex: +225 07 00 00 00 00"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label>Type de commerce</Label>
            <Select value={typeCommerce} onValueChange={setTypeCommerce}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {COMMERCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting || !nom.trim() || !localisation.trim() || !whatsapp.trim()} className="w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isEdit ? "Enregistrer les modifications" : "Créer la boutique"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
