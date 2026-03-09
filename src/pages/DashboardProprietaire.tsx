import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Users, Plus, MapPin, Phone, Tag, Settings, Pencil, UserX, UserCheck, Trash2, Clock, CreditCard } from "lucide-react";
import { useShops } from "@/hooks/useShops";
import { useManagers } from "@/hooks/useManagers";
import { ShopFormModal } from "@/components/ShopFormModal";
import { ManagerFormModal } from "@/components/ManagerFormModal";
import type { Shop } from "@/hooks/useShops";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export default function DashboardProprietaire() {
  const { shops, isLoading, addShop, updateShop } = useShops();
  const { managers, isLoading: managersLoading, createManager, toggleManagerActive, deleteManager } = useManagers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [managerModalOpen, setManagerModalOpen] = useState(false);

  const handleSubmit = async (data: { nom: string; localisation: string; whatsapp: string; type_commerce: string; logoFile?: File | null }) => {
    try {
      const { logoFile, ...rest } = data;
      if (editingShop) {
        await updateShop.mutateAsync({ id: editingShop.id, logoFile, ...rest });
        toast.success("Boutique modifiée avec succès !");
      } else {
        await addShop.mutateAsync({ ...rest, logo_url: null, logoFile });
        toast.success("Félicitations ! Votre nouvelle boutique est prête à enregistrer des ventes 🎉");
      }
      setModalOpen(false);
      setEditingShop(null);
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const handleCreateManager = async (data: { full_name: string; whatsapp: string; email: string; password: string; shop_id: string }) => {
    try {
      const result = await createManager.mutateAsync(data);
      toast.success(`Gérant ${data.full_name} créé avec succès !`);
      return result;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création du gérant.");
      throw err;
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleManagerActive.mutateAsync({ id, is_active: !currentActive });
      toast.success(currentActive ? "Accès désactivé." : "Accès réactivé.");
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const openEdit = (shop: Shop) => {
    setEditingShop(shop);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingShop(null);
    setModalOpen(true);
  };

  const getShopName = (shopId: string) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop?.nom || "—";
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Mon Réseau" subtitle="Gérez vos boutiques et vos gérants" />

      {/* Section Mes Boutiques */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-primary" />
              Mes Boutiques
            </CardTitle>
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : shops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Aucune boutique pour le moment.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Cliquez sur "Ajouter" pour créer votre première boutique.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {shops.map((shop) => (
                <Card key={shop.id} className="border-border/40 bg-muted/30 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt={shop.nom} className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-6 w-6 text-primary/50" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-base leading-tight truncate">{shop.nom}</h3>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Tag className="h-3 w-3" />
                          {shop.type_commerce}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{shop.localisation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{shop.whatsapp}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="default" className="flex-1 gap-1.5 text-xs">
                        <Settings className="h-3.5 w-3.5" />
                        Gérer
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => openEdit(shop)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Modifier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Mes Gérants */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Mes Gérants
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setManagerModalOpen(true)}
              className="gap-1.5"
              disabled={shops.length === 0}
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {managersLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Aucun gérant pour le moment.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                {shops.length === 0
                  ? "Créez d'abord une boutique avant d'ajouter un gérant."
                  : "Cliquez sur \"Ajouter\" pour créer votre premier gérant."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Boutique</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.manager_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.manager_whatsapp ? (
                          <a
                            href={`https://wa.me/${m.manager_whatsapp.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            {m.manager_whatsapp}
                          </a>
                        ) : "—"}
                      </TableCell>
                      <TableCell>{getShopName(m.shop_id)}</TableCell>
                      <TableCell>
                        <Badge variant={m.is_active ? "default" : "secondary"}>
                          {m.is_active ? "Actif" : "Désactivé"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant={m.is_active ? "destructive" : "outline"}
                            onClick={() => handleToggleActive(m.id, m.is_active)}
                            className="gap-1.5 text-xs"
                            disabled={toggleManagerActive.isPending}
                          >
                            {m.is_active ? (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                Réactiver
                              </>
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce gérant ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Le gérant <strong>{m.manager_name}</strong> sera supprimé définitivement. Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    deleteManager.mutate(m.id, {
                                      onSuccess: () => toast.success("Gérant supprimé"),
                                      onError: () => toast.error("Erreur lors de la suppression"),
                                    });
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ShopFormModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingShop(null); }}
        onSubmit={handleSubmit}
        isSubmitting={addShop.isPending || updateShop.isPending}
        editShop={editingShop}
      />

      <ManagerFormModal
        open={managerModalOpen}
        onOpenChange={setManagerModalOpen}
        onSubmit={handleCreateManager}
        isSubmitting={createManager.isPending}
        shops={shops}
      />
    </div>
  );
}
