import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users } from "lucide-react";

export default function DashboardProprietaire() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Mon Réseau" subtitle="Gérez vos boutiques et vos gérants" />

      {/* Section Mes Boutiques */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5 text-primary" />
            Mes Boutiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              Aucune boutique pour le moment.
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Cette section vous permettra de gérer vos différentes boutiques.
            </p>
          </div>
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
            <p className="text-muted-foreground text-sm">
              Aucun gérant pour le moment.
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Vous pourrez ajouter des gérants pour vos boutiques ici.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
