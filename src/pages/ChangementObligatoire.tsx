import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function ChangementObligatoire() {
  const { updatePassword, user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    if (error) {
      toast.error("Erreur lors du changement de mot de passe.");
      setLoading(false);
      return;
    }

    // Update must_change_password to false
    await supabase
      .from("profiles" as any)
      .update({ must_change_password: false } as any)
      .eq("user_id", user!.id);

    toast.success("Mot de passe mis à jour avec succès !");
    // Redirect to home
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Changement de mot de passe obligatoire</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Pour votre sécurité, veuillez choisir un nouveau mot de passe avant de continuer.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-pass">Nouveau mot de passe</Label>
              <Input
                id="new-pass"
                type="password"
                placeholder="Au moins 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pass">Confirmer le mot de passe</Label>
              <Input
                id="confirm-pass"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={loading || !password || !confirm} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
