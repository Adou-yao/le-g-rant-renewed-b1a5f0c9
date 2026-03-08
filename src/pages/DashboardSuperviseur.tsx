import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShops } from "@/hooks/useShops";
import { useManagers } from "@/hooks/useManagers";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SupervisionBadge } from "@/components/ui/SupervisionBadge";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Activity,
  Store,
  Users,
  PackageX,
  ShieldCheck,
  Clock,
  PackagePlus,
  Plus,
} from "lucide-react";
import { ReapprovisionnementModal } from "@/components/ReapprovisionnementModal";
import { CreateProductModal } from "@/components/CreateProductModal";
import { useOwnerTransfers } from "@/hooks/useStockTransfers";
import { InventaireReports } from "@/components/InventaireReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ManagerVente {
  id: string;
  montant_total: number;
  nom_produit: string | null;
  date_vente: string;
  user_id: string;
  quantite: number;
  produit_id: string | null;
  mode_paiement: string;
}

interface ManagerProduit {
  id: string;
  nom: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  user_id: string;
}

interface ManagerDette {
  id: string;
  nom_client: string;
  montant_du: number;
  payee: boolean;
  user_id: string;
}

const chartConfig: ChartConfig = {
  ventes: {
    label: "Ventes",
    color: "hsl(var(--chart-1))",
  },
};

