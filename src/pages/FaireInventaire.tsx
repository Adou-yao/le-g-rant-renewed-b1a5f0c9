import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Loader2, Send, Package } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProduits } from "@/hooks/useProduits";
import { useSubmitInventaire } from "@/hooks/useInventaires";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function FaireInventaire() {
  const { user } = useAuth();
  const { data: produits = [], isLoading } = useProduits();
  const submitInventaire = useSubmitInventaire();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, string>>({});

  // Get manager's shop info
  const { data: managerInfo } = useQuery({
    queryKey: ["my-manager-info", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_managers")
        .select("shop_id, owner_id")
        .eq("manager_id", user!.id)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleCountChange = (produitId: string, value: string) => {
    setCounts((prev) => ({ ...prev, [produitId]: value }));
  };

  const filledCount = useMemo(
    () => Object.values(counts).filter((v) => v !== "" && v !== undefined).length,
    [counts]
  );

  const handleSubmit = async () => {
    if (filledCount === 0) {
      toast.error("Remplis au moins un comptage");
      return;
    }

    if (!managerInfo) {
      toast.error("Impossible de trouver ta boutique. Contacte ton propriétaire.");
      return;
    }

    const items = produits
      .filter((p) => counts[p.id] !== undefined && counts[p.id] !== "")
      .map((p) => ({
        produit_id: p.id,
        stock_theorique: p.stock_actuel,
        stock_physique: parseInt(counts[p.id]) || 0,
      }));

    try {
      await submitInventaire.mutateAsync({
        shopId: managerInfo.shop_id,
        ownerId: managerInfo.owner_id,
        items,
      });
      toast.success("Inventaire envoyé au propriétaire !");
      navigate("/articles");
    } catch {
      toast.error("Erreur lors de l'envoi de l'inventaire");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      <PageHeader
        title="Faire l'Inventaire"
        subtitle="Compte chaque produit physiquement"
      />

      <div className="px-4 space-y-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ClipboardCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Instructions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Compte physiquement chaque produit et saisis la quantité réelle.
                  Le stock théorique est masqué pour garantir un comptage honnête.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {produits.map((p) => (
          <Card key={p.id} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.nom}</p>
                    {p.categorie && (
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {p.categorie}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="w-24 shrink-0">
                  <Input
                    type="number"
                    placeholder="Qté"
                    min="0"
                    value={counts[p.id] || ""}
                    onChange={(e) => handleCountChange(p.id, e.target.value)}
                    className="text-center h-10 text-base font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="pt-4 space-y-3">
          <div className="text-center text-sm text-muted-foreground">
            {filledCount} / {produits.length} produits comptés
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitInventaire.isPending || filledCount === 0}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            {submitInventaire.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            Envoyer l'inventaire ({filledCount} produit{filledCount > 1 ? "s" : ""})
          </Button>
        </div>
      </div>
    </div>
  );
}
