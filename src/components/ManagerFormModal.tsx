import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageCircle, Copy, Check } from "lucide-react";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import type { Shop } from "@/hooks/useShops";

interface ManagerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { full_name: string; whatsapp: string; email: string; password: string; shop_id: string }) => Promise<any>;
  isSubmitting: boolean;
  shops: Shop[];
}

export function ManagerFormModal({ open, onOpenChange, onSubmit, isSubmitting, shops }: ManagerFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+225");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopId, setShopId] = useState("");
  const [createdManager, setCreatedManager] = useState<{
    full_name: string;
    email: string;
    password: string;
    whatsapp: string;
    shop_name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setFullName("");
    setCountryCode("+225");
    setWhatsapp("");
    setEmail("");
    setPassword("");
    setShopId("");
    setCreatedManager(null);
    setCopied(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit({
      full_name: fullName.trim(),
      whatsapp: whatsapp.trim() ? `${countryCode}${whatsapp.trim().replace(/^0+/, "")}` : "",
      email: email.trim().toLowerCase(),
      password,
      shop_id: shopId,
    });
    if (result?.success) {
      setCreatedManager({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        whatsapp: whatsapp.trim(),
        shop_name: result.manager.shop_name,
      });
    }
  };

  const appUrl = window.location.origin;

  const getWhatsAppMessage = () => {
    if (!createdManager) return "";
    return `Salut ${createdManager.full_name}, ton compte gérant est prêt pour la boutique ${createdManager.shop_name}. Connecte-toi ici : ${appUrl} avec l'email ${createdManager.email} et le mot de passe ${createdManager.password}. Note : Tu devras changer ton mot de passe à la première connexion.`;
  };

  const getWhatsAppUrl = () => {
    if (!createdManager) return "";
    const phone = createdManager.whatsapp.replace(/\s+/g, "").replace(/^\+/, "");
    return `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(getWhatsAppMessage())}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdManager) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-display flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Gérant créé avec succès !
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <p><span className="font-medium">Nom :</span> {createdManager.full_name}</p>
              <p><span className="font-medium">Email :</span> {createdManager.email}</p>
              <p><span className="font-medium">Boutique :</span> {createdManager.shop_name}</p>
              <p><span className="font-medium">Mot de passe :</span> {createdManager.password}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => window.open(getWhatsAppUrl(), "_blank")}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={!createdManager.whatsapp}
              >
                <MessageCircle className="h-4 w-4" />
                Envoyer les accès par WhatsApp
              </Button>
              <Button variant="outline" onClick={handleCopy} className="w-full gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié !" : "Copier le message"}
              </Button>
              <Button variant="ghost" onClick={() => handleOpenChange(false)} className="w-full">
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">Ajouter un Gérant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="mgr-name">Nom complet</Label>
            <Input id="mgr-name" placeholder="Ex: Koné Amadou" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mgr-wa">Numéro WhatsApp</Label>
            <div className="flex">
              <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
              <Input id="mgr-wa" type="tel" placeholder="07 00 00 00 00" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="rounded-l-none h-12" maxLength={15} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mgr-email">Email de connexion</Label>
            <Input id="mgr-email" type="email" placeholder="gerant@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mgr-pass">Mot de passe temporaire</Label>
            <Input id="mgr-pass" type="text" placeholder="Mot de passe temporaire" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label>Boutique assignée</Label>
            <Select value={shopId} onValueChange={setShopId} required>
              <SelectTrigger><SelectValue placeholder="Choisir une boutique" /></SelectTrigger>
              <SelectContent>
                {shops.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !fullName.trim() || !email.trim() || !password || !shopId}
            className="w-full"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Créer le gérant
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