export default function DashboardSuperviseur() {
  const { user } = useAuth();
  const { shops } = useShops();
  const { managers } = useManagers();
  const [selectedShop, setSelectedShop] = useState<string>("all");
  const [restockProduct, setRestockProduct] = useState<any>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);

  const { data: ownerTransfers = [] } = useOwnerTransfers();
  const managerIds = useMemo(() => managers.map((m) => m.manager_id), [managers]);

  // Fetch all managers' sales
  const { data: allVentes = [] } = useQuery({
    queryKey: ["superviseur-ventes", managerIds],
    queryFn: async () => {
      if (managerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("ventes")
        .select("id, montant_total, nom_produit, date_vente, user_id, quantite, produit_id, mode_paiement")
        .in("user_id", managerIds)
        .order("date_vente", { ascending: false });
      if (error) throw error;
      return data as ManagerVente[];
    },
    enabled: managerIds.length > 0,
  });

  // Fetch all managers' products
  const { data: allProduits = [] } = useQuery({
    queryKey: ["superviseur-produits", managerIds],
    queryFn: async () => {
      if (managerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("produits")
        .select("id, nom, prix_achat, prix_vente, stock_actuel, user_id")
        .in("user_id", managerIds);
      if (error) throw error;
      return data as ManagerProduit[];
    },
    enabled: managerIds.length > 0,
  });

  // Fetch all managers' debts
  const { data: allDettes = [] } = useQuery({
    queryKey: ["superviseur-dettes", managerIds],
    queryFn: async () => {
      if (managerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("dettes")
        .select("id, nom_client, montant_du, payee, user_id")
        .in("user_id", managerIds)
        .eq("payee", false);
      if (error) throw error;
      return data as ManagerDette[];
    },
    enabled: managerIds.length > 0,
  });

  // Filter by shop
  const getManagerIdsForShop = (shopId: string) => {
    if (shopId === "all") return managerIds;
    return managers.filter((m) => m.shop_id === shopId).map((m) => m.manager_id);
  };

  const filteredManagerIds = useMemo(() => getManagerIdsForShop(selectedShop), [selectedShop, managers]);

  const filteredVentes = useMemo(
    () => allVentes.filter((v) => filteredManagerIds.includes(v.user_id)),
    [allVentes, filteredManagerIds]
  );

  const filteredProduits = useMemo(
    () => allProduits.filter((p) => filteredManagerIds.includes(p.user_id)),
    [allProduits, filteredManagerIds]
  );

  const filteredDettes = useMemo(
    () => allDettes.filter((d) => filteredManagerIds.includes(d.user_id)),
    [allDettes, filteredManagerIds]
  );

  // KPIs
  const chiffreAffaires = filteredVentes.reduce((sum, v) => sum + v.montant_total, 0);
  const margeNette = filteredVentes.reduce((sum, v) => {
    const produit = allProduits.find((p) => p.id === v.produit_id);
    if (produit) return sum + (produit.prix_vente - produit.prix_achat) * v.quantite;
    return sum;
  }, 0);
  const nbVentes = filteredVentes.length;
  const totalDettes = filteredDettes.reduce((sum, d) => sum + d.montant_du, 0);

  // Last 10 sales
  const dernieresVentes = filteredVentes.slice(0, 10);

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayVentes = filteredVentes.filter((v) => v.date_vente.startsWith(dateStr));
      const total = dayVentes.reduce((sum, v) => sum + v.montant_total, 0);
      data.push({
        jour: new Intl.DateTimeFormat("fr-CI", { weekday: "short" }).format(date),
        ventes: total,
      });
    }
    return data;
  }, [filteredVentes]);

  // Low stock products
  const lowStockProduits = filteredProduits.filter((p) => p.stock_actuel < 5);

  // Helper: get manager name from user_id
  const getManagerName = (userId: string) => {
    const m = managers.find((mg) => mg.manager_id === userId);
    return m?.manager_name || "—";
  };

  // Helper: get shop name from manager user_id
  const getShopFromManager = (userId: string) => {
    const m = managers.find((mg) => mg.manager_id === userId);
    if (!m) return "—";
    const shop = shops.find((s) => s.id === m.shop_id);
    return shop?.nom || "—";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(amount);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-CI", { hour: "2-digit", minute: "2-digit" }).format(d);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-CI", { day: "2-digit", month: "short" }).format(d);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-32">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display text-foreground">Tableau de Supervision</h1>
            <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de votre réseau de boutiques</p>
          </div>
          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <Store className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sélectionner une boutique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout le Réseau</SelectItem>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SupervisionBadge />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="inventaires">Rapports d'Inventaire</TabsTrigger>
        </TabsList>

        <TabsContent value="inventaires" className="mt-4">
          <InventaireReports
            managers={managers}
            shops={shops}
            produits={allProduits}
          />
        </TabsContent>

        <TabsContent value="overview" className="mt-4 space-y-6">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Chiffre d'Affaires"
          value={formatCurrency(chiffreAffaires)}
          icon={DollarSign}
          variant="primary"
          delay={0}
        />
        <StatCard
          label="Marge Nette"
          value={formatCurrency(margeNette)}
          icon={TrendingUp}
          variant="success"
          delay={100}
        />
        <StatCard
          label="Nombre de Ventes"
          value={nbVentes}
          icon={ShoppingCart}
          variant="default"
          delay={200}
        />
        <StatCard
          label="Dettes en Cours"
          value={formatCurrency(totalDettes)}
          icon={AlertTriangle}
          variant="destructive"
          delay={300}
        />
      </div>

      {/* Live Feed */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Flux en Direct — 10 Dernières Ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dernieresVentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune vente enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Boutique</TableHead>
                    <TableHead>Gérant</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dernieresVentes.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-muted-foreground text-xs">{formatDate(v.date_vente)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{formatTime(v.date_vente)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{getShopFromManager(v.user_id)}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{getManagerName(v.user_id)}</TableCell>
                      <TableCell className="text-sm">{v.nom_produit || "—"}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">{formatCurrency(v.montant_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Performance des 7 Derniers Jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="jour" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="ventes"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      {/* Full Stock Table with Restock + Delivery Status */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PackagePlus className="h-4 w-4 text-primary" />
            Stocks &amp; Réapprovisionnement
            {lowStockProduits.length > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {lowStockProduits.length} alerte{lowStockProduits.length > 1 ? "s" : ""}
              </Badge>
            )}
            <Button size="sm" variant="outline" className="ml-auto text-xs" onClick={() => setShowCreateProduct(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Nouveau Produit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProduits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun produit trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Boutique</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Statut Livraison</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProduits.map((p) => {
                    const manager = managers.find((m) => m.manager_id === p.user_id);
                    const pendingTransfer = ownerTransfers.find(
                      (t) => t.produit_id === p.id && t.statut === "en_attente"
                    );
                    const lastConfirmed = ownerTransfers.find(
                      (t) => t.produit_id === p.id && t.statut === "reçu"
                    );
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{p.nom}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(p.prix_vente)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{getShopFromManager(p.user_id)}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={p.stock_actuel < 5 ? "destructive" : "secondary"}>
                            {p.stock_actuel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {pendingTransfer ? (
                            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                              ⏳ {pendingTransfer.source === 'initial' ? 'Stock initial' : 'Réappro.'} en attente ({pendingTransfer.quantite})
                            </Badge>
                          ) : lastConfirmed ? (
                            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                              ✓ {lastConfirmed.source === 'initial' ? 'Initial reçu' : 'Reçu'}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!pendingTransfer || !manager}
                            onClick={() =>
                              setRestockProduct({
                                ...p,
                                managerId: manager?.manager_id,
                                shopId: manager?.shop_id,
                              })
                            }
                            className="text-xs"
                          >
                            <PackagePlus className="h-3.5 w-3.5 mr-1" />
                            Réapprovisionner
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Staff Status */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Statut du Personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {managers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucun gérant assigné.</p>
            ) : (
              <div className="space-y-2">
                {managers.map((m) => {
                  const shop = shops.find((s) => s.id === m.shop_id);
                  return (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${m.is_active ? "bg-accent animate-pulse" : "bg-muted-foreground/30"}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{m.manager_name}</p>
                          <p className="text-xs text-muted-foreground">{shop?.nom || "—"}</p>
                        </div>
                      </div>
                      <Badge variant={m.is_active ? "default" : "secondary"} className="shrink-0 text-[10px]">
                        {m.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer certification */}
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground/60">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Données certifiées et protégées contre toute modification manuelle</span>
      </div>

        </TabsContent>
      </Tabs>

      {/* Restock Modal */}
      {restockProduct && user && (
        <ReapprovisionnementModal
          open={!!restockProduct}
          onOpenChange={(open) => !open && setRestockProduct(null)}
          produit={restockProduct}
          ownerId={user.id}
          managerId={restockProduct.managerId}
          shopId={restockProduct.shopId}
        />
      )}
    </div>
  );
}
