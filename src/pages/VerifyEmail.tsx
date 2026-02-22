import { useLocation, useNavigate } from "react-router-dom";
import { Store, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-6">
      <div className="flex flex-col items-center text-center max-w-sm animate-fade-in">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-primary/60 opacity-20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-xl flex items-center justify-center">
            <Store className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
          </div>
        </div>

        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold font-display text-foreground mb-3">
          Vérifiez votre boîte mail
        </h1>

        <p className="text-muted-foreground mb-2 leading-relaxed">
          Un email de confirmation a été envoyé à
        </p>

        {email && (
          <p className="text-primary font-semibold mb-4">{email}</p>
        )}

        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Cliquez sur le lien dans l'email pour activer votre compte. Si vous ne le trouvez pas, vérifiez vos spams.
        </p>

        <Button
          variant="outline"
          onClick={() => navigate("/auth")}
          className="rounded-2xl h-12 px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la connexion
        </Button>
      </div>
    </div>
  );
}
