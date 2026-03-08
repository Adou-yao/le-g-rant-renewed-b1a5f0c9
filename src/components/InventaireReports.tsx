import { useState, useMemo } from "react";
import { ClipboardList, ChevronDown, ChevronUp, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOwnerInventaires, useInventaireItems } from "@/hooks/useInventaires";
import { Loader2 } from "lucide-react";

interface Props {
  managers: Array<{ manager_id: string; manager_name: string; shop_id: string }>;
  shops: Array<{ id: string; nom: string }>;
  produits: Array<{ id: string; nom: string; prix_vente: number; user_id: string }>;
}

export function InventaireReports({ managers, shops, produits }: Props) {
  const { data: inventaires = [], isLoading } = useOwnerInventaires();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (inventaires.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun inventaire soumis par vos gérants.</p>
      </div>
    );
  }

  const getManagerName = (id: string) =>
    managers.find((m) => m.manager_id === id)?.manager_name || "Inconnu";

  const getShopName = (id: string) =>
    shops.find((s) => s.id === id)?.nom || "—";

  return (
    <div className="space-y-3">
      {inventaires.map((inv) => (
        <InventaireCard
          key={inv.id}
          inventaire={inv}
          managerName={getManagerName(inv.manager_id)}
          shopName={getShopName(inv.shop_id)}
          isExpanded={expandedId === inv.id}
          onToggle={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
          produits={produits}
        />
      ))}
    </div>
  );
}

function InventaireCard({
  inventaire,
  managerName,
  shopName,
  isExpanded,
  onToggle,
  produits,
}: {
  inventaire: any;
  managerName: string;
  shopName: string;
  isExpanded: boolean;
  onToggle: () => void;
  produits: Array<{ id: string; nom: string; prix_vente: number }>;
}) {
  const { data: items = [], isLoading } = useInventaireItems(isExpanded ? inventaire.id : null);

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("fr-CI", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

  // Summary from items
  const summary = useMemo(() => {
    if (items.length === 0) return null;
    let manquants = 0;
    let surplus = 0;
    let perteTotale = 0;
    items.forEach((item: any) => {
      const ecart = item.stock_physique - item.stock_theorique;
      if (ecart < 0) {
        manquants++;
        const prod = produits.find((p) => p.id === item.produit_id);
        perteTotale += Math.abs(ecart) * (prod?.prix_vente || 0);
      } else if (ecart > 0) {
        surplus++;
      }
    });
    return { manquants, surplus, conformes: items.length - manquants - surplus, perteTotale };
  }, [items, produits]);

  return (
    <Card className="border-border/50 shadow-sm">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{shopName}</p>
              <Badge variant="outline" className="text-[10px]">{inventaire.statut}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {managerName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(inventaire.created_at)}
              </span>
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {isExpanded && (
        <CardContent className="pt-0 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Summary badges */}
              {summary && (
                <div className="flex flex-wrap gap-2 mb-4 px-1">
                  <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                    ✓ {summary.conformes} conforme{summary.conformes > 1 ? "s" : ""}
                  </Badge>
                  {summary.manquants > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      ↓ {summary.manquants} manquant{summary.manquants > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {summary.surplus > 0 && (
                    <Badge variant="outline" className="border-blue-500 text-blue-600 text-xs">
                      ↑ {summary.surplus} surplus
                    </Badge>
                  )}
                  {summary.perteTotale > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Perte : {formatCurrency(summary.perteTotale)}
                    </Badge>
                  )}
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-center">Théorique</TableHead>
                      <TableHead className="text-center">Compté</TableHead>
                      <TableHead className="text-center">Écart</TableHead>
                      <TableHead className="text-right">Perte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: any) => {
                      const prod = produits.find((p) => p.id === item.produit_id);
                      const ecart = item.stock_physique - item.stock_theorique;
                      const perte = ecart < 0 ? Math.abs(ecart) * (prod?.prix_vente || 0) : 0;

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium">
                            {prod?.nom || "—"}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {item.stock_theorique}
                          </TableCell>
                          <TableCell className="text-center text-sm font-semibold">
                            {item.stock_physique}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={ecart === 0 ? "outline" : ecart < 0 ? "destructive" : "secondary"}
                              className={
                                ecart === 0
                                  ? "border-green-500 text-green-600"
                                  : ecart > 0
                                  ? "border-blue-500 text-blue-600 bg-blue-50"
                                  : ""
                              }
                            >
                              {ecart > 0 ? `+${ecart}` : ecart}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {perte > 0 ? (
                              <span className="text-destructive font-semibold">
                                {formatCurrency(perte)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
