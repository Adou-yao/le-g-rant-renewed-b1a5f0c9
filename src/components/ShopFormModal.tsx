import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ImagePlus, X } from "lucide-react";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
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
  onSubmit: (data: { nom: string; localisation: string; whatsapp: string; type_commerce: string; logoFile?: File | null }) => Promise<void>;
  isSubmitting: boolean;
  editShop?: Shop | null;
}

export function ShopFormModal({ open, onOpenChange, onSubmit, isSubmitting, editShop }: ShopFormModalProps) {
  const [nom, setNom] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [countryCode, setCountryCode] = useState("+225");
  const [whatsapp, setWhatsapp] = useState("");
  const [typeCommerce, setTypeCommerce] = useState("Autre");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editShop) {
      setNom(editShop.nom);
      setLocalisation(editShop.localisation);
      // Parse existing whatsapp to extract country code
      const existingWa = editShop.whatsapp || "";
      const matchedCode = ["+225","+223","+226","+228","+229","+221","+224","+227","+233","+234","+237","+241","+242","+243","+33","+1"].find(c => existingWa.startsWith(c));
      if (matchedCode) {
        setCountryCode(matchedCode);
        setWhatsapp(existingWa.slice(matchedCode.length));
      } else {
        setCountryCode("+225");
        setWhatsapp(existingWa);
      }
      setTypeCommerce(editShop.type_commerce);
      setLogoPreview(editShop.logo_url || null);
      setLogoFile(null);
    } else {
      setNom("");
      setLocalisation("");
      setCountryCode("+225");
      setWhatsapp("");
      setTypeCommerce("Autre");
      setLogoPreview(null);
      setLogoFile(null);
    }
  }, [editShop, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 2 Mo");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(editShop?.logo_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      nom: nom.trim(),
      localisation: localisation.trim(),
      whatsapp: `${countryCode}${whatsapp.trim()}`,
      type_commerce: typeCommerce,
      logoFile,
    });
  };

  const isEdit = !!editShop;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">
            {isEdit ? "Modifier la boutique" : "Ajouter une Boutique"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Logo upload */}
          <div className="space-y-2">
            <Label>Logo de la boutique</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative h-20 w-20 shrink-0 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 flex items-center justify-center cursor-pointer transition-colors overflow-hidden group"
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeLogo(); }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <ImagePlus className="h-6 w-6 text-muted-foreground/60" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Cliquez pour ajouter un logo</p>
                <p className="text-muted-foreground/60">JPG, PNG • Max 2 Mo</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop-nom">Nom de la Boutique</Label>
            <Input id="shop-nom" placeholder="Ex: Le Gérant - Plateau" value={nom} onChange={(e) => setNom(e.target.value)} required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-loc">Localisation / Quartier</Label>
            <Input id="shop-loc" placeholder="Ex: Adjamé, Boulevard 1" value={localisation} onChange={(e) => setLocalisation(e.target.value)} required maxLength={150} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-wa">Numéro WhatsApp</Label>
            <Input id="shop-wa" type="tel" placeholder="Ex: +225 07 00 00 00 00" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label>Type de commerce</Label>
            <Select value={typeCommerce} onValueChange={setTypeCommerce}>
              <SelectTrigger><SelectValue placeholder="Choisir un type" /></SelectTrigger>
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
