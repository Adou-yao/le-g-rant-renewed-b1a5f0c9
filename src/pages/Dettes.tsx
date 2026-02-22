import { PageHeader } from "@/components/ui/PageHeader";
import { DebtCard } from "@/components/ui/DebtCard";
import { useDettes, useRemoveDette } from "@/hooks/useDettes";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Dettes() {
  const { data: dettes = [], isLoading } = useDettes();
  const removeDette = useRemoveDette();
  const { user } = useAuth();
  const storeName = user?.user_metadata?.nom_boutique || "Ma Boutique";
  const totalDettes = dettes.reduce((sum, d) => sum + d.montant_du, 0);

  const handleDelete = async (id: string) => { try { await removeDette.mutateAsync(id); toast.success("Crédit supprimé"); } catch { toast.error("Erreur"); } };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader title="Cahier de Dettes" subtitle={`${dettes.length} client${dettes.length > 1 ? "s" : ""} débiteur${dettes.length > 1 ? "s" : ""}`} />
      <div className="px-4 mb-6"><div className="relative overflow-hidden bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border border-destructive/20 rounded-2xl p-5"><div className="absolute top-0 right-0 w-24 h-24 bg-destructive/10 rounded-full blur-2xl" /><div className="relative"><p className="text-sm text-muted-foreground mb-1">💳 Total des crédits à récupérer</p><p className="text-3xl font-bold font-display text-destructive">{new Intl.NumberFormat("fr-CI").format(totalDettes)} <span className="text-lg">FCFA</span></p></div></div></div>
      <div className="px-4 space-y-3">
        {dettes.length === 0 ? (<div className="text-center py-12"><p className="text-muted-foreground">Aucun crédit en cours 🎉</p></div>) : (
          dettes.map((dette, index) => (<DebtCard key={dette.id} nomClient={dette.nom_client} telephone={dette.telephone_client || ""} montant={dette.montant_du} dateAjout={dette.created_at} boutiqueName={storeName} onWhatsAppRelance={() => {}} onDelete={() => handleDelete(dette.id)} delay={index * 100} />))
        )}
      </div>
    </div>
  );
}
