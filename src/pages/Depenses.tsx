import { useState } from "react";
import { Plus, Trash2, Loader2, Receipt, Car, Home, Utensils, Zap, Phone, ShoppingBag, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepenses, useAddDepense, useDeleteDepense, CATEGORIES_DEPENSES } from "@/hooks/useDepenses";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserRole } from "@/hooks/useUserRole";
import { showReadOnlyAlert } from "@/components/ui/ReadOnlyAlert";
import { SupervisionBadge } from "@/components/ui/SupervisionBadge";
import { toast } from "sonner";

const categoryIcons: Record<string, typeof Car> = { Transport: Car, Loyer: Home, Repas: Utensils, Électricité: Zap, Téléphone: Phone, Marchandise: ShoppingBag, Autre: MoreHorizontal };

export default function Depenses() {
  const { data: depenses = [], isLoading } = useDepenses();
  const { isReadOnly } = useSubscription();
  const { isProprietaire } = useUserRole();
  const addDepense = useAddDepense();
  const deleteDepense = useDeleteDepense();
  const [description, setDescription] = useState("");
  const [montant, setMontant] = useState("");
  const [categorie, setCategorie] = useState<string>("Autre");
  const [showForm, setShowForm] = useState(false);

  const blocked = isReadOnly || isProprietaire;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) { if (isProprietaire) { toast.error("Mode Supervision : vous ne pouvez pas ajouter de dépenses."); } else { showReadOnlyAlert(); } return; }
    if (!description.trim() || !montant) { toast.error("Remplis tous les champs"); return; }
    try { await addDepense.mutateAsync({ description: description.trim(), montant: parseInt(montant), categorie, date_depense: new Date().toISOString().split("T")[0] }); toast.success("Dépense ajoutée"); setDescription(""); setMontant(""); setCategorie("Autre"); setShowForm(false); } catch { toast.error("Erreur lors de l'ajout"); }
  };
  const handleDelete = async (id: string) => {
    if (isProprietaire) { toast.error("Mode Supervision : vous ne pouvez pas supprimer de dépenses."); return; }
    try { await deleteDepense.mutateAsync(id); toast.success("Dépense supprimée"); } catch { toast.error("Erreur"); }
  };
  const todayTotal = depenses.filter((d) => d.date_depense === new Date().toISOString().split("T")[0]).reduce((sum, d) => sum + d.montant, 0);

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader title="Dépenses" subtitle="Suivi des sorties d'argent" />
      {isProprietaire && <SupervisionBadge />}
      <div className="px-4 mb-6"><div className="bg-gradient-to-r from-destructive/10 to-destructive/5 rounded-2xl p-4 border border-destructive/20"><p className="text-sm text-muted-foreground mb-1">Dépenses du jour</p><p className="text-3xl font-bold font-display text-destructive">{new Intl.NumberFormat("fr-CI").format(todayTotal)} F</p></div></div>
      {!showForm && !isProprietaire && (<div className="px-4 mb-6"><Button onClick={() => { if (isReadOnly) { showReadOnlyAlert(); return; } setShowForm(true); }} className={`w-full h-14 text-lg font-semibold ${isReadOnly ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90'}`}><Plus className="mr-2 h-5 w-5" />{isReadOnly ? "Essai terminé" : "Ajouter une dépense"}</Button></div>)}
      {showForm && (<form onSubmit={handleSubmit} className="px-4 mb-6 space-y-4 animate-fade-in"><div className="bg-card rounded-2xl p-4 card-shadow space-y-4"><Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="h-12" /><Input type="number" placeholder="Montant (FCFA)" value={montant} onChange={(e) => setMontant(e.target.value)} className="h-12" /><Select value={categorie} onValueChange={setCategorie}><SelectTrigger className="h-12"><SelectValue placeholder="Catégorie" /></SelectTrigger><SelectContent>{CATEGORIES_DEPENSES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><div className="flex gap-3"><Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-12">Annuler</Button><Button type="submit" disabled={addDepense.isPending} className="flex-1 h-12 bg-success hover:bg-success/90">{addDepense.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enregistrer"}</Button></div></div></form>)}
      <div className="px-4 space-y-3">
        {depenses.length === 0 ? (<div className="text-center py-12"><Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Aucune dépense enregistrée</p></div>) : (
          depenses.map((depense) => { const Icon = categoryIcons[depense.categorie] || MoreHorizontal; return (
            <div key={depense.id} className="bg-card rounded-2xl p-4 card-shadow flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0"><div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0"><Icon className="h-6 w-6 text-destructive" /></div><div className="min-w-0"><p className="font-semibold text-foreground truncate">{depense.description}</p><p className="text-sm text-muted-foreground">{depense.categorie} • {new Date(depense.date_depense).toLocaleDateString("fr-CI")}</p></div></div>
              <div className="flex items-center gap-2"><span className="font-bold text-destructive font-display">-{new Intl.NumberFormat("fr-CI").format(depense.montant)} F</span>{!isProprietaire && <Button variant="ghost" size="icon" onClick={() => handleDelete(depense.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}</div>
            </div>); })
        )}
      </div>
    </div>
  );
}
