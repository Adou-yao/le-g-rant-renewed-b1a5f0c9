import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Users, Plus, MapPin, Phone, Tag, Settings, Pencil } from "lucide-react";
import { useShops } from "@/hooks/useShops";
import { ShopFormModal } from "@/components/ShopFormModal";
import type { Shop } from "@/hooks/useShops";
import { toast } from "sonner";

export default function DashboardProprietaire() {
  const { shops, isLoading, addShop, updateShop } = useShops();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const handleSubmit = async (data: { nom: string; localisation: string; whatsapp: string; type_commerce: string }) => {
    try {
      if (editingShop) {
        await updateShop.mutateAsync({ id: editingShop.id, ...data });
        toast.success("Boutique modifiée avec succès !");
      } else {
        await addShop.mutateAsync(data);
        toast.success("Félicitations ! Votre nouvelle boutique est prête à enregistrer des ventes 🎉");
      }
      setModalOpen(false);
      setEditingShop(null);
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
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
                    <div>
                      <h3 className="font-semibold text-foreground text-base leading-tight">{shop.nom}</h3>
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <Tag className="h-3 w-3" />
                        {shop.type_commerce}
                      </span>
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Mes Gérants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Aucun gérant pour le moment.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Vous pourrez ajouter des gérants pour vos boutiques ici.</p>
          </div>
        </CardContent>
      </Card>

      <ShopFormModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingShop(null); }}
        onSubmit={handleSubmit}
        isSubmitting={addShop.isPending || updateShop.isPending}
        editShop={editingShop}
      />
    </div>
  );
}
