import { useState, useMemo } from "react";
import { Check, ShoppingCart, User, Loader2, Percent, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { PaymentModeSelector, OperatorSelector, PaymentMode, PaymentOperator, getOperatorLabel } from "@/components/ui/PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import { useProduits, useUpdateProduitStock } from "@/hooks/useProduits";
import { useAddVente, useVentes } from "@/hooks/useVentes";
import { useAddDette } from "@/hooks/useDettes";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserRole } from "@/hooks/useUserRole";
import { showReadOnlyAlert } from "@/components/ui/ReadOnlyAlert";
import { SupervisionBadge } from "@/components/ui/SupervisionBadge";
import { SubscriptionExpiredBanner } from "@/components/ui/SubscriptionExpiredBanner";
import { toast } from "sonner";

export default function Ventes() {
  const { data: produits = [], isLoading } = useProduits();
  const { isReadOnly } = useSubscription();
  const { isProprietaire, isGerant } = useUserRole();
  const { data: ventes = [] } = useVentes();
  const addVente = useAddVente();
  const addDette = useAddDette();
  const updateStock = useUpdateProduitStock();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("espece");
  const [paymentOperator, setPaymentOperator] = useState<PaymentOperator | null>(null);
  const [isCredit, setIsCredit] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+225");
  const [cashReceived, setCashReceived] = useState("");
  const [addFees, setAddFees] = useState(false);

  // Block if: proprietaire OR subscription expired (per-shop for gérant)
  const blocked = isReadOnly || isProprietaire;

  const top5Products = useMemo(() => { const sc: Record<string, number> = {}; ventes.forEach((v) => { if (v.produit_id) sc[v.produit_id] = (sc[v.produit_id] || 0) + v.quantite; }); return produits.filter((p) => sc[p.id]).sort((a, b) => (sc[b.id] || 0) - (sc[a.id] || 0)).slice(0, 5); }, [produits, ventes]);
  const otherProducts = useMemo(() => { const ids = new Set(top5Products.map((p) => p.id)); return produits.filter((p) => !ids.has(p.id)); }, [produits, top5Products]);
  const produit = useMemo(() => produits.find((p) => p.id === selectedProduct), [produits, selectedProduct]);
  const baseTotal = produit ? produit.prix_vente * quantity : 0;
  const fees = paymentMode === "en_ligne" && addFees ? Math.ceil(baseTotal * 0.01) : 0;
  const total = baseTotal + fees;
  const change = cashReceived ? parseInt(cashReceived) - total : 0;

  const handleSale = async () => {
    if (blocked) { 
      if (isProprietaire) { 
        toast.error("Mode Supervision : vous ne pouvez pas enregistrer de ventes."); 
      } else { 
        showReadOnlyAlert();
      } 
      return; 
    }
    if (!produit) { toast.error("Sélectionne un produit"); return; }
    if (produit.stock_actuel < quantity) { toast.error("Stock insuffisant !"); return; }
    if (isCredit && !clientName.trim()) { toast.error("Entre le nom du client pour le crédit"); return; }
    if (paymentMode === "en_ligne" && !paymentOperator) { toast.error("Choisis un opérateur de paiement"); return; }
    try {
      const modePaiement = paymentMode === "espece" ? "Espèce" : getOperatorLabel(paymentOperator!);
      await addVente.mutateAsync({ produit_id: produit.id, nom_produit: produit.nom, quantite: quantity, montant_total: total, mode_paiement: modePaiement, est_credit: isCredit, nom_client: isCredit ? clientName : null });
      await updateStock.mutateAsync({ id: produit.id, stock_actuel: produit.stock_actuel - quantity });
      if (isCredit && clientName.trim()) { const fullPhone = clientPhone ? `${countryCode}${clientPhone.trim().replace(/^0+/, "")}` : null; await addDette.mutateAsync({ nom_client: clientName, telephone_client: fullPhone, montant_du: total }); }
      toast.success(<div className="flex items-center gap-2"><Check className="h-5 w-5" /><span>Vente enregistrée: {new Intl.NumberFormat("fr-CI").format(total)} F</span></div>);
      setSelectedProduct(null); setQuantity(1); setIsCredit(false); setClientName(""); setClientPhone(""); setCountryCode("+225"); setCashReceived(""); setAddFees(false); setPaymentOperator(null);
    } catch { toast.error("Erreur lors de l'enregistrement de la vente"); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader title="Nouvelle Vente" subtitle="Sélectionne un produit pour commencer" />
      {isProprietaire && <SupervisionBadge />}
      {isGerant && ownerExpired && <SubscriptionExpiredBanner />}
      {top5Products.length > 0 && (<div className="px-4 mb-6"><div className="flex items-center gap-2 mb-3"><Star className="h-5 w-5 text-warning" /><h3 className="text-sm font-bold text-foreground">Top 5 des ventes</h3></div><div className="grid gap-3">{top5Products.map((p) => (<ProductCard key={p.id} name={p.nom} prixAchat={0} prixVente={p.prix_vente} stock={p.stock_actuel} selected={selectedProduct === p.id} onSelect={() => setSelectedProduct(p.id)} />))}</div></div>)}
      {otherProducts.length > 0 && (<div className="px-4 mb-6">{top5Products.length > 0 && <h3 className="text-sm font-bold text-foreground mb-3">Autres articles</h3>}<div className="grid gap-3">{otherProducts.map((p) => (<ProductCard key={p.id} name={p.nom} prixAchat={0} prixVente={p.prix_vente} stock={p.stock_actuel} selected={selectedProduct === p.id} onSelect={() => setSelectedProduct(p.id)} />))}</div></div>)}
      {produit && (
        <div className="px-4 space-y-6 animate-fade-in">
          <div className="bg-card rounded-2xl p-4 card-shadow"><p className="text-sm text-muted-foreground mb-1">Prix unitaire</p><p className="text-2xl font-bold font-display text-primary currency-display">{new Intl.NumberFormat("fr-CI").format(produit.prix_vente)} F</p></div>
          <div className="bg-card rounded-2xl p-4 card-shadow"><label className="text-sm font-medium text-muted-foreground mb-3 block">Quantité</label><div className="flex items-center gap-4"><Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button><span className="text-3xl font-bold font-display w-16 text-center">{quantity}</span><Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setQuantity(Math.min(produit.stock_actuel, quantity + 1))}>+</Button></div></div>
          <div className="bg-card rounded-2xl p-4 card-shadow"><label className="text-sm font-medium text-muted-foreground mb-3 block">Mode de paiement</label><PaymentModeSelector selectedMode={paymentMode} onSelectMode={(mode) => { setPaymentMode(mode); if (mode === "espece") { setPaymentOperator(null); setAddFees(false); } }} />{paymentMode === "en_ligne" && <OperatorSelector selectedOperator={paymentOperator} onSelectOperator={setPaymentOperator} />}</div>
          {paymentMode === "espece" && (<div className="bg-card rounded-2xl p-4 card-shadow animate-fade-in"><label className="text-sm font-medium text-muted-foreground mb-3 block">Somme reçue</label><Input type="number" placeholder="Ex: 5000" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="text-lg h-12" />{change > 0 && (<div className="mt-3 p-3 bg-success/10 rounded-xl"><p className="text-sm text-muted-foreground">Monnaie à rendre</p><p className="text-2xl font-bold font-display text-success">{new Intl.NumberFormat("fr-CI").format(change)} F</p></div>)}</div>)}
          {paymentMode === "en_ligne" && (<div className="bg-card rounded-2xl p-4 card-shadow animate-fade-in space-y-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-xl"><Percent className="h-5 w-5 text-primary" /></div><Label htmlFor="fees" className="font-medium cursor-pointer">Frais retrait (+1%)</Label></div><Switch id="fees" checked={addFees} onCheckedChange={setAddFees} /></div>{addFees && (<div className="p-3 bg-primary/10 rounded-xl"><p className="text-sm text-muted-foreground">Frais</p><p className="text-lg font-bold font-display text-primary">+{new Intl.NumberFormat("fr-CI").format(fees)} F</p></div>)}</div>)}
          <div className="bg-card rounded-2xl p-4 card-shadow"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2 bg-warning/10 rounded-xl"><User className="h-5 w-5 text-warning" /></div><Label htmlFor="credit" className="font-medium cursor-pointer">C'est un crédit</Label></div><Switch id="credit" checked={isCredit} onCheckedChange={setIsCredit} /></div>{isCredit && (<div className="mt-4 space-y-3 animate-fade-in"><Input placeholder="Nom du client *" value={clientName} onChange={(e) => setClientName(e.target.value)} className="h-12" /><div className="flex"><CountryCodeSelect value={countryCode} onChange={setCountryCode} /><Input type="tel" placeholder="Numéro WhatsApp" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="h-12 rounded-l-none" /></div></div>)}</div>
          <div className="bg-primary rounded-2xl p-4 text-primary-foreground"><div className="flex items-center justify-between mb-4"><span className="text-sm opacity-80">Total à payer</span><span className="text-3xl font-bold font-display">{new Intl.NumberFormat("fr-CI").format(total)} F</span></div><Button onClick={handleSale} disabled={addVente.isPending || blocked} className={`w-full h-14 text-lg font-semibold ${blocked ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-success hover:bg-success/90 text-success-foreground'}`}>{addVente.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}{isProprietaire ? "Mode Supervision" : (isGerant && ownerExpired) ? "Abonnement expiré" : isReadOnly ? "Essai terminé" : "Valider la Vente"}</Button></div>
        </div>
      )}
    </div>
  );
}
